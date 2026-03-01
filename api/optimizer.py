from typing import List, Dict
from api.models import DebitCard, CreditCard, InternationalCard, UserPreferences, Sector, Allocation, TransactionResponse, TransactionRequest
import math
from llm.groq_api import groq_api_call


class CardOptimizer:
    def __init__(self, debit_cards: List[DebitCard], credit_cards: List[CreditCard], international_cards: List[InternationalCard], preferences: UserPreferences):
        self.debit_cards = sorted(
            debit_cards, key=lambda x: x.annual_interest_rate, reverse=True)
        self.credit_cards = credit_cards
        self.international_cards = international_cards
        self.preferences = preferences

    def _calculate_interest_benefit(self, amount: float, annual_rate: float) -> float:
        # Simplified: Interest saved for 1 month if this amount stays in the account
        return (amount * annual_rate) / 12

    def _calculate_cashback_benefit(self, amount: float, rate: float) -> float:
        return amount * rate

    def _get_llm_explanation(self, allocations: List[Allocation], total_amount: float, category: Sector, mode: str):
        # Construct a detailed prompt for Groq
        prompt = f'''Based on the allocations made by the optimization model, give the user the summary 
        of the payment allocations and make it user-friendly for a common man.
        Use the term 'Net Savings' when referring to interest preserved in savings accounts.
        {str(allocations)}. Maximise the explanation to only 3 sentences
        '''
        print(allocations)
        try:
            raw = groq_api_call(prompt)
            print(raw)
            return raw
        except Exception as e:
            raise Exception(e)

            # Attempt to parse JSON
            

    def _is_split_worthwhile(self, amount: float, potential_benefit: float) -> bool:
        # Realistic thresholds:
        # 1. Don't split if the transaction is very small (< £50)
        # 2. Don't split if the net benefit (cashback + interest saved) is < £0.10
        MIN_SPLIT_TRANSACTION = 50.0
        MIN_BENEFIT_THRESHOLD = 0.10

        if amount < MIN_SPLIT_TRANSACTION:
            return False
        if potential_benefit < MIN_BENEFIT_THRESHOLD:
            return False
        return True

    def optimize(self, request: TransactionRequest) -> TransactionResponse:
        amount = request.amount
        category = request.category

        # Automatic Mode Selection based on Category
        # Balanced: hotel, travel, fuel, shopping
        # Interest Only: everything else (general, grocery)
        if category in [Sector.HOTEL, Sector.TRAVEL, Sector.FUEL, Sector.SHOPPING]:
            mode = "balanced"
        else:
            mode = "interest_only"

        allocations: List[Allocation] = []
        remaining_amount = amount

        # Define the cost/benefit for each card type
        # Benefit = (Cashback Rate) - (Opportunity Cost of Interest Loss)
        # We want to maximize this Benefit across all utilized sources.

        indexed_cards = []

        # Best debit rate to calculate "Interest Saved" comparison
        best_debit_rate = max(
            [dc.annual_interest_rate for dc in self.debit_cards] + [0])

        for cc in self.credit_cards:
            rate = cc.cashback_rates.get(category, 0)

            # Calculate a tiny priority bonus (0 to 0.0001) based on sector priority
            priority_bonus = 0.0
            if category in self.preferences.point_priority:
                rank = self.preferences.point_priority.index(category)
                priority_bonus = (len(Sector) - rank) * 0.00001

            # In interest_only mode, we still use credit cards if available
            # because they preserve the highest possible interest.
            # We just set the cashback benefit to 0 (or very low) to focus on interest.
            if mode == "interest_only":
                final_benefit = 0.0 + priority_bonus
            else:
                final_benefit = rate + priority_bonus

            indexed_cards.append({
                "obj": cc,
                "benefit": final_benefit,
                "type": "credit",
                "available_gbp": min(cc.monthly_spend_limit, cc.current_balance)
            })

        for dc in self.debit_cards:
            indexed_cards.append({
                "obj": dc,
                "benefit": -dc.annual_interest_rate,
                "type": "debit",
                "available_gbp": min(dc.monthly_spend_limit, dc.current_balance)
            })

        for ic in self.international_cards:
            # International balance/limit is in local currency (e.g. INR)
            # Convert to GBP equivalent for optimization logic
            available_gbp = min(ic.monthly_spend_limit,
                                ic.current_balance) / ic.gbp_conversion

            indexed_cards.append({
                "obj": ic,
                "benefit": -ic.markup_rate,
                "type": "international",
                "available_gbp": available_gbp
            })

        # Sort all sources by benefit (highest first)
        ranked_cards = sorted(
            indexed_cards, key=lambda x: x["benefit"], reverse=True)

        # Pre-calculate potential best single card that covers the whole amount,
        # respecting mode-specific preferences.
        best_single_card = None
        for item in ranked_cards:
            if item["available_gbp"] >= amount:
                best_single_card = item
                break

        # Decision: To split or not to split?
        # We only consider splitting if the best single card is NOT the absolute best benefit card,
        # OR if no single card can cover the amount.

        should_split = True
        if amount < 50.0:
            should_split = False

        if not should_split and best_single_card:
            # Fallback to single best card
            card = best_single_card["obj"]
            cashback = 0.0
            # Logic for positive interest_saved:
            # How much better is this card than the highest interest debit account?
            if best_single_card["type"] == "credit":
                rate = card.cashback_rates.get(category, 0)
                cashback = self._calculate_cashback_benefit(amount, rate)
                interest_saved = self._calculate_interest_benefit(
                    amount, best_debit_rate)
            elif best_single_card["type"] == "debit":
                # If we use a 2% account instead of 5%, we "save" 3%.
                # If we use the 5% account, we save 0%.
                rel_rate = best_debit_rate - card.annual_interest_rate
                interest_saved = self._calculate_interest_benefit(
                    amount, rel_rate)
            else:
                # International: compare markup vs best debit rate for opportunity cost?
                # Actually, the user's focus is on interest saved from splitting.
                rel_rate = best_debit_rate - card.markup_rate
                interest_saved = self._calculate_interest_benefit(amount, rel_rate)

            allocations.append(Allocation(
                card_id=card.id,
                card_name=card.name,
                amount_utilised=amount,
                interest_saved=interest_saved,
                cashback_points= cashback + interest_saved,
                cashback_sector=category if best_single_card["type"] == "credit" else None
            ))
            remaining_amount = 0
        else:
            # Proceed with splitting logic
            for item in ranked_cards:
                if remaining_amount <= 0:
                    break

                card = item["obj"]
                available = item["available_gbp"]

                if available > 0:
                    use_amount = min(remaining_amount, available)

                    cashback = 0.0
                    if item["type"] == "credit":
                        rate = card.cashback_rates.get(category, 0)
                        cashback = self._calculate_cashback_benefit(
                            use_amount, rate)
                        interest_saved = self._calculate_interest_benefit(
                            use_amount, best_debit_rate)
                    elif item["type"] == "debit":
                        rel_rate = best_debit_rate - card.annual_interest_rate
                        interest_saved = self._calculate_interest_benefit(
                            use_amount, rel_rate)
                    else:  # international
                        rel_rate = best_debit_rate - card.markup_rate
                        interest_saved = self._calculate_interest_benefit(
                            use_amount, rel_rate)

                    allocations.append(Allocation(
                        card_id=card.id,
                        card_name=card.name,
                        amount_utilised=use_amount,
                        interest_saved=interest_saved,
                        cashback_points=cashback + interest_saved,
                        cashback_sector=category if item["type"] == "credit" else None
                    ))
                    remaining_amount -= use_amount

        status = "success" if remaining_amount == 0 else "insufficient_funds"
        explanation_text = self._get_llm_explanation(
            allocations, amount, category, mode)


        
        resp = TransactionResponse(
            allocations=allocations,
            explanation=explanation_text,
            total_amount=amount,
            status=status
        )
        return resp 
        # Attach eom_impact to ui_hints for frontend convenience
      