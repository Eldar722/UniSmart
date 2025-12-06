#!/usr/bin/env python3
"""
Simple API test script to verify UniSmart backend endpoints work correctly.
Run this after starting the FastAPI server with: uvicorn app.main:app --reload --port 8000
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_register():
    """Test user registration"""
    print("\n=== Testing Registration ===")
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "ent": 120,
        "ielts": 6.5,
        "budget": 1000000,
        "city": "Almaty"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)}")
        
        if response.ok and data.get("success"):
            return data.get("token"), data.get("user", {}).get("id")
        return None, None
    except Exception as e:
        print(f"Error: {e}")
        return None, None


def test_login(email="test@example.com", password="password123"):
    """Test user login"""
    print("\n=== Testing Login ===")
    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)}")
        
        if response.ok and data.get("success"):
            return data.get("token")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


def test_get_current_user(token):
    """Test getting current user"""
    print("\n=== Testing Get Current User ===")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)}")
        return response.ok
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_recommendations(token):
    """Test getting recommendations"""
    print("\n=== Testing Recommendations (AI Navigator) ===")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "profile": {
            "entScore": 120,
            "ieltsScore": 6.5,
            "profileSubjects": ["math", "physics"],
            "interests": ["Computer Science"],
            "budget": 1000000,
            "preferredCity": "Almaty"
        },
        "top_k": 3
    }
    
    try:
        response = requests.post(f"{BASE_URL}/recommendations", json=payload, headers=headers)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        # Pretty print recommendations
        if "recommendations" in data:
            print(f"\nGot {len(data['recommendations'])} recommendations:")
            for i, rec in enumerate(data["recommendations"], 1):
                print(f"\n{i}. {rec.get('university_name')} - {rec.get('program_name')}")
                print(f"   Score: {rec.get('score')}/100")
                if rec.get("explanation"):
                    print(f"   Summary: {rec['explanation'].get('summary', 'N/A')}")
                    print(f"   Factors: {len(rec['explanation'].get('key_factors', []))} factors analyzed")
        else:
            print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)}")
        
        return response.ok and len(data.get("recommendations", [])) > 0
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_what_if(token):
    """Test what-if analysis"""
    print("\n=== Testing What-If Analysis ===")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "profile": {
            "entScore": 120,
            "ieltsScore": 6.5,
            "profileSubjects": ["math", "physics"],
            "interests": ["Computer Science"],
            "budget": 1000000,
            "preferredCity": "Almaty"
        },
        "changes": {
            "entScore": 140,  # Simulate improvement
        },
        "top_k": 3
    }
    
    try:
        response = requests.post(f"{BASE_URL}/what-if", json=payload, headers=headers)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if "deltas" in data:
            print(f"\nAnalyzing impact of changes...")
            print(f"Base recommendations: {len(data.get('base', []))}")
            print(f"Scenario recommendations: {len(data.get('scenario', []))}")
            print(f"Deltas: {len(data.get('deltas', []))}")
            
            for delta in data.get("deltas", [])[:3]:
                print(f"\n  {delta['id']}: {delta['status']}")
                if delta.get('delta_score') is not None:
                    print(f"    Score change: {delta['delta_score']:+.1f}")
        else:
            print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)}")
        
        return response.ok
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("=" * 60)
    print("UniSmart Backend API Test Suite")
    print("=" * 60)
    
    # Test registration
    token, user_id = test_register()
    if not token:
        print("\n❌ Registration failed, trying login...")
        token = test_login()
    
    if not token:
        print("\n❌ Could not obtain token!")
        sys.exit(1)
    
    print(f"\n✓ Token obtained: {token[:20]}...")
    
    # Test get current user
    if not test_get_current_user(token):
        print("❌ Failed to get current user")
    else:
        print("✓ Successfully retrieved current user")
    
    # Test recommendations (main feature)
    if not test_recommendations(token):
        print("❌ Failed to get recommendations")
    else:
        print("✓ Successfully got recommendations with AI explanations")
    
    # Test what-if analysis
    if not test_what_if(token):
        print("❌ Failed what-if analysis")
    else:
        print("✓ Successfully performed what-if analysis")
    
    print("\n" + "=" * 60)
    print("Testing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
