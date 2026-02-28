# Pyomo based optimizer for strict allocation

from typing import List
from pyomo.environ import ConcreteModel, Var, NonNegativeReals, Constraint, Objective, SolverFactory, value

from api.models import (
    DebitCard,
    CreditCard,
    InternationalCard,
    UserPreferences,
    Sector,
    Allocation,
    TransactionResponse,
    TransactionRequest,
)

class CardOptimizer:
    """Optimises card allocations using a linear programming model (Pyomo).

    The model respects card limits, balances, and mode‑specific objectives:
    * **General / interest_only mode** – maximise total interest saved (preserve high‑yield funds).
    * **Other modes (balanced, etc.)** – maximise a combined benefit of cashback and interest saved.
    """

    def __init__(
        self,
        debit_cards: List[DebitCard],
        credit_cards: List[CreditCard],
        international_cards: List[InternationalCard],
        preferences: UserPreferences,
    ):
        # Store cards sorted for deterministic ordering
        self.debit_cards = sorted(debit_cards, key=lambda x: x.id)
        self.credit_cards = sorted(credit_cards, key=lambda x: x.id)
        self.international_cards = sorted(international_cards, key=lambda x: x.id)
        self.preferences = preferences

    def _best_debit_rate(self) -> float:
        """Return the highest annual interest rate among debit cards (used as the reference
        rate for credit‑card interest‑preservation calculations)."""
        if not self.debit_cards:
            return 0.0
        return max(dc.annual_interest_rate for dc in self.debit_cards)

    def _prepare_card_data(self, request: TransactionRequest):
        """Create a flat list of card dictionaries used by the Pyomo model.
        Each entry contains:
        * id – unique identifier (string)
        * type – 'credit', 'debit' or 'international'
        * available – GBP amount that can be used (limit vs balance)
        * rate – cashback rate (only for credit cards)
        * interest_rate – annual interest or markup (for debit / international)
        """
        category = request.category
        best_debit_rate = self._best_debit_rate()
        cards = []
        # Credit cards
        for cc in self.credit_cards:
            cards.append(
                {
                    "id": cc.id,
                    "name": cc.name,
                    "type": "credit",
                    "available": min(cc.monthly_spend_limit, cc.current_balance),
                    "rate": cc.cashback_rates.get(category, 0.0),
                    "interest_rate": best_debit_rate,  # used for interest‑preservation
                }
            )
        # Debit cards
        for dc in self.debit_cards:
            cards.append(
                {
                    "id": dc.id,
                    "name": dc.name,
                    "type": "debit",
                    "available": min(dc.monthly_spend_limit, dc.current_balance),
                    "rate": 0.0,
                    "interest_rate": dc.annual_interest_rate,
                }
            )
        # International cards (converted to GBP)
        for ic in self.international_cards:
            available_gbp = min(ic.monthly_spend_limit, ic.current_balance) / ic.gbp_conversion
            cards.append(
                {
                    "id": ic.id,
                    "name": ic.name,
                    "type": "international",
                    "available": available_gbp,
                    "rate": 0.0,
                    "interest_rate": ic.markup_rate,
                }
            )
        return cards

    def _build_model(self, amount: float, mode: str, cards: List[dict]):
        model = ConcreteModel()
        model.CARDS = range(len(cards))
        # Decision variable: amount allocated to each card (GBP)
        model.x = Var(model.CARDS, domain=NonNegativeReals)

        # Constraint: cannot exceed per‑card available amount
        def avail_rule(m, i):
            return m.x[i] <= cards[i]["available"]
        model.avail_con = Constraint(model.CARDS, rule=avail_rule)

        # Constraint: total allocated must equal the transaction amount
        model.total_con = Constraint(expr=sum(model.x[i] for i in model.CARDS) == amount)

        # Helper expressions for interest saved and cashback
        def interest_expr(m, i):
            card = cards[i]
            # Monthly interest saved = amount * annual_rate / 12
            if card["type"] == "debit":
                return -(m.x[i] * card["interest_rate"] / 12.0)  # cost (negative)
            elif card["type"] == "credit":
                return m.x[i] * card["interest_rate"] / 12.0  # preserve best debit rate
            else:  # international
                # Apply a strong penalty using markup rate to discourage selection unless needed
                return -(m.x[i] * (card["interest_rate"] * 1000) / 12.0)
        model.interest = Var(model.CARDS)
        model.interest_def = Constraint(
            model.CARDS, rule=lambda m, i: model.interest[i] == interest_expr(m, i)
        )

        def cashback_expr(m, i):
            card = cards[i]
            return m.x[i] * card["rate"]
        model.cashback = Var(model.CARDS)
        model.cashback_def = Constraint(
            model.CARDS, rule=lambda m, i: model.cashback[i] == cashback_expr(m, i)
        )

        # Objective depends on mode
        if mode == "interest_only":  # user called this "general"
            model.obj = Objective(expr=sum(model.interest[i] for i in model.CARDS), sense=1)
        else:
            model.obj = Objective(
                expr=sum(model.cashback[i] + model.interest[i] for i in model.CARDS), sense=1
            )
        return model

    def optimize(self, request: TransactionRequest) -> TransactionResponse:
        amount = request.amount
        category = request.category
        # Automatic Mode Selection based on Category
        if category in [Sector.HOTEL, Sector.TRAVEL, Sector.FUEL, Sector.SHOPPING]:
            mode = "balanced"
        else:
            mode = "interest_only"

        cards = self._prepare_card_data(request)
        total_available = sum(c["available"] for c in cards)
        if total_available < amount:
            return TransactionResponse(
                allocations=[], explanation="Insufficient total liquidity.", total_amount=amount, status="insufficient_funds"
            )

        model = self._build_model(amount, mode, cards)
        solver = SolverFactory("glpk")
        result = solver.solve(model, tee=False)
        if result.solver.termination_condition != "optimal":
            return TransactionResponse(
                allocations=[], explanation="Optimization failed.", total_amount=amount, status="insufficient_funds"
            )

        allocations: List[Allocation] = []
        for i, card in enumerate(cards):
            used = value(model.x[i])
            if used <= 0:
                continue
            cashback = value(model.cashback[i])
            interest_saved = value(model.interest[i])
            allocations.append(
                Allocation(
                    card_id=card["id"],
                    card_name=card["name"],
                    amount_utilised=used,
                    interest_saved=interest_saved,
                    cashback_points=cashback,
                    cashback_sector=category if card["type"] == "credit" else None,
                )
            )
        explanation = "Optimisation completed using a strict linear model."
        return TransactionResponse(
            allocations=allocations,
            explanation=explanation,
            total_amount=amount,
            status="success",
        )
