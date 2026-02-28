from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum

class CardType(str, Enum):
    DEBIT = "debit"
    CREDIT = "credit"
    INTERNATIONAL = "international"

class Sector(str, Enum):
    HOTEL = "hotel"
    TRAVEL = "travel"
    GROCERY = "grocery"
    SHOPPING = "shopping"
    FUEL = "fuel"
    GENERAL = "general"

class OptimizationMode(str, Enum):
    BALANCED = "balanced"
    INTEREST_ONLY = "interest_only"

class CardBase(BaseModel):
    id: str
    name: str
    type: CardType
    monthly_spend_limit: float
    current_balance: float

class DebitCard(CardBase):
    annual_interest_rate: float  # e.g., 0.05 for 5%

class CreditCard(CardBase):
    cashback_rates: Dict[Sector, float]  # e.g., {"hotel": 0.03, ...}

class InternationalCard(CardBase):
    markup_rate: float  # e.g., 0.06 for 6%
    gbp_conversion: float # 122.5 (1 GBP = 122.5 INR)

class UserPreferences(BaseModel):
    point_priority: List[Sector]

class TransactionRequest(BaseModel):
    amount: float
    category: Sector

class Allocation(BaseModel):
    card_id: str
    card_name: str
    amount_utilised: float
    interest_saved: float = 0.0
    cashback_points: float = 0.0
    cashback_sector: Optional[Sector] = None

class TransactionResponse(BaseModel):
    allocations: List[Allocation]
    explanation: Optional[str] = None
    total_amount: float
    status: str = "success"

class UpdateLimitRequest(BaseModel):
    card_id: str
    new_limit: float

class TotalBalanceResponse(BaseModel):
    total_debit_balance: float
    total_credit_balance: float
    total_gbp_balance: float
