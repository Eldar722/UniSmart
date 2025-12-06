#!/usr/bin/env python
"""Direct test of smart roadmap generation logic."""

import sys
sys.path.insert(0, "/Users/root/Desktop/o/Coding/Hackathon")

from backend.app.services.ai_service import generate_roadmap
from datetime import datetime, timedelta

def test_case(name, profile, program, uni):
    """Test a single roadmap case."""
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print(f"{'='*80}")
    print(f"Profile: ENT={profile['entScore']}, IELTS={profile['ieltsScore']}, Budget={profile['budget']:,.0f} KZT")
    print(f"Program: {program['name']}, Min ENT={program['minENT']}, Min IELTS={program['minIELTS']}")
    print(f"Tuition: {program['tuition']:,.0f} KZT/year\n")
    
    # Create context
    context = {
        "user_profile": profile,
        "program": program,
        "university": uni,
        "start_date": datetime.utcnow().date().isoformat(),
        "deadline": (datetime.utcnow() + timedelta(days=180)).date().isoformat()
    }
    
    # Generate roadmap
    result = generate_roadmap(context)
    roadmap = result.get("roadmap", [])
    
    print(f"Generated {len(roadmap)} roadmap items:\n")
    for i, item in enumerate(roadmap, 1):
        print(f"  {i}. {item['title']}")
        print(f"     Priority: {item['priority']}, Due: {item['due_date']}")
        desc = item['description'][:120]
        print(f"     {desc}...")
        if item.get('subtasks'):
            print(f"     Subtasks: {len(item['subtasks'])}")
        print()
    
    return roadmap

# Test data
uni_kbtu = {
    "id": "kbtu",
    "name": "Казахский национальный технический университет",
    "city": "Almaty",
    "minENT": 70,
    "minIELTS": 6.0
}

uni_nu = {
    "id": "nu",
    "name": "Назарбаев Университет",
    "city": "Nur-Sultan",
    "minENT": 80,
    "minIELTS": 7.0
}

prog_cs = {
    "id": "cs",
    "name": "Computer Science",
    "degree": "Bachelor",
    "language": "Английский",
    "minENT": 75,
    "minIELTS": 6.5,
    "tuition": 3500000,
    "employmentRate": 92
}

prog_med = {
    "id": "med",
    "name": "Medicine",
    "degree": "Bachelor",
    "language": "Русский",
    "minENT": 80,
    "minIELTS": 6.0,
    "tuition": 5000000,
    "employmentRate": 95
}

prog_business = {
    "id": "bus",
    "name": "Business Administration",
    "degree": "Bachelor",
    "language": "Английский",
    "minENT": 65,
    "minIELTS": 5.5,
    "tuition": 2500000,
    "employmentRate": 88
}

# Test Case 1: Low IELTS, medium ENT, low budget
profile_1 = {
    "entScore": 65,
    "ieltsScore": 4.5,
    "budget": 2000000,
    "preferredCity": "Almaty",
    "interests": ["IT", "Engineering"],
    "subjects": ["Math", "Physics"]
}
roadmap_1 = test_case(
    "Case 1: Low IELTS (4.5), Medium ENT (65), Low Budget",
    profile_1, prog_cs, uni_kbtu
)

# Test Case 2: High IELTS, low ENT, high budget
profile_2 = {
    "entScore": 40,
    "ieltsScore": 7.5,
    "budget": 8000000,
    "preferredCity": "Nur-Sultan",
    "interests": ["Medicine", "Healthcare"],
    "subjects": ["Biology", "Chemistry"]
}
roadmap_2 = test_case(
    "Case 2: High IELTS (7.5), Low ENT (40), High Budget",
    profile_2, prog_med, uni_nu
)

# Test Case 3: Balanced, very low budget
profile_3 = {
    "entScore": 75,
    "ieltsScore": 6.0,
    "budget": 500000,
    "preferredCity": "Karaganda",
    "interests": ["Law", "Economics"],
    "subjects": ["History", "English"]
}
roadmap_3 = test_case(
    "Case 3: Balanced (ENT 75, IELTS 6.0), Very Low Budget",
    profile_3, prog_business, uni_kbtu
)

# Verify uniqueness
print(f"\n{'='*80}")
print("UNIQUENESS CHECK")
print(f"{'='*80}\n")

print("Roadmap 1 vs Roadmap 2 - DIFFERENT?")
items_1 = [item['title'] for item in roadmap_1]
items_2 = [item['title'] for item in roadmap_2]
same_count = len(set(items_1) & set(items_2))
print(f"  Shared titles: {same_count}")
print(f"  ✓ UNIQUE!" if same_count < len(items_1) * 0.5 else "  ✗ Too similar")

print("\nRoadmap 1 vs Roadmap 3 - DIFFERENT?")
items_3 = [item['title'] for item in roadmap_3]
same_count = len(set(items_1) & set(items_3))
print(f"  Shared titles: {same_count}")
print(f"  ✓ UNIQUE!" if same_count < len(items_1) * 0.5 else "  ✗ Too similar")

print("\nRoadmap 2 vs Roadmap 3 - DIFFERENT?")
same_count = len(set(items_2) & set(items_3))
print(f"  Shared titles: {same_count}")
print(f"  ✓ UNIQUE!" if same_count < len(items_2) * 0.5 else "  ✗ Too similar")

print("\n" + "="*80)
print("✓ All tests completed!")
print("="*80)
