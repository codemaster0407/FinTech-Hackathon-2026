"""
OptiFin API — Users Router
GET /users                — list all users (lightweight)
GET /users/{user_id}      — full user profile
GET /users/{user_id}/cards — user's cards & accounts only
"""

from fastapi import APIRouter, HTTPException
from api.database import get_all_users, get_user_by_id
from api.models import UserSummary

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", summary="List all users")
def list_users():
    """Returns a lightweight list of all users in the fake database."""
    users = get_all_users()
    return [
        {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "num_debit_accounts": len(u.get("debit_accounts", [])),
            "num_credit_cards": len(u.get("credit_cards", [])),
            "num_backup_cards": len(u.get("backup_international_cards", [])),
            "monthly_income": u.get("monthly_income"),
        }
        for u in users
    ]


@router.get("/{user_id}", summary="Get full user profile")
def get_user(user_id: str):
    """Returns the full user profile including all cards and preferences."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    # Enrich credit cards with computed available credit
    enriched_cards = []
    for card in user.get("credit_cards", []):
        enriched = dict(card)
        enriched["available_credit"] = card["credit_limit"] - card["current_balance"]
        enriched_cards.append(enriched)

    return {**user, "credit_cards": enriched_cards}


@router.get("/{user_id}/cards", summary="Get user's cards summary")
def get_user_cards(user_id: str):
    """Returns just the card/account inventory for a user (useful for UI card selection)."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    debit_total = sum(a["balance"] for a in user.get("debit_accounts", []))
    credit_available = sum(
        c["credit_limit"] - c["current_balance"]
        for c in user.get("credit_cards", [])
    )
    intl_total_gbp = sum(
        c.get("balance_gbp_approx", 0)
        for c in user.get("backup_international_cards", [])
    )

    return {
        "user_id": user["id"],
        "name": user["name"],
        "total_debit_balance_gbp": round(debit_total, 2),
        "total_credit_available_gbp": round(credit_available, 2),
        "total_international_gbp_approx": round(intl_total_gbp, 2),
        "grand_total_liquidity_gbp": round(debit_total + credit_available + intl_total_gbp, 2),
        "debit_accounts": [
            {
                "id": a["id"],
                "name": a["name"],
                "type": a["type"],
                "balance": a["balance"],
                "currency": a["currency"],
                "is_primary": a["is_primary"],
                "savings_interest_rate_annual": a["savings_interest_rate_annual"],
                "auto_debits_count": len(a.get("auto_debits", [])),
                "auto_debits_total": round(sum(d["amount"] for d in a.get("auto_debits", [])), 2),
            }
            for a in user.get("debit_accounts", [])
        ],
        "credit_cards": [
            {
                "id": c["id"],
                "name": c["name"],
                "network": c["network"],
                "credit_limit": c["credit_limit"],
                "current_balance": c["current_balance"],
                "available_credit": round(c["credit_limit"] - c["current_balance"], 2),
                "utilization_pct": round(c["current_balance"] / c["credit_limit"] * 100, 1),
                "apr_annual_pct": round(c["apr_annual"] * 100, 2),
                "fx_fee_rate_pct": round(c["fx_fee_rate"] * 100, 2),
                "top_cashback_rate_pct": round(max(c["cashback_rates"].values()) * 100, 2),
            }
            for c in user.get("credit_cards", [])
        ],
        "backup_international_cards": [
            {
                "id": c["id"],
                "name": c["name"],
                "currency": c["currency"],
                "balance_gbp_approx": c.get("balance_gbp_approx", 0),
                "fx_spread_pct": round(c.get("fx_spread_rate", 0) * 100, 2),
                "transfer_fee_flat": c.get("transfer_fee_flat", 0),
                "estimated_transfer_hours": c.get("estimated_transfer_hours", 0),
            }
            for c in user.get("backup_international_cards", [])
        ],
    }
