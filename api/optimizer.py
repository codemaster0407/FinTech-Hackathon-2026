from typing import List, Dict
from api.models import DebitCard, CreditCard, InternationalCard, UserPreferences, Sector, Allocation, TransactionResponse, TransactionRequest
import math
from llm.groq_api import groq_api_call

class CardOptimizer:
    def __init__(self, debit_cards: List[DebitCard], credit_cards: List[CreditCard], international_cards: List[InternationalCard], preferences: UserPreferences):
        self.debit_cards = sorted(debit_cards, key=lambda x: x.annual_interest_rate, reverse=True)
        self.credit_cards = credit_cards
        self.international_cards = international_cards
        self.preferences = preferences

    def _calculate_interest_benefit(self, amount: float, annual_rate: float) -> float:
        # Simplified: Interest saved for 1 month if this amount stays in the account
        return (amount * annual_rate) / 12

    def _calculate_cashback_benefit(self, amount: float, rate: float) -> float:
        return amount * rate

    def _get_llm_explanation(self, allocations: List[Allocation], total_amount: float, category: Sector, mode: str) -> str:
        # Construct a detailed prompt for Groq
        if mode == "interest_only":
            prompt = f"Explain this transaction optimization for a purchase of £{total_amount:.2f}.\n"
        else:
            prompt = f"Explain this credit card optimization for a {category} purchase of £{total_amount:.2f}.\n"
        
        prompt += "The following allocations were made:\n"
        for a in allocations:
            prompt += f"- {a.card_name}: Utilized £{a.amount_utilised:.2f}. "
            if mode != "interest_only":
                if a.cashback_points > 0:
                    prompt += f"Earned {a.cashback_points:.2f} points in {a.cashback_sector}. "
            if a.interest_saved != 0:
                prompt += f"Interest impact: £{a.interest_saved:.4f}. "
            prompt += "\n"
        
        if mode == "interest_only":
            prompt += """
            STRICT REQUIREMENT: Please provide a concise, friendly explanation why this is the best strategy. 
            Focus on 'Interest Preservation': explain that by using credit cards or low-interest accounts, the user keeps their high-yield savings (like the 5% account) untouched to maximize their earnings.
            Do NOT mention points, rewards, or cashback. Keep it under 3 sentences.
            """
        else:
            prompt += """
            Please provide a concise, friendly explanation to the user why this is the best strategy 
            (maximizing points and interest while minimizing fees). Keep it under 3 sentences.
            """
        
        try:
            explanation = groq_api_call(prompt)
            return explanation.strip()
        except Exception as e:
            return f"[Fallback Explanation]: I've optimized your £{total_amount:.2f} {category} purchase to maximize your rewards and interest. Error calling LLM: {str(e)}"

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
        best_debit_rate = max([dc.annual_interest_rate for dc in self.debit_cards] + [0])

        for cc in self.credit_cards:
            rate = cc.cashback_rates.get(category, 0)
            
            # Calculate a tiny priority bonus (0 to 0.0001) based on sector priority
            priority_bonus = 0.0
            if category in self.preferences.point_priority:
                rank = self.preferences.point_priority.index(category)
                priority_bonus = (len(Sector) - rank) * 0.00001

            if mode == "interest_only":
                # In Interest Only mode, we keep benefit close to 0 but use rewards as a tiny tie-breaker
                # This ensures Credit cards (0 loss) are still ranked above Debit (Interest loss)
                final_benefit = rate * 0.000001
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
            available_gbp = min(ic.monthly_spend_limit, ic.current_balance) / ic.gbp_conversion
            
            indexed_cards.append({
                "obj": ic,
                "benefit": -ic.markup_rate,
                "type": "international",
                "available_gbp": available_gbp
            })

        # Sort all sources by benefit (highest first)
        ranked_cards = sorted(indexed_cards, key=lambda x: x["benefit"], reverse=True)

        # Pre-calculate potential best single card that covers the whole amount
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
            interest_saved = 0.0
            if best_single_card["type"] == "credit":
                rate = card.cashback_rates.get(category, 0)
                cashback = self._calculate_cashback_benefit(amount, rate)
                # Show the interest preserved in the bank by not spending this amount from high-yield debit
                interest_saved = self._calculate_interest_benefit(amount, best_debit_rate)
            elif best_single_card["type"] == "debit":
                interest_saved = -self._calculate_interest_benefit(amount, card.annual_interest_rate)
            else:
                interest_saved = -self._calculate_interest_benefit(amount, card.markup_rate)

            allocations.append(Allocation(
                card_id=card.id,
                card_name=card.name,
                amount_utilised=amount,
                interest_saved=interest_saved,
                cashback_points=cashback,
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
                    interest_saved = 0.0
                    
                    if item["type"] == "credit":
                        rate = card.cashback_rates.get(category, 0)
                        cashback = self._calculate_cashback_benefit(use_amount, rate)
                        # Show the interest preserved in the bank
                        interest_saved = self._calculate_interest_benefit(use_amount, best_debit_rate)
                    elif item["type"] == "debit":
                        interest_saved = -self._calculate_interest_benefit(use_amount, card.annual_interest_rate)
                    else: # international
                        interest_saved = -self._calculate_interest_benefit(use_amount, card.markup_rate)

                    allocations.append(Allocation(
                        card_id=card.id,
                        card_name=card.name,
                        amount_utilised=use_amount,
                        interest_saved=interest_saved,
                        cashback_points=cashback,
                        cashback_sector=category if item["type"] == "credit" else None
                    ))
                    remaining_amount -= use_amount

        status = "success" if remaining_amount == 0 else "insufficient_funds"
        explanation = self._get_llm_explanation(allocations, amount, category, mode)

        return TransactionResponse(
            allocations=allocations,
            explanation=explanation,
            total_amount=amount,
            status=status
        )
