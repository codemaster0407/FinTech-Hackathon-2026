import requests
import json
import time
from api.models import Sector

BASE_URL = "http://127.0.0.1:8000"

def print_separator():
    print("-" * 60)

def run_test(name, amount, category):
    print(f"\n[USE CASE]: {name}")
    print(f"Request  : £{amount} | Category: {category}")
    payload = {
        "amount": amount,
        "category": category
    }
    try:
        response = requests.post(f"{BASE_URL}/optimize-transaction", json=payload)
        result = response.json()
        
        print(f"Status   : {result['status']}")
        print("Allocations:")
        for a in result['allocations']:
            sector_info = f" ({a['cashback_sector']})" if a['cashback_sector'] else ""
            print(f"  - {a['card_name']:<25}: £{a['amount_utilised']:>8.2f} | Points: {a['cashback_points']:>6.2f}{sector_info:<10} | Int. Impact: £{a['interest_saved']:>8.4f}")
        
        print(f"Explanation: {result['explanation']}")
    except Exception as e:
        print(f"Error connecting to server: {e}")
    print_separator()

def update_card_limit(card_id, new_limit):
    print(f"\n[ACTION]: Updating Card {card_id} limit to £{new_limit}...")
    payload = {"card_id": card_id, "new_limit": new_limit}
    requests.post(f"{BASE_URL}/cards/update-limit", json=payload)

# Correcting the function for preferences
def set_user_preferences(priorities):
    print(f"\n[ACTION]: Updating User Priorities to {priorities}...")
    payload = {"point_priority": priorities}
    requests.post(f"{BASE_URL}/user/update-preferences", json=payload)

def reset_environment():
    print("\n[SETUP]: Resetting environment for clean demo...")
    update_card_limit("cc_1", 1000.0) # Amex Gold Limit
    set_user_preferences([Sector.HOTEL, Sector.TRAVEL, Sector.SHOPPING, Sector.FUEL, Sector.GROCERY, Sector.GENERAL])

if __name__ == "__main__":
    print("=" * 60)
    print("CARD OPTIMIZATION POC - COMPREHENSIVE END-TO-END DEMO")
    print("=" * 60)

    reset_environment()

    # 1. Basic Pass-through
    run_test("Pass-through (Small Amount)", 20, "grocery")

    # 2. Automatic Mode: Balanced (High Reward Sector)
    # Picks Amex Gold (3% Hotel) or Capital One (8% Hotel!) 
    run_test("Auto-Mode: Balanced (Hotel)", 100, "hotel")

    # 3. Automatic Mode: Interest Only (General Sector)
    # Ignores rewards, focuses on lowest interest rate impact
    run_test("Auto-Mode: Interest Only (General)", 200, "general")

    # 4. Split Threshold (Under £50)
    # Even if multiple cards exist, £40 stays on one card for simplicity
    run_test("Split Threshold (No Split for £40)", 40, "hotel")

    # 5. Multiple Sources (Balanced Waterfall)
    # Splitting across CCs and Debit accounts
    run_test("Multiple Sources Splitting", 5000, "shopping")

    # 6. International FX Conversion & Fallback
    # UK Liquidity: CC (~4000) + Debit (~3300) = ~7300
    # Requesting £8000 forces the use of State Bank of India (INR conversion)
    run_test("International FX Conversion (State Bank of India)", 8000, "travel")

    # 7. Dynamic Limit Redirection
    # We show how it optimizes, then we change a limit, and it re-optimizes
    print("\n--- DYNAMIC LIMIT TEST ---")
    run_test("Pre-Limit Change", 500, "hotel")
    update_card_limit("cc_3", 50) # Slash the limit of the best hotel card (Capital One)
    run_test("Post-Limit Change (Re-routed to next best)", 500, "hotel")

    # 8. Dynamic Preference Redirection
    # We change what the user values most
    print("\n--- DYNAMIC PREFERENCE TEST ---")
    run_test("Default Preference", 1000, "grocery")
    # Shift grocery to bottom
    set_user_preferences([Sector.SHOPPING, Sector.HOTEL, Sector.TRAVEL, Sector.FUEL, Sector.GROCERY, Sector.GENERAL])
    run_test("Updated Preference", 1000, "grocery")

    print("\n" + "=" * 60)
    print("DEMO COMPLETE")
    print("=" * 60)
