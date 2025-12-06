#!/usr/bin/env python
"""Test smart roadmap generation with different user profiles."""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8001"

def test_smart_roadmap():
    """Test roadmap generation with different user profiles."""
    
    # Register a test user
    register_resp = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": "smart_test@test.com", "password": "test123"}
    )
    user_data = register_resp.json()
    token = user_data.get("token")
    user_id = user_data.get("user", {}).get("id")
    print(f"✓ Registered user: {user_id}")
    print(f"  Token: {token[:20]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test Case 1: Student with low IELTS, medium ENT, low budget
    print("\n" + "="*80)
    print("TEST CASE 1: Low IELTS (4.5), Medium ENT (65), Low Budget (2M KZT)")
    print("="*80)
    
    profile1 = {
        "entScore": 65,
        "ieltsScore": 4.5,
        "budget": 2000000,
        "preferredCity": "Almaty",
        "interests": ["IT", "Engineering"],
        "subjects": ["Math", "Physics"]
    }
    
    roadmap_req1 = {
        "user_id": user_id,
        "university_id": "nu",
        "program_id": "cs",
        "start_date": datetime.utcnow().date().isoformat(),
        "deadline": (datetime.utcnow() + timedelta(days=365)).date().isoformat(),
        "preferences": {"include_prep": True}
    }
    
    # Update user profile
    requests.put(f"{BASE_URL}/api/user/profile", json=profile1, headers=headers)
    
    # Generate roadmap
    resp1 = requests.post(
        f"{BASE_URL}/api/roadmap",
        json=roadmap_req1,
        headers=headers
    )
    
    if resp1.status_code == 200:
        data = resp1.json()
        if data.get("success"):
            roadmap = data.get("roadmap", [])
            print(f"✓ Generated {len(roadmap)} roadmap items:")
            for i, item in enumerate(roadmap, 1):
                print(f"\n  {i}. {item.get('title')}")
                print(f"     Priority: {item.get('priority')}")
                print(f"     Due: {item.get('due_date')}")
                desc = item.get('description', '')[:100]
                print(f"     Desc: {desc}...")
                if item.get('subtasks'):
                    print(f"     Subtasks: {len(item['subtasks'])}")
    else:
        print(f"✗ Failed: {resp1.status_code}")
        print(resp1.text)
    
    # Test Case 2: Student with high IELTS, low ENT, high budget
    print("\n" + "="*80)
    print("TEST CASE 2: High IELTS (7.5), Low ENT (40), High Budget (8M KZT)")
    print("="*80)
    
    profile2 = {
        "entScore": 40,
        "ieltsScore": 7.5,
        "budget": 8000000,
        "preferredCity": "Nur-Sultan",
        "interests": ["Medicine", "Healthcare"],
        "subjects": ["Biology", "Chemistry"]
    }
    
    roadmap_req2 = {
        "user_id": user_id,
        "university_id": "kbtu",
        "program_id": "med",
        "start_date": datetime.utcnow().date().isoformat(),
        "deadline": (datetime.utcnow() + timedelta(days=365)).date().isoformat(),
        "preferences": {"include_prep": True}
    }
    
    # Update user profile
    requests.put(f"{BASE_URL}/api/user/profile", json=profile2, headers=headers)
    
    # Generate roadmap
    resp2 = requests.post(
        f"{BASE_URL}/api/roadmap",
        json=roadmap_req2,
        headers=headers
    )
    
    if resp2.status_code == 200:
        data = resp2.json()
        if data.get("success"):
            roadmap = data.get("roadmap", [])
            print(f"✓ Generated {len(roadmap)} roadmap items:")
            for i, item in enumerate(roadmap, 1):
                print(f"\n  {i}. {item.get('title')}")
                print(f"     Priority: {item.get('priority')}")
                print(f"     Due: {item.get('due_date')}")
                desc = item.get('description', '')[:100]
                print(f"     Desc: {desc}...")
                if item.get('subtasks'):
                    print(f"     Subtasks: {len(item['subtasks'])}")
    else:
        print(f"✗ Failed: {resp2.status_code}")
        print(resp2.text)
    
    # Test Case 3: Student with balanced scores, very low budget
    print("\n" + "="*80)
    print("TEST CASE 3: Balanced (ENT 75, IELTS 6.0), Very Low Budget (500K KZT)")
    print("="*80)
    
    profile3 = {
        "entScore": 75,
        "ieltsScore": 6.0,
        "budget": 500000,
        "preferredCity": "Karaganda",
        "interests": ["Law", "Economics"],
        "subjects": ["History", "English"]
    }
    
    roadmap_req3 = {
        "user_id": user_id,
        "university_id": "kbtu",
        "program_id": "bus",
        "start_date": datetime.utcnow().date().isoformat(),
        "deadline": (datetime.utcnow() + timedelta(days=180)).date().isoformat(),
        "preferences": {"include_prep": True}
    }
    
    # Update user profile
    requests.put(f"{BASE_URL}/api/user/profile", json=profile3, headers=headers)
    
    # Generate roadmap
    resp3 = requests.post(
        f"{BASE_URL}/api/roadmap",
        json=roadmap_req3,
        headers=headers
    )
    
    if resp3.status_code == 200:
        data = resp3.json()
        if data.get("success"):
            roadmap = data.get("roadmap", [])
            print(f"✓ Generated {len(roadmap)} roadmap items:")
            for i, item in enumerate(roadmap, 1):
                print(f"\n  {i}. {item.get('title')}")
                print(f"     Priority: {item.get('priority')}")
                print(f"     Due: {item.get('due_date')}")
                desc = item.get('description', '')[:100]
                print(f"     Desc: {desc}...")
                if item.get('subtasks'):
                    print(f"     Subtasks: {len(item['subtasks'])}")
    else:
        print(f"✗ Failed: {resp3.status_code}")
        print(resp3.text)
    
    print("\n" + "="*80)
    print("✓ All tests completed!")
    print("="*80)

if __name__ == "__main__":
    test_smart_roadmap()
