"""
OptiFin API — Database Helper
Loads and serves the fake multi-user database.

Two-file pattern:
  - fake_users_db.json  : original seed data (never mutated)
  - runtime_db.json     : live copy that gets updated as transactions commit
                          Reset via POST /db/reset
"""

import json
import os
import shutil
from typing import Optional

from api.logger import get_logger

log = get_logger("api.database")

DATA_DIR      = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SEED_DB_PATH  = os.path.join(DATA_DIR, "fake_users_db.json")
RUNTIME_DB_PATH = os.path.join(DATA_DIR, "runtime_db.json")


def _ensure_runtime_db():
    """On first access, copy seed → runtime if runtime doesn't exist."""
    if not os.path.exists(RUNTIME_DB_PATH):
        shutil.copy2(SEED_DB_PATH, RUNTIME_DB_PATH)
        log.info("Runtime DB initialised from seed data.")


def _load_db() -> dict:
    _ensure_runtime_db()
    with open(RUNTIME_DB_PATH, "r") as f:
        return json.load(f)


def _save_db(db: dict):
    with open(RUNTIME_DB_PATH, "w") as f:
        json.dump(db, f, indent=2)


def reset_db() -> dict:
    """Overwrite runtime_db.json with the original seed data."""
    shutil.copy2(SEED_DB_PATH, RUNTIME_DB_PATH)
    log.info("Runtime DB reset to seed data.")
    return _load_db()


def get_all_users() -> list:
    return _load_db()["users"]


def get_user_by_id(user_id: str) -> Optional[dict]:
    for user in get_all_users():
        if user["id"] == user_id:
            return user
    return None


def get_user_cards_summary(user_id: str) -> Optional[dict]:
    user = get_user_by_id(user_id)
    if not user:
        return None
    return {
        "user_id": user["id"],
        "name": user["name"],
        "debit_accounts": user["debit_accounts"],
        "credit_cards": user["credit_cards"],
        "backup_international_cards": user["backup_international_cards"],
    }


def commit_transaction(user_id: str, allocation: list) -> dict:
    """
    Apply an optimised allocation to the runtime DB balances.

    For each allocation item:
      - Tier 1 (Credit card): current_balance += amount_gbp
      - Tier 2 (Debit account): balance -= amount_gbp
      - Tier 3 (Intl backup): balance_local -= amount_gbp

    Returns the updated balances snapshot for the UI.
    """
    db = _load_db()

    # Find user index
    user_idx = next(
        (i for i, u in enumerate(db["users"]) if u["id"] == user_id), None
    )
    if user_idx is None:
        raise ValueError(f"User '{user_id}' not found in runtime DB")

    user = db["users"][user_idx]
    changes = []

    for item in allocation:
        card_id = item["card_id"]
        amount  = item["amount_gbp"]
        tier    = item["tier"]

        if tier == 1:  # Credit card — balance goes up (more owed)
            for card in user["credit_cards"]:
                if card["id"] == card_id:
                    old = card["current_balance"]
                    card["current_balance"] = round(old + amount, 2)
                    changes.append({
                        "card_id":   card_id,
                        "card_name": card["name"],
                        "tier":      "credit",
                        "field":     "current_balance",
                        "before":    round(old, 2),
                        "after":     card["current_balance"],
                        "delta":     round(+amount, 2),
                    })
                    log.info("COMMIT | Credit %-24s | balance £%.2f → £%.2f  (+£%.2f charged)",
                             card["name"], old, card["current_balance"], amount)
                    break

        elif tier == 2:  # Debit account — balance goes down
            for acc in user["debit_accounts"]:
                if acc["id"] == card_id:
                    old = acc["balance"]
                    acc["balance"] = round(old - amount, 2)
                    changes.append({
                        "card_id":   card_id,
                        "card_name": acc["name"],
                        "tier":      "debit",
                        "field":     "balance",
                        "before":    round(old, 2),
                        "after":     acc["balance"],
                        "delta":     round(-amount, 2),
                    })
                    log.info("COMMIT | Debit  %-24s | balance £%.2f → £%.2f  (-£%.2f spent)",
                             acc["name"], old, acc["balance"], amount)
                    break

        elif tier == 3:  # International backup — local balance goes down
            for card in user["backup_international_cards"]:
                if card["id"] == card_id:
                    old = card.get("balance_local", 0)
                    card["balance_local"] = round(old - amount, 2)
                    card["balance_gbp_approx"] = card["balance_local"]
                    changes.append({
                        "card_id":   card_id,
                        "card_name": card["name"],
                        "tier":      "international",
                        "field":     "balance_local",
                        "before":    round(old, 2),
                        "after":     card["balance_local"],
                        "delta":     round(-amount, 2),
                    })
                    log.info("COMMIT | Intl   %-24s | balance £%.2f → £%.2f  (-£%.2f spent)",
                             card["name"], old, card["balance_local"], amount)
                    break

    _save_db(db)

    # Return updated snapshot of user balances for the UI
    updated_user = db["users"][user_idx]
    return {
        "changes": changes,
        "updated_snapshot": {
            "debit_accounts": [
                {"id": a["id"], "name": a["name"], "balance": a["balance"]}
                for a in updated_user["debit_accounts"]
            ],
            "credit_cards": [
                {
                    "id": c["id"],
                    "name": c["name"],
                    "current_balance": c["current_balance"],
                    "credit_limit": c["credit_limit"],
                    "available_credit": round(c["credit_limit"] - c["current_balance"], 2),
                }
                for c in updated_user["credit_cards"]
            ],
            "backup_international_cards": [
                {"id": c["id"], "name": c["name"], "balance_gbp_approx": c.get("balance_gbp_approx", 0)}
                for c in updated_user["backup_international_cards"]
            ],
        }
    }
