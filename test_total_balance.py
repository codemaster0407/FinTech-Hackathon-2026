import requests
import json

BASE_URL = "http://127.0.0.1:8001"


def test_total_balance():
    print("\n--- Testing Total Balance Endpoint ---")
    try:
        response = requests.get(f"{BASE_URL}/cards/total-balance")
        result = response.json()
        print(json.dumps(result, indent=2))

        expected_total = 25641.0
        if result['total_gbp_balance'] == expected_total:
            print(
                f"SUCCESS: Total GBP balance matches expected value: £{expected_total}")
        else:
            print(
                f"FAILURE: Expected £{expected_total}, but got £{result['total_gbp_balance']}")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_total_balance()
