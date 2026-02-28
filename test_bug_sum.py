import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_large_transaction():
    print("\n--- Testing Large Transaction (£23,000) ---")
    payload = {
        "amount": 23000,
        "category": "travel"
    }
    try:
        response = requests.post(f"{BASE_URL}/optimize-transaction", json=payload)
        
        if response.status_code == 400:
            print(f"SUCCESS: Received expected 400 error.")
            print(f"Detail: {response.json()['detail']}")
            return

        result = response.json()
        print(f"Status: {result.get('status', 'N/A')}")
        sum_allocated = sum(a['amount_utilised'] for a in result.get('allocations', []))
        print(f"Input Amount  : £23000")
        print(f"Sum Allocated : £{sum_allocated}")
        print(f"Allocations:")
        for a in result['allocations']:
            print(f"  - {a['card_name']}: £{a['amount_utilised']}")
            
        if abs(sum_allocated - 23000) > 0.01:
            print(f"Mismatch detected! Difference: £{23000 - sum_allocated}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_large_transaction()
