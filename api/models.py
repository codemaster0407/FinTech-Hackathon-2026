"""
OptiFin API — Pydantic Models
Request and response schemas for all endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


# ─── REQUEST SCHEMAS ─────────────────────────────────────────────────────────

class TransactionRequest(BaseModel):
    """Payload for POST /optimise — a single payment to be optimised."""
    user_id: str = Field(..., description="User identifier", example="usr_001")
    amount: float = Field(..., gt=0, description="Transaction amount", example=112.40)
    currency: str = Field("GBP", description="ISO 4217 currency code", example="GBP")
    category: str = Field(
        "other",
        description="Merchant category: hotel | travel | grocery | online_shopping | fuel_transport | other",
        example="hotel"
    )
    merchant: Optional[str] = Field(None, description="Merchant name", example="Premier Inn")
    description: Optional[str] = Field(None, description="Free-text description")
    transaction_date: Optional[date] = Field(None, description="ISO date (defaults to today)")
    allow_split: bool = Field(True, description="Allow allocation across multiple cards")
    commit: bool = Field(
        False,
        description="If true, deduct amounts from balances in runtime DB and return updated_balances"
    )


# ─── RESPONSE SCHEMAS ─────────────────────────────────────────────────────────

class AutoDebit(BaseModel):
    name: str
    amount: float
    day_of_month: int


class DebitAccountSummary(BaseModel):
    id: str
    name: str
    type: str
    is_primary: bool
    currency: str
    balance: float
    savings_interest_rate_annual: float
    auto_debits: List[AutoDebit]


class CreditCardSummary(BaseModel):
    id: str
    name: str
    network: str
    credit_limit: float
    current_balance: float
    available_credit: float
    apr_annual: float
    annual_fee: float
    cashback_rates: dict
    reward_points_per_pound: Optional[dict] = None
    reward_type: Optional[str] = "cashback"
    badge: Optional[str] = ""
    auto_debits: List[AutoDebit]


class BackupCardSummary(BaseModel):
    id: str
    name: str
    type: str
    country: str
    currency: str
    balance_gbp_approx: float
    fx_spread_rate: float
    transfer_fee_flat: float
    estimated_transfer_hours: int


class UserSummary(BaseModel):
    id: str
    name: str
    email: str
    primary_debit_id: str
    monthly_income: float
    preferences: dict
    debit_accounts: List[DebitAccountSummary]
    credit_cards: List[CreditCardSummary]
    backup_international_cards: List[BackupCardSummary]


class AllocationItem(BaseModel):
    card_id: str
    card_name: str
    tier: int
    tier_label: str
    amount_gbp: float
    cashback_earned: float
    reward_points_earned: int = 0
    reward_type: str = "cashback"
    interest_opportunity_lost: float
    fx_cost: float
    net_benefit: float
    pending_auto_debits_reserved: float
    card_badge: str = ""


class UiHints(BaseModel):
    headline: str
    earn_label: str
    comparison: str
    card_badge: str
    savings_nudge: str
    net_benefit_gbp: float
    total_points_earned: int
    reward_type: str


class EomImpact(BaseModel):
    total_cashback_earned: float
    total_interest_opportunity_lost: float
    total_fx_costs: float
    net_eom_benefit: float


class SavingsInterestContext(BaseModel):
    weighted_avg_savings_rate_annual: float
    weighted_avg_savings_rate_monthly: float
    per_account_monthly_interest: dict
    remaining_monthly_interest_after_txn: float


class BalanceChange(BaseModel):
    card_id: str
    card_name: str
    tier: str
    field: str
    before: float
    after: float
    delta: float


class DebitSnapshot(BaseModel):
    id: str
    name: str
    balance: float


class CreditSnapshot(BaseModel):
    id: str
    name: str
    current_balance: float
    credit_limit: float
    available_credit: float


class IntlSnapshot(BaseModel):
    id: str
    name: str
    balance_gbp_approx: float


class UpdatedSnapshot(BaseModel):
    debit_accounts: List[DebitSnapshot]
    credit_cards: List[CreditSnapshot]
    backup_international_cards: List[IntlSnapshot]


class UpdatedBalances(BaseModel):
    changes: List[BalanceChange]
    updated_snapshot: UpdatedSnapshot


class OptimisationResponse(BaseModel):
    """Full response from POST /optimise."""
    user_id: str
    user_name: str
    transaction_id: Optional[str]
    description: Optional[str]
    amount_original: float
    currency: str
    amount_gbp: float
    category: str
    merchant: Optional[str]
    decision: str
    decision_label: str
    ui_hints: UiHints
    allocation: List[AllocationItem]
    eom_impact: EomImpact
    savings_interest_context: SavingsInterestContext
    updated_balances: Optional[UpdatedBalances] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
