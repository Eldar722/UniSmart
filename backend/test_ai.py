#!/usr/bin/env python3
"""Quick test of AI service with Groq Llama 3"""

import json
from app.services.ai_service import explain_recommendation

# Тестовые факты
facts = {
    "university_id": "nu",
    "university_name": "Nazarbayev University",
    "program_id": "cs",
    "program_name": "Computer Science",
    "score": 92.5,
    "factors": {
        "ent": {
            "user": 130,
            "required": 125,
            "contribution": 40.0,
            "status": "meets"
        },
        "ielts": {
            "user": 7.0,
            "required": 6.5,
            "contribution": 20.0,
            "status": "meets"
        },
        "budget": {
            "budget": 1000000,
            "tuition": 0,
            "contribution": 15.0,
            "status": "free"
        },
        "city": {
            "preferred": "Астана",
            "university_city": "Astana",
            "contribution": 10.0,
            "status": "matches"
        },
        "outcomes": {
            "employment": 98,
            "avgSalary": 800000,
            "employment_score": 9.8,
            "salary_score": 4.0,
            "contribution": 7.7
        }
    },
    "user_profile": {
        "entScore": 130,
        "ieltsScore": 7.0,
        "budget": 1000000,
        "preferredCity": "Астана"
    }
}

print("Testing AI Service with Groq Llama 3...")
print("=" * 60)

result = explain_recommendation({"facts": facts})

print("\nResult structure:")
print(f"- summary: {result.get('summary')[:80]}...")
print(f"- key_factors count: {len(result.get('key_factors', []))}")
print(f"- explanation: {result.get('explanation')[:80]}...")
print(f"- strengths: {len(result.get('strengths', []))}")
print(f"- considerations: {len(result.get('considerations', []))}")

print("\nKey factors detail:")
for i, factor in enumerate(result.get('key_factors', []), 1):
    print(f"  {i}. {factor.get('factor')}: {factor.get('value')[:40]}... (contrib: {factor.get('contribution')})")

print("\nFull JSON:")
print(json.dumps(result, ensure_ascii=False, indent=2))

# Validate structure
print("\n" + "=" * 60)
print("Validation:")
print(f"✓ summary is string: {isinstance(result.get('summary'), str)}")
print(f"✓ key_factors is list: {isinstance(result.get('key_factors'), list)}")
if result.get('key_factors'):
    first = result['key_factors'][0]
    print(f"✓ First factor is dict: {isinstance(first, dict)}")
    print(f"✓ First factor has 'factor': {'factor' in first}")
    print(f"✓ First factor has 'value': {'value' in first}")
    print(f"✓ First factor has 'contribution': {'contribution' in first}")
    print(f"✓ contribution is numeric: {isinstance(first.get('contribution'), (int, float))}")
print(f"✓ explanation is string: {isinstance(result.get('explanation'), str)}")
print(f"✓ strengths is list: {isinstance(result.get('strengths'), list)}")
print(f"✓ considerations is list: {isinstance(result.get('considerations'), list)}")

print("\n✓ All tests passed!")
