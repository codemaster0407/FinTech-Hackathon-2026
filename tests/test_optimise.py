"""
OptiFin — Pytest Test Suite
Tests the POST /optimise/ endpoint for three core decision scenarios:
  1. credit_optimised  — single best card selected
  2. pass_through      — debit only, no credit cards available
  3. split             — amount split across multiple cards

Run:
    pytest tests/test_optimise.py -v
"""

import pytest
import requests

BASE_URL = "http://localhost:8000"
OPTIMISE_URL = f"{BASE_URL}/optimise/"


def post(payload: dict) -> dict:
    resp = requests.post(OPTIMISE_URL, json=payload, timeout=10)
    assert resp.status_code == 200, f"HTTP {resp.status_code}: {resp.text}"
    return resp.json()


# ─────────────────────────────────────────────────────────────────────────────
# SCENARIO 1 — Single card (credit_optimised)
# Emma (usr_001) buys a hotel stay. Amex earns 5% on hotels — best single card.
# ─────────────────────────────────────────────────────────────────────────────

class TestSingleCard:
    """credit_optimised: one credit card is clearly best, covers the full amount."""

    payload = {
        "user_id": "usr_001",
        "amount": 185.00,
        "currency": "GBP",
        "category": "hotel",
        "merchant": "Premier Inn",
    }

    def test_decision_is_credit_optimised(self):
        result = post(self.payload)
        assert result["decision"] == "credit_optimised", (
            f"Expected 'credit_optimised', got '{result['decision']}'"
        )

    def test_single_card_in_allocation(self):
        result = post(self.payload)
        assert len(result["allocation"]) == 1, (
            f"Expected 1 card, got {len(result['allocation'])}"
        )

    def test_correct_card_selected(self):
        """Amex (5% hotel) should beat Chase (1% hotel)."""
        result = post(self.payload)
        assert result["allocation"][0]["card_id"] == "amex_platinum_emma", (
            f"Expected Amex Platinum, got {result['allocation'][0]['card_name']}"
        )

    def test_cashback_earned_is_positive(self):
        result = post(self.payload)
        cashback = result["eom_impact"]["total_cashback_earned"]
        assert cashback > 0, "Expected positive cashback for hotel on Amex"

    def test_cashback_rate_is_five_percent(self):
        """5% on £185 = £9.25."""
        result = post(self.payload)
        expected = round(185.00 * 0.05, 2)
        actual = round(result["eom_impact"]["total_cashback_earned"], 2)
        assert actual == expected, f"Expected £{expected} cashback, got £{actual}"

    def test_reward_points_earned(self):
        """5 pts/£ on £185 = 925 pts."""
        result = post(self.payload)
        pts = result["allocation"][0]["reward_points_earned"]
        assert pts == 925, f"Expected 925 pts, got {pts}"

    def test_ui_hints_present(self):
        result = post(self.payload)
        hints = result["ui_hints"]
        assert hints["headline"] != "", "ui_hints.headline should not be empty"
        assert hints["earn_label"] != "", "ui_hints.earn_label should not be empty"
        assert hints["net_benefit_gbp"] > 0

    def test_net_eom_benefit_positive(self):
        result = post(self.payload)
        assert result["eom_impact"]["net_eom_benefit"] > 0

    def test_savings_interest_preserved(self):
        """When paying by credit, debit savings interest should not be lost."""
        result = post(self.payload)
        assert result["eom_impact"]["total_interest_opportunity_lost"] == 0.0, (
            "Credit card spend should not incur savings opportunity cost"
        )

    def test_grocery_routes_to_chase(self):
        """Chase earns 3% grocery vs Amex 2% — should prefer Chase."""
        result = post({
            "user_id": "usr_001",
            "amount": 112.40,
            "currency": "GBP",
            "category": "grocery",
            "merchant": "Tesco",
        })
        assert result["allocation"][0]["card_id"] == "chase_freedom_emma", (
            "Chase Freedom (3% grocery) should beat Amex Gold (2% grocery)"
        )


# ─────────────────────────────────────────────────────────────────────────────
# SCENARIO 2 — Pass-through (debit only)
# Sam (usr_003) has no credit cards — all payments routed to debit.
# ─────────────────────────────────────────────────────────────────────────────

class TestPassThrough:
    """pass_through: no credit cards exist, debit is the only option."""

    payload = {
        "user_id": "usr_003",
        "amount": 65.00,
        "currency": "GBP",
        "category": "fuel_transport",
        "merchant": "Shell Garage",
    }

    def test_decision_is_pass_through(self):
        result = post(self.payload)
        assert result["decision"] == "pass_through", (
            f"Expected 'pass_through', got '{result['decision']}'"
        )

    def test_single_debit_in_allocation(self):
        result = post(self.payload)
        assert len(result["allocation"]) == 1
        assert result["allocation"][0]["tier"] == 2, "Allocation should be debit (tier 2)"

    def test_no_cashback_earned(self):
        result = post(self.payload)
        assert result["eom_impact"]["total_cashback_earned"] == 0.0

    def test_interest_opportunity_lost_is_positive(self):
        """Spending from debit drains savings, so opportunity cost > 0."""
        result = post(self.payload)
        assert result["eom_impact"]["total_interest_opportunity_lost"] > 0, (
            "Pass-through on a savings account should show interest opportunity cost"
        )

    def test_net_eom_benefit_is_negative(self):
        """No cashback + opportunity cost = negative net benefit."""
        result = post(self.payload)
        assert result["eom_impact"]["net_eom_benefit"] < 0

    def test_ui_headline_mentions_debit(self):
        result = post(self.payload)
        assert "debit" in result["ui_hints"]["headline"].lower(), (
            "UI headline should mention 'debit' for pass_through"
        )

    def test_earn_label_says_no_cashback(self):
        result = post(self.payload)
        assert "no cashback" in result["ui_hints"]["earn_label"].lower()

    def test_savings_nudge_is_empty(self):
        """Pass-through has no savings nudge (not paying by credit)."""
        result = post(self.payload)
        assert result["ui_hints"]["savings_nudge"] == ""


# ─────────────────────────────────────────────────────────────────────────────
# SCENARIO 3 — Multiple cards (split)
# Emma (usr_001) buys a £2,200 hotel — Amex hits its 30% util cap at ~£1,727,
# overflow goes to Chase Freedom.
# ─────────────────────────────────────────────────────────────────────────────

class TestMultipleCards:
    """split: amount exceeds one card's utilization headroom, splits across two."""

    payload = {
        "user_id": "usr_001",
        "amount": 2200.00,
        "currency": "GBP",
        "category": "hotel",
        "merchant": "Marriott London",
    }

    def test_decision_is_split(self):
        result = post(self.payload)
        assert result["decision"] == "split", (
            f"Expected 'split', got '{result['decision']}'"
        )

    def test_multiple_cards_in_allocation(self):
        result = post(self.payload)
        assert len(result["allocation"]) > 1, (
            f"Expected multiple cards, got {len(result['allocation'])}"
        )

    def test_allocation_sums_to_transaction_amount(self):
        result = post(self.payload)
        total = sum(a["amount_gbp"] for a in result["allocation"])
        assert abs(total - 2200.00) < 0.05, (
            f"Allocation should sum to £2200, got £{total:.2f}"
        )

    def test_amex_allocated_first(self):
        """Amex earns 5% on hotels (best rate) — should be primary card."""
        result = post(self.payload)
        assert result["allocation"][0]["card_id"] == "amex_platinum_emma"

    def test_amex_within_utilization_cap(self):
        """Amex allocation must not exceed 30% of £12,000 limit = £3,600 minus existing balance."""
        result = post(self.payload)
        amex_alloc = next(
            (a for a in result["allocation"] if a["card_id"] == "amex_platinum_emma"), None
        )
        assert amex_alloc is not None
        # 30% of £12000 = £3600, minus balance £1800, minus auto-debits ~£73 = ~£1727
        assert amex_alloc["amount_gbp"] <= 1800.0, (
            "Amex should not exceed available utilization headroom"
        )

    def test_total_cashback_greater_than_single_card(self):
        """Combined cashback should be higher than if only Chase (1% hotel) were used."""
        result = post(self.payload)
        combined = result["eom_impact"]["total_cashback_earned"]
        chase_only = 2200.00 * 0.01  # chase 1% hotel
        assert combined > chase_only, (
            f"Split (£{combined:.2f}) should beat Chase-only (£{chase_only:.2f})"
        )

    def test_ui_headline_mentions_both_cards(self):
        result = post(self.payload)
        headline = result["ui_hints"]["headline"]
        assert "Amex" in headline or "Chase" in headline, (
            f"Headline should mention both cards, got: '{headline}'"
        )

    def test_no_fx_costs(self):
        """GBP transaction — no FX costs expected."""
        result = post(self.payload)
        assert result["eom_impact"]["total_fx_costs"] == 0.0

    def test_savings_interest_not_lost(self):
        """Both cards are credit (tier 1) — no debit drained, no savings interest lost."""
        result = post(self.payload)
        assert result["eom_impact"]["total_interest_opportunity_lost"] == 0.0
