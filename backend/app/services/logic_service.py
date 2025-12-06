"""Business logic for UniSmart.

This module contains the core matching and scoring functions that convert a
structured user profile into ranked recommendations.

ARCHITECTURE PRINCIPLES:
1. Business logic computes match scores deterministically (no AI here)
2. AI service only interprets/explains computed scores (no scoring in AI)
3. All scoring factors are explainable and transparent
4. Separation: logic_service = WHAT matches, ai_service = WHY it matches

SCORING PHILOSOPHY:
- Each factor has a clear weight and calculation method
- Factors are independent (no complex interdependencies)
- Scores are normalized to 0-100 for easy interpretation
- Breakdown is stored for AI explanation later

DATA FLOW:
User Profile → compute_program_score() → Match Score + Factor Breakdown
                                                      ↓
                                         explain_recommendation() → Human-readable Explanation
"""

from typing import Dict, Any, List, Tuple
from ..storage.memory import list_universities, get_university
from .ai_service import explain_recommendation


def compute_program_score(profile: Dict[str, Any], university: Dict[str, Any], program: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
    """
    Compute a heuristic match score (0-100) and return a breakdown of factors.

    SCORING METHODOLOGY:
    This function implements a weighted scoring system where each factor contributes
    a maximum number of points. The total possible score is 100.

    Why this approach:
    - Transparent: Users can see exactly how each factor affects the score
    - Explainable: AI can reference specific factor contributions
    - Adjustable: Weights can be tuned based on domain knowledge
    - Fair: All factors are considered independently

    FACTOR WEIGHTS:
    - ENT Score (40 points): Most critical - determines basic eligibility
      - WHY 40%: ENT is the primary admission requirement in Kazakhstan
      - Calculation: Full points if meets requirement, linear penalty below
    
    - IELTS Score (20 points): Important for international programs
      - WHY 20%: Not all programs require IELTS, but when required it's critical
      - Calculation: Full points if meets/exceeds, penalty below, full if not required
    
    - Budget Match (15 points): Financial feasibility
      - WHY 15%: Important but shouldn't block good academic matches
      - Calculation: Full if budget covers tuition or free, proportional penalty
    
    - City Preference (10 points): Quality of life factor
      - WHY 10%: Nice to have but not critical - users can relocate
      - Calculation: Binary - matches preference or not
    
    - Career Outcomes (15 points): Long-term value
      - WHY 15%: Employment rate and salary indicate program quality
      - Calculation: Normalized employment (0-10) + salary (0-5)

    Args:
        profile: User profile dict with entScore, ieltsScore, budget, preferredCity
        university: University data dict
        program: Program data dict with requirements and outcomes

    Returns:
        Tuple of (final_score_0_to_100, factor_breakdown_dict)
    """
    score = 0.0
    breakdown: Dict[str, Any] = {}

    # FACTOR 1: ENT Score (40 points) - Primary eligibility criterion
    # This is the most important factor because ENT is the main admission exam
    ent_user = profile.get("entScore", 0)
    ent_needed = program.get("minENT", university.get("minENT", 0))
    
    if ent_user >= ent_needed:
        # User meets or exceeds requirement - full points
        ent_score = 40.0
    else:
        # Linear penalty: lose 1.2 points per point below requirement
        # This prevents harsh cutoffs and allows partial credit
        # Example: need 100, have 90 → 40 - (10 * 1.2) = 28 points
        ent_score = max(0.0, 40.0 - (ent_needed - ent_user) * 1.2)
    
    breakdown["ent"] = {
        "user": ent_user,
        "required": ent_needed,
        "contribution": round(ent_score, 1),
        "status": "meets" if ent_user >= ent_needed else "below"
    }
    score += ent_score

    # FACTOR 2: IELTS Score (20 points) - International language requirement
    # Some programs require IELTS for international accreditation or English-medium instruction
    ielts_user = profile.get("ieltsScore", 0)
    ielts_needed = program.get("minIELTS", university.get("minIELTS", 0))
    
    if ielts_needed > 0:
        # IELTS is required for this program
        if ielts_user >= ielts_needed:
            ielts_score = 20.0  # Meets requirement
        else:
            # Penalty: 6 points per 0.5 band below (IELTS scores in 0.5 increments)
            # Example: need 6.5, have 5.5 → 20 - (1.0 * 6) = 14 points
            ielts_score = max(0.0, 20.0 - (ielts_needed - ielts_user) * 6.0)
    else:
        # IELTS not required - user gets full points (no disadvantage)
        ielts_score = 20.0
    
    breakdown["ielts"] = {
        "user": ielts_user,
        "required": ielts_needed,
        "contribution": round(ielts_score, 1),
        "status": "not_required" if ielts_needed == 0 else ("meets" if ielts_user >= ielts_needed else "below")
    }
    score += ielts_score

    # FACTOR 3: Budget / Tuition Match (15 points) - Financial feasibility
    # We don't want to block good academic matches due to budget, but affordability matters
    budget = profile.get("budget", 0)
    tuition = program.get("tuition", 0)
    
    if tuition == 0:
        # Free education (government grant) - always full points
        budget_score = 15.0
    elif budget >= tuition:
        # Budget covers tuition - full points
        budget_score = 15.0
    else:
        # Budget shortfall - proportional penalty
        # Example: tuition 1M, budget 800K → 15 * (800/1000) = 12 points
        # This allows partial credit for close matches
        budget_score = max(0.0, 15.0 * (budget / max(1, tuition)))
    
    breakdown["budget"] = {
        "budget": budget,
        "tuition": tuition,
        "contribution": round(budget_score, 1),
        "status": "free" if tuition == 0 else ("covers" if budget >= tuition else "shortfall")
    }
    score += budget_score

    # FACTOR 4: City Preference (10 points) - Quality of life / convenience
    # Binary scoring - either matches or doesn't. Small weight because relocation is possible.
    preferred = profile.get("preferredCity")
    uni_city = university.get("city")
    
    # Match if: no preference, preference is "Любой", or preference matches
    city_matches = (preferred in (None, "Любой", "") or preferred == uni_city)
    city_score = 10.0 if city_matches else 0.0
    
    breakdown["city"] = {
        "preferred": preferred or "Любой",
        "university_city": uni_city,
        "contribution": city_score,
        "status": "matches" if city_matches else "different"
    }
    score += city_score

    # FACTOR 5: Career Outcomes (15 points) - Long-term value proposition
    # Combines employment rate and average salary to assess program quality
    # This helps users understand the value of their investment
    employment = program.get("employmentRate", 0)  # 0-100 percentage
    avg_salary = program.get("avgSalary", 0)  # in KZT
    
    # Employment: normalize 0-100% to 0-10 points
    # Higher employment rate = better job prospects
    employment_score = (employment / 100.0) * 10.0
    
    # Salary: normalize relative to baseline (2M KZT = excellent salary)
    # Cap at 5 points even if salary exceeds baseline
    salary_score = min(5.0, (avg_salary / 2000000.0) * 5.0)
    
    outcomes_score = employment_score + salary_score
    
    breakdown["outcomes"] = {
        "employment": employment,
        "avgSalary": avg_salary,
        "employment_score": round(employment_score, 1),
        "salary_score": round(salary_score, 1),
        "contribution": round(outcomes_score, 1)
    }
    score += outcomes_score

    # Ensure in 0-100
    final = max(0.0, min(100.0, round(score, 1)))
    return final, breakdown


def recommend(profile: Dict[str, Any], top_k: int = 5, is_simulation: bool = False) -> List[Dict[str, Any]]:
    """
    Generate top-k university program recommendations with structured explanations.

    ALGORITHM:
    1. Score all programs across all universities using compute_program_score()
    2. For each scored program, generate AI explanation from computed facts
    3. Sort by score (descending) and return top-k

    WHY THIS APPROACH:
    - Exhaustive scoring ensures no good matches are missed
    - AI explanations are generated from computed facts only (no hallucinations)
    - Sorting by score provides transparent ranking
    - Top-k limits results to most relevant options

    DATA FLOW:
    User Profile → Score All Programs → Generate Explanations → Sort → Top-K

    Args:
        profile: User profile dict with scores, preferences, constraints
        top_k: Number of top recommendations to return (default: 5)
        is_simulation: If True, mark these as what-if/simulated recommendations
                       (used for frontend to distinguish real vs. simulated data)

    Returns:
        List of recommendation dicts, each containing:
        - university_id, program_id: Identifiers
        - university_name, program_name: Display names
        - score: Match score (0-100)
        - factors: Detailed breakdown of scoring factors
        - explanation: AI-generated explanation with summary, key_factors, strengths, etc.
        - is_simulation: Boolean flag indicating if this is a simulated recommendation
    """
    candidates: List[Dict[str, Any]] = []
    
    # STEP 1: Score all programs across all universities
    # We evaluate every program to ensure comprehensive matching
    for uni in list_universities():
        for prog in uni.get("programs", []):
            # Compute deterministic match score
            score, breakdown = compute_program_score(profile, uni, prog)
            
            # Build facts dictionary for AI explanation
            # Only include computed/verified data - no external knowledge
            facts = {
                "university_id": uni.get("id"),
                "university_name": uni.get("name"),
                "program_id": prog.get("id"),
                "program_name": prog.get("name"),
                "score": score,
                "factors": breakdown,
                # Optional: include user profile context for better explanations
                "user_profile": {
                    "entScore": profile.get("entScore"),
                    "ieltsScore": profile.get("ieltsScore"),
                    "budget": profile.get("budget"),
                    "preferredCity": profile.get("preferredCity")
                }
            }

            # STEP 2: Generate AI explanation from facts
            # AI only interprets computed scores - it doesn't score itself
            try:
                explanation_data = explain_recommendation({"facts": facts})
            except Exception as e:
                # If AI fails, use minimal fallback explanation
                import sys
                print(f"[Logic Service] AI explanation failed for {uni.get('id')}/{prog.get('id')}: {e}", file=sys.stderr)
                explanation_data = {
                    "summary": f"{uni.get('name')} — {prog.get('name')}. Балл соответствия: {score:.1f}/100.",
                    "key_factors": [],
                    "explanation": "Рекомендация основана на анализе соответствия критериев.",
                    "strengths": [],
                    "considerations": []
                }

            # STEP 3: Build candidate recommendation
            candidates.append({
                "university_id": uni.get("id"),
                "program_id": prog.get("id"),
                "university_name": uni.get("name"),
                "program_name": prog.get("name"),
                "score": score,
                "factors": breakdown,
                "explanation": explanation_data,
                "is_simulation": is_simulation,
            })

    # STEP 4: Sort by score (descending) and return top-k
    # Higher scores indicate better matches
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[:top_k]


def what_if(profile: Dict[str, Any], changes: Dict[str, Any], top_k: int = 5) -> Dict[str, Any]:
    """
    Perform what-if analysis: simulate how recommendations change with parameter modifications.

    USE CASES:
    - "What if I improve my ENT score by 10 points?"
    - "What if my budget increases to 1.5M?"
    - "What if I'm flexible on city preference?"

    ALGORITHM:
    1. Generate base recommendations from current profile
    2. Apply changes to create scenario profile
    3. Generate scenario recommendations
    4. Compute deltas (score changes) for programs that appear in both

    WHY THIS MATTERS:
    - Helps users understand impact of improving scores/budget
    - Enables informed decision-making about preparation/planning
    - Demonstrates sensitivity of recommendations to input changes

    Args:
        profile: Current user profile
        changes: Dict of changes to apply (e.g., {"entScore": 125, "budget": 1500000})
        top_k: Number of recommendations to compare

    Returns:
        Dict with:
        - base: Original recommendations (list)
        - scenario: Recommendations after changes (list)
        - deltas: Score changes for programs in both sets (list)
          Each delta item contains: id, before, after, delta_score
    """
    # Generate baseline recommendations
    base = recommend(profile, top_k=top_k)
    
    # Create scenario profile by applying changes
    # Changes override existing profile values
    scenario_profile = dict(profile)
    scenario_profile.update(changes)
    
    # Generate scenario recommendations
    scenario = recommend(scenario_profile, top_k=top_k)

    # Compute deltas: compare programs that appear in both base and scenario
    # Use composite key "university_id-program_id" for matching
    base_map = {f"{b['university_id']}-{b['program_id']}": b for b in base}
    scenario_map = {f"{s['university_id']}-{s['program_id']}": s for s in scenario}

    deltas = []
    
    # Track all programs from scenario (new or changed)
    for key, s_item in scenario_map.items():
        b_item = base_map.get(key)
        
        if b_item:
            # Program exists in both: compute score change
            delta_score = round(s_item["score"] - b_item["score"], 1)
            deltas.append({
                "id": key,
                "before": b_item,
                "after": s_item,
                "delta_score": delta_score,
                "status": "improved" if delta_score > 0 else ("declined" if delta_score < 0 else "unchanged")
            })
        else:
            # Program is new in scenario (wasn't in top-k before)
            deltas.append({
                "id": key,
                "before": None,
                "after": s_item,
                "delta_score": None,
                "status": "new_entry"
            })
    
    # Also track programs that dropped out of top-k
    for key, b_item in base_map.items():
        if key not in scenario_map:
            deltas.append({
                "id": key,
                "before": b_item,
                "after": None,
                "delta_score": None,
                "status": "dropped_out"
            })

    return {
        "base": base,
        "scenario": scenario,
        "deltas": deltas,
        "changes_applied": changes
    }


# Backwards-compatible simple AI handler (kept for legacy / debugging)
def ai_navigator_logic(user_id: str, user_message: str):
    # Very small wrapper that records memory and returns an AI-style answer
    from storage.memory import get_user_memory, save_to_memory

    memory = get_user_memory(user_id)
    save_to_memory(user_id, f"User: {user_message}")
    # Build a short factual context and ask AI to reply
    facts = {"memory": memory, "query": user_message}
    answer = explain_recommendation({"facts": facts})
    save_to_memory(user_id, f"AI: {answer}")
    return answer, memory
