"""
OptiFin API — Optimise Router
POST /optimise     — submit a transaction, get the best payment plan
POST /optimise/batch — run multiple transactions at once
"""

import sys
import os
from datetime import date
from fastapi import APIRouter, HTTPException

# Make the optimisation module importable from any working directory
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from api.database import get_user_by_id, commit_transaction
from api.logger import get_logger
from api.models import TransactionRequest, OptimisationResponse
from optimisation.optimisation_model import optimize_payment

log = get_logger("api.routers.optimise")

router = APIRouter(prefix="/optimise", tags=["Optimisation"])


def _wrap_user_for_engine(user: dict) -> dict:
    """
    The optimisation engine expects user_data to have a top-level 'user' key
    with profile/preferences nested inside. fake_users_db stores each user as
    a flat object. This function adapts the flat DB record to the engine format.
    """
    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "primary_debit_id": user["primary_debit_id"],
            "monthly_income": user.get("monthly_income", 0),
            "income_day_of_month": user.get("income_day_of_month", 25),
            "preferences": user.get("preferences", {
                "max_credit_utilization": 0.30,
                "always_pay_credit_in_full": True,
                "optimization_goal": "maximize_eom_cash",
            }),
        },
        "debit_accounts": user.get("debit_accounts", []),
        "credit_cards": user.get("credit_cards", []),
        "backup_international_cards": user.get("backup_international_cards", []),
    }

DECISION_LABELS = {
    "pass_through":           "Pass-through — no optimisation needed",
    "credit_optimised":       "Auto-Optimised → Best credit card selected",
    "split":                  "Split allocation across multiple sources",
    "fallback_international": "International card used as backup",
}


@router.post(
    "/",
    response_model=OptimisationResponse,
    summary="Optimise a single payment",
    description="""
Submit a transaction for a given user and receive the optimal payment allocation.

The engine:
1. Computes **effective available credit/balance** per card (after reserving pending auto-debits)
2. Runs a **Linear Programme** to maximise end-of-month cash in hand
3. Returns the allocation across cards, with cashback earned, interest opportunity cost, and net EOM benefit

**Card Tiers:**
- **Tier 1 (Credit cards):** Earns cashback. Debit balance stays intact and earns savings interest during grace period.
- **Tier 2 (Debit accounts):** Opportunity cost = saved savings interest lost. Higher-rate savings drained last.
- **Tier 3 (Backup international):** Last resort only. FX spread + flat fee.
    """,
)
def optimise_payment(request: TransactionRequest):
    user = get_user_by_id(request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{request.user_id}' not found.")

    # Build transaction dict compatible with the optimisation engine
    txn = {
        "id": None,
        "description": request.description or request.merchant or "Transaction",
        "amount": request.amount,
        "currency": request.currency.upper(),
        "category": request.category,
        "merchant": request.merchant,
    }

    today = request.transaction_date or date.today()

    result = optimize_payment(
        transaction=txn,
        user_data=_wrap_user_for_engine(user),
        today=today,
        verbose=False,
    )

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    # Optionally commit balances to the runtime DB
    updated_balances = None
    if request.commit:
        try:
            updated_balances = commit_transaction(user["id"], result["allocation"])
            log.info("COMMITTED transaction for user=%s", user["id"])
        except Exception as e:
            log.error("COMMIT FAILED for user=%s: %s", user["id"], e)
            raise HTTPException(status_code=500, detail=f"Balance commit failed: {e}")

    return OptimisationResponse(
        user_id=user["id"],
        user_name=user["name"],
        transaction_id=result.get("transaction_id"),
        description=result.get("description"),
        amount_original=result["amount_original"],
        currency=result["currency"],
        amount_gbp=result["amount_gbp"],
        category=result["category"],
        merchant=request.merchant,
        decision=result["decision"],
        decision_label=DECISION_LABELS.get(result["decision"], result["decision"]),
        ui_hints=result["ui_hints"],
        allocation=result["allocation"],
        eom_impact=result["eom_impact"],
        savings_interest_context=result["savings_interest_context"],
        updated_balances=updated_balances,
    )


@router.post(
    "/batch",
    summary="Optimise multiple transactions at once",
    description="Submit a list of transactions for the same user. Useful for simulating a full month of spending.",
)
def optimise_batch(user_id: str, transactions: list[TransactionRequest]):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    results = []
    for req in transactions:
        req.user_id = user_id
        txn = {
            "id": None,
            "description": req.description or req.merchant or "Transaction",
            "amount": req.amount,
            "currency": req.currency.upper(),
            "category": req.category,
            "merchant": req.merchant,
        }
        today = req.transaction_date or date.today()
        result = optimize_payment(txn, _wrap_user_for_engine(user), today=today, verbose=False)

        if "error" in result:
            results.append({"error": result["error"], "transaction": txn})
        else:
            results.append({
                "description": result["description"],
                "amount_gbp": result["amount_gbp"],
                "decision": result["decision"],
                "decision_label": DECISION_LABELS.get(result["decision"], result["decision"]),
                "primary_card": result["allocation"][0]["card_name"] if result["allocation"] else None,
                "net_eom_benefit": result["eom_impact"]["net_eom_benefit"],
                "allocation": result["allocation"],
            })

    total_net = sum(r.get("net_eom_benefit", 0) for r in results if "net_eom_benefit" in r)
    total_cashback = sum(
        r.get("allocation", [{}])[0].get("cashback_earned", 0)
        for r in results if r.get("allocation")
    )

    return {
        "user_id": user_id,
        "user_name": user["name"],
        "transactions_processed": len(results),
        "total_net_eom_benefit": round(total_net, 4),
        "total_cashback_estimate": round(total_cashback, 4),
        "results": results,
    }
