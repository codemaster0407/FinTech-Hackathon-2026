"""
OptiFin API — DB Management Router
POST /db/reset       — reset runtime_db.json back to seed data
GET  /db/status      — show current balances for all users
"""

from fastapi import APIRouter
from api.database import reset_db, get_all_users
from api.logger import get_logger

log = get_logger("api.routers.db")
router = APIRouter(prefix="/db", tags=["Database"])


@router.post("/reset", summary="Reset runtime DB to original seed data")
def db_reset():
    """
    Wipes all committed transactions and restores every user's balances
    to the original values in fake_users_db.json.

    Call this between demo runs to start fresh.
    """
    db = reset_db()
    users = db["users"]

    log.info("DB RESET — restored %d users to seed balances", len(users))

    return {
        "status": "ok",
        "message": f"Runtime DB reset. {len(users)} users restored to original balances.",
        "users_reset": [u["id"] for u in users],
    }


@router.get("/status", summary="Show current balances for all users")
def db_status():
    """
    Returns a lightweight snapshot of every user's current balances
    from the runtime DB — useful for checking state before/after transactions.
    """
    users = get_all_users()
    snapshot = []

    for user in users:
        snapshot.append({
            "user_id": user["id"],
            "name": user["name"],
            "debit_accounts": [
                {
                    "id":      acc["id"],
                    "name":    acc["name"],
                    "balance": acc["balance"],
                }
                for acc in user.get("debit_accounts", [])
            ],
            "credit_cards": [
                {
                    "id":               card["id"],
                    "name":             card["name"],
                    "current_balance":  card["current_balance"],
                    "credit_limit":     card["credit_limit"],
                    "available_credit": round(card["credit_limit"] - card["current_balance"], 2),
                }
                for card in user.get("credit_cards", [])
            ],
            "backup_international_cards": [
                {
                    "id":                 card["id"],
                    "name":               card["name"],
                    "balance_gbp_approx": card.get("balance_gbp_approx", 0),
                }
                for card in user.get("backup_international_cards", [])
            ],
        })

    return {"users": snapshot}
