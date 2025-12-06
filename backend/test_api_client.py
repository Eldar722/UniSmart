from fastapi.testclient import TestClient
import json
from app.main import app

client = TestClient(app)


def run_tests():
    print("=== TestClient API tests ===")

    # Register
    payload = {
        "name": "CI User",
        "email": "ci_test@example.com",
        "password": "pass123",
        "ent": 120,
        "ielts": 6.5,
        "budget": 1000000,
        "city": "Almaty"
    }

    r = client.post("/api/auth/register", json=payload)
    print("register:", r.status_code, r.json())

    # Login
    r2 = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    print("login:", r2.status_code, r2.json())
    token = r2.json().get("token")
    if not token:
        print("No token, aborting")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # Recommendations
    rec_payload = {
        "profile": {
            "entScore": 120,
            "ieltsScore": 6.5,
            "profileSubjects": ["math"],
            "interests": ["Computer Science"],
            "budget": 1000000,
            "preferredCity": "Almaty"
        },
        "top_k": 3
    }

    r3 = client.post("/api/recommendations", json=rec_payload, headers=headers)
    print("recommendations:", r3.status_code)
    data = r3.json()
    print(json.dumps(data, ensure_ascii=False, indent=2))

    # Roadmap generation (use first recommendation if available)
    recs = data.get("recommendations", [])
    if recs:
        first = recs[0]
        roadmap_req = {
            "user_id": r2.json().get("user", {}).get("id"),
            "university_id": first.get("university_id"),
            "program_id": first.get("program_id"),
            "start_date": None,
            "deadline": None,
            "preferences": {}
        }
        r4 = client.post("/api/roadmap", json=roadmap_req, headers=headers)
        print("roadmap create:", r4.status_code, r4.json())

        r5 = client.get("/api/roadmap", headers=headers)
        print("roadmap get:", r5.status_code, r5.json())


if __name__ == '__main__':
    run_tests()
