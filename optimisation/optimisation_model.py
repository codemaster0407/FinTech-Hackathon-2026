"""
OptiFin — Payment Optimisation Engine (v2)
==========================================
Objective: Maximise end-of-month (EOM) cash-in-hand for a given transaction.

Card Tier System:
─────────────────
  Tier 1 — Credit Cards (preferred when paying in full)
      Each £1 charged earns cashback while keeping debit balance intact.
      Debit balance keeps earning savings interest during the grace period.
      Net benefit/£1 = cashback_rate + savings_opp_rate × grace_days/30 - fx_fee

  Tier 2 — Debit Accounts (used when credit not optimal or limit reached)
      Each £1 spent drains balance that would have earned savings interest.
      Net benefit/£1 = -savings_rate_monthly - fx_fee  (opportunity cost)

  Tier 3 — Backup International Cards (last resort only)
      No cashback, no savings interest — just a funding source.
      Net benefit/£1 = -fx_spread_rate - flat_fee_amortised_over_amount
      Only activated when Tier 1 + Tier 2 are exhausted.

Optimizer: scipy.optimize.linprog (HiGHS solver)
    Maximise: Σ net_benefit_rate[i] × x[i]
    Subject to:
        Σ x[i] = transaction_amount_gbp       (payment fully covered)
        x[i] ≤ effective_capacity[i]           (limit / balance after auto-debits)
        x[i] ≥ 0                               (no negative allocation)
        projected_utilization[i] ≤ max_util    (credit score safety)

Usage:
    python optimisation_model.py
    python optimisation_model.py --transaction T003
"""

import json
import os
import sys
import math
import calendar
import argparse
import logging
from datetime import date, timedelta
from typing import Optional
import numpy as np
from scipy.optimize import linprog

# ── Logger ─────────────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
try:
    from api.logger import get_logger
    log = get_logger("optimisation.engine")
except ImportError:
    logging.basicConfig(
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
    )
    log = logging.getLogger("optimisation.engine")
    log.setLevel(logging.DEBUG)

# ─── PATHS ────────────────────────────────────────────────────────────────────
USER_DATA_PATH   = os.path.join(ROOT, "data", "user_data.json")
TRANSACTIONS_PATH = os.path.join(ROOT, "data", "transactions.json")

# ─── FX RATES (GBP base — swap for live API in production) ───────────────────
FX_TO_GBP = {
    "GBP": 1.0000,
    "USD": 0.7912,
    "EUR": 0.8521,
    "INR": 0.00951,
    "AUD": 0.5080,
}

CASHBACK_THRESHOLD = 0.05  # Only route to credit if cashback rate > 0.5% (avoid micro-optimisations)

# ─── DATA LOADERS ─────────────────────────────────────────────────────────────

def load_json(path: str) -> dict:
    with open(path, "r") as f:
        return json.load(f)

# ─── AUTO-DEBIT HELPERS ───────────────────────────────────────────────────────

def pending_auto_debits_in_cycle(auto_debits: list, today: date,
                                  statement_close_day: Optional[int] = None) -> float:
    """
    Returns total auto-debit £ that will fire on this card between
    today and the statement/month close date (inclusive).

    For debit accounts (no statement close day), uses end-of-month.
    """
    if not auto_debits:
        return 0.0

    today_day = today.day
    days_in_month = calendar.monthrange(today.year, today.month)[1]

    close_day = statement_close_day if statement_close_day else days_in_month

    # Build the window of days remaining in the cycle
    if today_day <= close_day:
        window = set(range(today_day, close_day + 1))
    else:
        # Billing cycle crosses month-end
        window = set(range(today_day, days_in_month + 1)) | set(range(1, close_day + 1))

    return sum(d["amount"] for d in auto_debits if d["day_of_month"] in window)


# ─── CARD CAPACITY CALCULATORS ────────────────────────────────────────────────

def debit_card_capacity(account: dict, today: date, prefs: dict) -> dict:
    """Compute how much we can safely spend from a debit/savings account."""
    pending = pending_auto_debits_in_cycle(
        account.get("auto_debits", []), today
    )
    balance = account["balance"]
    effective = max(0.0, balance - pending)
    return {
        "id": account["id"],
        "name": account["name"],
        "tier": 2,
        "capacity": effective,
        "balance": balance,
        "pending_debits": pending,
        "savings_rate_monthly": account["savings_interest_rate_annual"] / 12,
        "is_primary": account.get("is_primary", False),
    }


def credit_card_capacity(card: dict, today: date, prefs: dict) -> dict:
    """Compute usable credit after auto-debits + utilization headroom."""
    max_util = prefs.get("max_credit_utilization", 0.30)
    limit = card["credit_limit"]
    balance = card["current_balance"]
    pending = pending_auto_debits_in_cycle(
        card.get("auto_debits", []), today, card.get("statement_close_day")
    )

    raw_available = limit - balance - pending
    util_headroom   = max_util * limit - (balance + pending)
    capacity = max(0.0, min(raw_available, util_headroom))

    return {
        "id": card["id"],
        "name": card["name"],
        "tier": 1,
        "capacity": capacity,
        "limit": limit,
        "balance": balance,
        "pending_debits": pending,
        "cashback_rates": card["cashback_rates"],
        "grace_period_days": card.get("grace_period_days", 30),
        "apr_annual": card["apr_annual"],
        "reward_points_per_pound": card.get("reward_points_per_pound", {}),
        "reward_type": card.get("reward_type", "cashback"),
        "badge": card.get("badge", ""),
    }


def intl_card_capacity(card: dict) -> dict:
    """Backup international card — limit only, no rewards."""
    balance_gbp = card.get("balance_gbp_approx", 0.0)
    return {
        "id": card["id"],
        "name": card["name"],
        "tier": 3,
        "capacity": max(0.0, balance_gbp),
        "fx_spread_rate": card.get("fx_spread_rate", 0.025),
        "transfer_fee_flat": card.get("transfer_fee_flat", 0.0),
        "estimated_hours": card.get("estimated_transfer_hours", 0),
    }


# ─── NET BENEFIT RATE CALCULATOR ─────────────────────────────────────────────

def compute_net_benefit_rate(slot: dict, category: str, is_fx: bool,
                              primary_savings_monthly: float,
                              pays_in_full: bool,
                              spend_amount: float = 1.0) -> float:
    """
    Returns the net financial benefit per £1 spent on this card/account,
    in the context of end-of-month cash maximisation.

      Tier 1 (Credit — pays in full):
          +cashback_rate
          +primary_savings_rate × grace_days/30   (debit earns interest during grace period)

      Tier 1 (Credit — carries balance):
          +cashback_rate
          -apr_monthly

      Tier 2 (Debit):
          -savings_rate_monthly  (opportunity cost: lost interest on drained balance)

      Tier 3 (International backup only):
          -(fx_spread_rate + flat_fee / spend_amount)
          FX cost is ONLY applied here — not to Tier 1 or Tier 2.
    """
    tier = slot["tier"]

    if tier == 1:  # Credit card — no FX fee modelled; cashback + grace interest benefit
        cashback_rate = slot["cashback_rates"].get(category, slot["cashback_rates"].get("other", 0))
        if pays_in_full:
            grace_fraction = slot["grace_period_days"] / 30.0
            interest_during_grace = primary_savings_monthly * grace_fraction
            return cashback_rate + interest_during_grace
        else:
            apr_monthly = slot["apr_annual"] / 12
            return cashback_rate - apr_monthly

    elif tier == 2:  # Debit account — opportunity cost only, no FX modelled
        opp_cost = slot["savings_rate_monthly"]
        return -opp_cost

    elif tier == 3:  # Backup international — FX spread + flat fee is the only cost
        flat_per_unit = slot["transfer_fee_flat"] / max(spend_amount, 1.0)
        return -(slot["fx_spread_rate"] + flat_per_unit)

    return 0.0


# ─── CORE OPTIMIZER ──────────────────────────────────────────────────────────

def optimize_payment(transaction: dict,
                     user_data: dict,
                     today: Optional[date] = None,
                     verbose: bool = True) -> dict:
    """
    For a given transaction, returns the optimal card allocation
    that maximises end-of-month cash in hand.
    """
    if today is None:
        today = date.today()

    prefs = user_data["user"]["preferences"]
    pays_in_full = prefs.get("always_pay_credit_in_full", True)
    user_name = user_data["user"].get("name", user_data["user"]["id"])

    log.info(
        "REQUEST  | user=%-20s | £%-9.2f %s | category=%-16s | merchant=%s",
        user_name, transaction.get("amount", 0), transaction.get("currency", "GBP"),
        transaction.get("category", "other"), transaction.get("description", "-")
    )

    # ── Convert to GBP ────────────────────────────────────────────────────────
    currency = transaction.get("currency", "GBP")
    amount_orig = transaction["amount"]
    amount_gbp = amount_orig * FX_TO_GBP.get(currency, 1.0)
    is_fx = (currency != "GBP")

    # ── Compute balance-weighted average savings rate across ALL debit accounts ──
    # This is the true opportunity cost: every £1 kept in debit earns at this
    # blended rate. High-yield savings accounts (4.5% ISA) are properly weighted.
    total_debit_balance = sum(a["balance"] for a in user_data["debit_accounts"])
    if total_debit_balance > 0:
        weighted_savings_rate_annual = sum(
            a["balance"] * a["savings_interest_rate_annual"]
            for a in user_data["debit_accounts"]
        ) / total_debit_balance
    else:
        weighted_savings_rate_annual = 0.0
    primary_savings_monthly = weighted_savings_rate_annual / 12

    # Also expose per-account monthly rate and total monthly interest generated
    debit_interest_profile = {
        a["id"]: {
            "balance": a["balance"],
            "annual_rate": a["savings_interest_rate_annual"],
            "monthly_interest": round(a["balance"] * a["savings_interest_rate_annual"] / 12, 4),
        }
        for a in user_data["debit_accounts"]
    }

    category = transaction.get("category", "other")

    if verbose:
        _print_header(transaction, amount_orig, amount_gbp, currency)

    # ── Build card slots (in priority tier order) ─────────────────────────────
    slots = []

    # Tier 1: Credit cards
    for card in user_data.get("credit_cards", []):
        cap = credit_card_capacity(card, today, prefs)
        if cap["capacity"] > 0.01:
            cashback = cap["cashback_rates"].get(category, cap["cashback_rates"].get("other", 0))
            # Only use credit if cashback beats threshold (avoid micro-routing)
            nbr = compute_net_benefit_rate(cap, category, is_fx, primary_savings_monthly,
                                           pays_in_full, amount_gbp)
            cap["net_benefit_rate"] = nbr
            slots.append(cap)

    # Tier 2: Debit accounts (sorted: highest savings rate drained last)
    debit_slots = []
    for acc in user_data.get("debit_accounts", []):
        cap = debit_card_capacity(acc, today, prefs)
        if cap["capacity"] > 0.01:
            cap["net_benefit_rate"] = compute_net_benefit_rate(
                cap, category, is_fx, primary_savings_monthly, pays_in_full, amount_gbp
            )
            debit_slots.append(cap)

    # Sort debit: primary first (user preference), then by lowest opportunity cost
    debit_slots.sort(key=lambda s: (
        not s["is_primary"],
        s["savings_rate_monthly"]  # drain lowest-interest debit first
    ))
    slots.extend(debit_slots)

    # Tier 3: Backup international (always last)
    for card in user_data.get("backup_international_cards", []):
        cap = intl_card_capacity(card)
        if cap["capacity"] > 0.01:
            cap["net_benefit_rate"] = compute_net_benefit_rate(
                cap, category, is_fx, primary_savings_monthly, pays_in_full, amount_gbp
            )
            slots.append(cap)

    if not slots:
        return {"error": "No available funding source for this transaction.", "allocation": []}

    # ── Log card evaluation ranking ────────────────────────────────────────────
    log.debug("CARD EVAL | %d candidates for £%.2f [%s] at %s",
              len(slots), amount_gbp, category, transaction.get("description", "-"))
    ranked = sorted(slots, key=lambda s: s["net_benefit_rate"], reverse=True)
    for rank, s in enumerate(ranked, 1):
        tier_lbl = {1: "Credit", 2: "Debit ", 3: "Intl  "}[s["tier"]]
        log.debug(
            "  [#%d] %-28s %s | capacity=£%8.2f | net_benefit_rate=%+.5f",
            rank, s["name"], tier_lbl, s["capacity"], s["net_benefit_rate"]
        )

    # ── Linear Program ────────────────────────────────────────────────────────
    n = len(slots)

    # Objective: maximise Σ net_benefit_rate[i] × x[i]
    # linprog minimises → negate
    c = np.array([-s["net_benefit_rate"] for s in slots])

    # Each card capped at its capacity
    A_ub = np.eye(n)
    b_ub = np.array([s["capacity"] for s in slots])

    # Must fully fund the transaction
    A_eq = np.ones((1, n))
    b_eq = np.array([amount_gbp])

    bounds = [(0, s["capacity"]) for s in slots]

    result = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq,
                     bounds=bounds, method="highs")

    if result.status != 0:
        log.error("LP solver FAILED | status=%d | %s", result.status, result.message)
        return {"error": f"LP solver: {result.message}", "allocation": []}

    log.debug("LP SOLVED  | status=OK | objective=£%.4f benefit", -result.fun)

    # ── Build Output ──────────────────────────────────────────────────────────
    allocation = []
    for i, slot in enumerate(slots):
        alloc_amt = round(result.x[i], 2)
        if alloc_amt < 0.01:
            continue

        # Reward points (Tier 1 credit cards with points system)
        reward_points_earned = 0
        reward_type = "cashback"
        if slot["tier"] == 1:
            cb_rate = slot["cashback_rates"].get(category, slot["cashback_rates"].get("other", 0))
            cashback_earned = round(alloc_amt * cb_rate, 4)
            interest_opportunity = 0.0
            fx_cost = 0.0
            # Points tracking (if card has a points system)
            pts_per_pound = slot.get("reward_points_per_pound", {})
            if pts_per_pound:
                pts_rate = pts_per_pound.get(category, pts_per_pound.get("other", 0))
                reward_points_earned = int(alloc_amt * pts_rate)
                reward_type = slot.get("reward_type", "cashback")
        elif slot["tier"] == 2:
            cashback_earned = 0.0
            interest_opportunity = round(alloc_amt * slot["savings_rate_monthly"], 4)
            fx_cost = 0.0
        else:  # Tier 3 — only place FX spread applies
            cashback_earned = 0.0
            interest_opportunity = 0.0
            fx_cost = round(alloc_amt * slot["fx_spread_rate"] + slot["transfer_fee_flat"], 4)

        allocation.append({
            "card_id":   slot["id"],
            "card_name": slot["name"],
            "tier":      slot["tier"],
            "tier_label": {1: "Credit Card", 2: "Debit Account", 3: "Intl Backup"}[slot["tier"]],
            "amount_gbp": alloc_amt,
            "cashback_earned":           cashback_earned,
            "reward_points_earned":      reward_points_earned,
            "reward_type":               reward_type,
            "interest_opportunity_lost": interest_opportunity,
            "fx_cost":                   fx_cost,
            "net_benefit":               round(alloc_amt * slot["net_benefit_rate"], 4),
            "pending_auto_debits_reserved": round(slot.get("pending_debits", 0), 2),
            "card_badge": slot.get("badge", ""),
        })

    total_cashback = sum(a["cashback_earned"] for a in allocation)
    total_interest_lost = sum(a["interest_opportunity_lost"] for a in allocation)
    total_fx_cost = sum(a["fx_cost"] for a in allocation)
    net_eom_benefit = total_cashback - total_interest_lost - total_fx_cost

    # Monthly savings interest the user earns on remaining (unspent) debit balances
    remaining_debit_interest = sum(
        info["monthly_interest"] for info in debit_interest_profile.values()
    ) - total_interest_lost  # subtract what was lost to debit spend

    if len(allocation) == 1 and allocation[0]["tier"] == 2 and allocation[0]["cashback_earned"] == 0:
        decision = "pass_through"
    elif len(allocation) == 1 and allocation[0]["tier"] == 1:
        decision = "credit_optimised"
    elif any(a["tier"] == 3 for a in allocation):
        decision = "fallback_international"
    else:
        decision = "split"  # multiple cards used (any tier combination)

    # ── Log decision outcome ───────────────────────────────────────────────────
    log.info(
        "DECISION  | %-22s | net_eom=£%+.4f | cashback=£%.4f | cards=%d",
        decision.upper(), net_eom_benefit, total_cashback, len(allocation)
    )
    for a in allocation:
        tier_lbl = {1: "Credit", 2: "Debit ", 3: "Intl  "}[a["tier"]]
        if a["tier"] == 1:
            reason = f"cashback_rate={a['cashback_earned']/a['amount_gbp']*100:.1f}%  pts={a['reward_points_earned']}"
        elif a["tier"] == 2:
            reason = f"opp_cost=£{a['interest_opportunity_lost']:.4f}  (savings interest lost)"
        else:
            reason = f"intl_fallback  fx_cost=£{a['fx_cost']:.4f}"
        log.info(
            "  → %-28s %s | £%8.2f charged | %s",
            a["card_name"], tier_lbl, a["amount_gbp"], reason
        )

    # ── Build UI Hints ──────────────────────────────────────────────
    primary_alloc = allocation[0] if allocation else {}
    primary_card  = primary_alloc.get("card_name", "your account")
    primary_badge = primary_alloc.get("card_badge", "")
    total_pts     = sum(a["reward_points_earned"] for a in allocation)
    rtype         = primary_alloc.get("reward_type", "cashback")

    # Headline: what to do
    if decision == "credit_optimised":
        ui_headline = f"Pay with {primary_card}"
    elif decision == "split":
        card_names = " + ".join(a["card_name"] for a in allocation)
        ui_headline = f"Split across {card_names}"
    elif decision == "fallback_international":
        ui_headline = f"Partial backup via {allocation[-1]['card_name']}"
    else:
        ui_headline = f"Pay from {primary_card} (debit)"

    # Earn label: points or cashback
    if total_pts > 0:
        pts_label = "pts" if rtype == "cashback" else rtype.capitalize()
        ui_earn_label = f"Earn {total_pts:,} {pts_label} (≈ £{total_cashback:.2f})"
    elif total_cashback > 0:
        ui_earn_label = f"Earn £{total_cashback:.2f} cashback"
    else:
        ui_earn_label = "No cashback on this route"

    # Comparison vs doing nothing (using primary debit)
    if net_eom_benefit > 0:
        ui_comparison = f"You're £{net_eom_benefit:.2f} better off than paying from debit"
    elif net_eom_benefit < 0:
        ui_comparison = f"Costs £{abs(net_eom_benefit):.2f} more than ideal, but no better option available"
    else:
        ui_comparison = "Same outcome as paying from debit"

    # Savings nudge
    monthly_int = sum(info["monthly_interest"] for info in debit_interest_profile.values())
    ui_savings_nudge = (
        f"Your savings keep earning £{monthly_int:.2f}/mo while this goes on credit"
        if decision == "credit_optimised" else ""
    )

    ui_hints = {
        "headline":        ui_headline,
        "earn_label":      ui_earn_label,
        "comparison":      ui_comparison,
        "card_badge":      primary_badge,
        "savings_nudge":   ui_savings_nudge,
        "net_benefit_gbp": round(net_eom_benefit, 4),
        "total_points_earned": total_pts,
        "reward_type":     rtype,
    }

    output = {
        "transaction_id": transaction.get("id"),
        "description": transaction.get("description"),
        "amount_original": amount_orig,
        "currency": currency,
        "amount_gbp": round(amount_gbp, 2),
        "category": category,
        "decision": decision,
        "ui_hints": ui_hints,
        "allocation": allocation,
        "eom_impact": {
            "total_cashback_earned":               round(total_cashback, 4),
            "total_interest_opportunity_lost":     round(total_interest_lost, 4),
            "total_fx_costs":                     round(total_fx_cost, 4),
            "net_eom_benefit":                    round(net_eom_benefit, 4),
        },
        "savings_interest_context": {
            "weighted_avg_savings_rate_annual": round(weighted_savings_rate_annual, 6),
            "weighted_avg_savings_rate_monthly": round(primary_savings_monthly, 6),
            "per_account_monthly_interest": debit_interest_profile,
            "remaining_monthly_interest_after_txn": round(remaining_debit_interest, 4),
        }
    }

    if verbose:
        _print_result(output)

    return output


# ─── PRINTER ─────────────────────────────────────────────────────────────────

def _print_header(txn, amount_orig, amount_gbp, currency):
    print("\n" + "=" * 65)
    print(f"  [{txn.get('id','?')}] {txn.get('description','')}")
    if currency != "GBP":
        print(f"  Amount : {amount_orig:,.2f} {currency}  (~£{amount_gbp:,.2f})")
    else:
        print(f"  Amount : £{amount_orig:,.2f}")
    print(f"  Category : {txn.get('category','other')}  |  Flow: {txn.get('flow','')}")
    print("=" * 65)


TIER_ICONS = {1: "💳", 2: "🏦", 3: "🌐"}
DECISION_LABELS = {
    "pass_through":          "Pass-through (no optimisation needed)",
    "credit_optimised":      "Auto-Optimised → Credit Card(s)",
    "split":                 "Split across multiple sources",
    "fallback_international":"Fallback — International card used",
}

def _print_result(res: dict):
    print(f"\n  ► {DECISION_LABELS.get(res['decision'], res['decision'])}")
    print()
    print(f"  {'Card':<30} {'Tier':<16} {'Charged':>9}  {'Net £':>8}")
    print("  " + "─" * 68)
    for a in res["allocation"]:
        icon = TIER_ICONS[a["tier"]]
        net_str = f"+£{a['net_benefit']:.4f}" if a["net_benefit"] >= 0 else f"-£{abs(a['net_benefit']):.4f}"
        print(f"  {icon} {a['card_name']:<28} {a['tier_label']:<16} £{a['amount_gbp']:>8,.2f}  {net_str:>9}")
        if a["cashback_earned"] > 0:
            print(f"      ↳ Cashback earned:         +£{a['cashback_earned']:.4f}")
        if a["interest_opportunity_lost"] > 0:
            print(f"      ↳ Savings interest lost:   -£{a['interest_opportunity_lost']:.4f}")
        if a["fx_cost"] > 0:
            print(f"      ↳ FX cost:                 -£{a['fx_cost']:.4f}")
        if a["pending_auto_debits_reserved"] > 0:
            print(f"      ↳ Auto-debits reserved:     £{a['pending_auto_debits_reserved']:.2f}")

    eom = res["eom_impact"]
    ctx = res["savings_interest_context"]
    print()
    print(f"  EOM CASH IMPACT")
    print(f"  {'Cashback earned':<40} +£{eom['total_cashback_earned']:.4f}")
    print(f"  {'Savings interest lost (opp. cost)':<40} -£{eom['total_interest_opportunity_lost']:.4f}")
    print(f"  {'FX / transfer costs':<40} -£{eom['total_fx_costs']:.4f}")
    print(f"  {'─'*50}")
    sign = "+" if eom["net_eom_benefit"] >= 0 else ""
    print(f"  {'Net EOM benefit on this transaction':<40} {sign}£{eom['net_eom_benefit']:.4f}")
    print()
    print(f"  SAVINGS INTEREST CONTEXT")
    print(f"  Blended savings rate (all accounts):    {ctx['weighted_avg_savings_rate_annual']*100:.3f}% p.a.  ({ctx['weighted_avg_savings_rate_monthly']*100:.4f}%/mo)")
    for acc_id, info in ctx["per_account_monthly_interest"].items():
        if info["annual_rate"] > 0:
            print(f"  {acc_id:<30} £{info['balance']:>9,.2f} @ {info['annual_rate']*100:.2f}%/yr → +£{info['monthly_interest']:.4f}/mo")
    print(f"  Remaining monthly interest after txn:   +£{ctx['remaining_monthly_interest_after_txn']:.4f}")
    print()


# ─── CLI + MAIN ───────────────────────────────────────────────────────────────

def run_all(user_data, transactions, today):
    results = []
    for txn in transactions:
        res = optimize_payment(txn, user_data, today=today, verbose=True)
        results.append(res)

    print("\n" + "═" * 80)
    print(f"  {'ID':<5} {'Description':<35} {'Decision':<22} {'Net EOM £':>10}")
    print("  " + "─" * 75)
    for r in results:
        if "error" in r:
            print(f"  {r['transaction_id']:<5} {'ERROR: ' + r['error']}")
            continue
        net = r["eom_impact"]["net_eom_benefit"]
        sign = "+" if net >= 0 else ""
        cards = " + ".join(a["card_name"] for a in r["allocation"])[:21]
        print(f"  {r['transaction_id']:<5} {r['description'][:34]:<35} {cards:<22} {sign}£{net:.4f}")
    print("═" * 80 + "\n")
    return results


def run_one(txn_id, user_data, transactions, today):
    txn = next((t for t in transactions if t["id"] == txn_id), None)
    if txn is None:
        print(f"Transaction ID {txn_id!r} not found.")
        return
    optimize_payment(txn, user_data, today=today, verbose=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OptiFin Payment Optimisation Engine")
    parser.add_argument("--transaction", "-t", type=str, default=None,
                        help="Run a single transaction by ID (e.g. T003). Omit to run all.")
    args = parser.parse_args()

    user_data = load_json(USER_DATA_PATH)
    txn_data  = load_json(TRANSACTIONS_PATH)
    transactions = txn_data["transactions"]
    today = date(2026, 2, 28)   # Fixed date for reproducible demo

    print("\n" + "█" * 65)
    print("  OPTIFIN — PAYMENT OPTIMISATION ENGINE")
    print("  Objective: Maximise End-of-Month Cash in Hand")
    print("  Model: Linear Programme (scipy HiGHS)")
    print("█" * 65)
    
    if args.transaction:
        print(f'User Data: {user_data}')
        print(f'Transaction Data: {transactions}')
        print(f'Today: {today}')
        run_one(args.transaction, user_data, transactions, today)
    else:
        run_all(user_data, transactions, today)
