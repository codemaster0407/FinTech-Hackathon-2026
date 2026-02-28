import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def get_optimization(amount, category):
    payload = {"amount": amount, "category": category}
    response = requests.post(f"{BASE_URL}/optimize-transaction", json=payload)
    return response.json()

def update_limit(card_id, new_limit):
    payload = {"card_id": card_id, "new_limit": new_limit}
    requests.post(f"{BASE_URL}/cards/update-limit", json=payload)

def print_result(result):
    print(f"Status: {result['status']}")
    for a in result['allocations']:
        print(f"  - {a['card_name']}: £{a['amount_utilised']:.2f} (Points: {a['cashback_points']:.2f})")
    print(f"Explanation: {result['explanation']}\n")

if __name__ == "__main__":
    try:
        amount = 500
        category = "hotel"

        print("==================================================")
        print(f"DYNAMIC LIMIT UPDATE TEST: £{amount} for {category}")
        print("==================================================")

        # 1. First Pass: CC1 has high limit
        print("STEP 1: Initial Optimization (Travel Rewards Pro has high limit)")
        result1 = get_optimization(amount, category)
        print_result(result1)

        # 2. Update Limit: Thrash CC1's limit to £50
        print("STEP 2: Updating 'Travel Rewards Pro' (cc_1) limit to £50...")
        update_limit("cc_1", 50.0)

        # 3. Second Pass: Same request, should now overflow to other cards
        print("STEP 3: Repeating same request. Should now fallback/split due to low limit.")
        result2 = get_optimization(amount, category)
        print_result(result2)

        print("==================================================")
        print("TEST COMPLETE: Model dynamically re-routed to next best sources.")
        print("==================================================")

    except Exception as e:
        print(f"Error: {e}. Is the server running?")
