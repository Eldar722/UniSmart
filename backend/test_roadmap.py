#!/usr/bin/env python3
"""Test roadmap generation"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Register
r = client.post("/api/auth/register", json={
    "name": "Roadmap Tester",
    "email": "roadmap@test.com",
    "password": "pass123",
})
print("Register:", r.status_code)
token = r.json().get("token")
user_id = r.json().get("user", {}).get("id")
headers = {"Authorization": f"Bearer {token}"}

# Create roadmap
payload = {
    "user_id": user_id,
    "university_id": "nu",
    "program_id": "cs",
    "start_date": None,
    "deadline": None,
    "preferences": {}
}

r = client.post("/api/roadmap", json=payload, headers=headers)
print(f"\nRoadmap POST: {r.status_code}")
data = r.json()
print(f"Success: {data.get('success')}")
print(f"Roadmap items: {len(data.get('roadmap', []))}")

if data.get('roadmap'):
    print("\nFirst 3 items:")
    for item in data.get('roadmap', [])[:3]:
        print(f"  - {item.get('title')} ({item.get('due_date')})")

# Get roadmap
r = client.get("/api/roadmap", headers=headers)
print(f"\nRoadmap GET: {r.status_code}")
data = r.json()
print(f"Success: {data.get('success')}")
print(f"Items stored: {len(data.get('roadmap', []))}")
