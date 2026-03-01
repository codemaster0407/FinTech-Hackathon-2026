from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)
resp = client.post("/api/optimize-transaction",
                   json={"amount": 120.5, "category": "travel"})
print('STATUS:', resp.status_code)
try:
    print(json.dumps(resp.json(), indent=2))
except Exception:
    print('RAW:', resp.text)
