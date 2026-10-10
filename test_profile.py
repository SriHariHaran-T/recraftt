import os
import json
os.environ["GROQ_API_KEY"] = "test_key"
from fastapi.testclient import TestClient
from app import app
import tracker

client = TestClient(app)

print("--- Testing Profile API ---")
# 1. Test GET (default profile)
res = client.get("/api/profile")
print("GET /api/profile:", res.status_code, res.json())
assert res.status_code == 200

# 2. Test PUT valid profile
res = client.put("/api/profile", json={"display_name": "Hari"})
print("PUT /api/profile (Hari):", res.status_code, res.json())
assert res.status_code == 200
assert res.json()["display_name"] == "Hari"

# 3. Test GET after PUT
res = client.get("/api/profile")
print("GET /api/profile (after PUT):", res.status_code, res.json())
assert res.status_code == 200
assert res.json()["display_name"] == "Hari"

# 4. Test PUT empty profile (should fail)
res = client.put("/api/profile", json={"display_name": "   "})
print("PUT /api/profile (Empty):", res.status_code, res.json())
assert res.status_code == 400

# 5. Test PUT long profile (should fail)
res = client.put("/api/profile", json={"display_name": "A" * 45})
print("PUT /api/profile (Long):", res.status_code, res.json())
assert res.status_code == 400

print("All profile API tests passed.")
