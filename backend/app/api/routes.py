from fastapi import APIRouter, Header, HTTPException
from ..models.schemas import (
    AIRequest,
    AIResponse,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    RecommendationRequest,
    RecommendationResponse,
    WhatIfRequest,
    WhatIfResponse,
    UserFavoritesRequest,
    UserFavoritesResponse,
    UserComparisonRequest,
    UserComparisonResponse,
    UserProfileRequest,
    UserProfileResponse,
    RoadmapRequest,
    RoadmapResponse,
    ApplicationsRequest,
    ApplicationsResponse,
)
from ..services.logic_service import ai_navigator_logic, recommend, what_if
from ..services.ai_service import generate_roadmap
from ..services.auth_service import (
    register_user,
    login_user,
    verify_token,
    logout_user,
    get_user_by_id,
    save_user_favorites,
    get_user_favorites,
    save_user_comparison,
    get_user_comparison,
    save_user_profile,
    get_user_profile,
)
from ..storage.memory import get_university, get_program, save_roadmap, get_roadmap, save_applications, get_applications


router = APIRouter()

# Auth endpoints
@router.post("/auth/register", response_model=AuthResponse)
def register(data: RegisterRequest):
    """Register a new user"""
    # Use email as password if password not provided
    password = data.password or data.email
    success, message, user = register_user(data.name, data.email, password)
    
    # Save profile if provided
    if success and user and (data.ent or data.ielts or data.budget or data.city):
        profile = {
            "entScore": data.ent,
            "ieltsScore": data.ielts,
            "budget": data.budget,
            "preferredCity": data.city,
            "profileSubjects": data.outcomes or []
        }
        save_user_profile(user.get("id"), profile)
    
    return {
        "success": success,
        "message": message,
        "user": user,
        "token": user.get("token") if user else None,
    }


@router.post("/auth/login", response_model=AuthResponse)
def login(data: LoginRequest):
    """Login user"""
    success, message, user = login_user(data.email, data.password)
    return {
        "success": success,
        "message": message,
        "user": user,
        "token": user.get("token") if user else None,
    }


@router.post("/auth/logout", response_model=AuthResponse)
def logout(authorization: str = Header(None)):
    """Logout user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    success, message = logout_user(token)

    return {
        "success": success,
        "message": message,
    }


@router.get("/auth/me", response_model=AuthResponse)
def get_current_user(authorization: str = Header(None)):
    """Get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = get_user_by_id(session_data["user_id"])

    return {
        "success": True,
        "message": "User data retrieved",
        "user": user,
    }


# AI endpoint (legacy conversational)
@router.post("/ai", response_model=AIResponse)
def ai_handler(data: AIRequest):
    """Handle AI requests (legacy conversational wrapper)"""
    answer, memory = ai_navigator_logic(
        user_id=data.user_id,
        user_message=data.message,
    )
    return {
        "answer": answer,
        "memory_used": memory,
    }


# Recommendations endpoint
@router.post("/recommendations", response_model=RecommendationResponse)
def recommendations(req: RecommendationRequest, simulate: bool = False):
    """
    Generate university program recommendations with AI explanations.
    
    Query Parameters:
    - simulate (bool): If true, treat the provided profile as a simulated/what-if scenario.
                       Otherwise, treat as the current user profile.
    """
    try:
        # Convert profile to dict and generate recommendations
        profile_dict = req.profile.dict()
        recs = recommend(profile_dict, top_k=req.top_k or 5, is_simulation=simulate)
        return {"recommendations": recs}
    except Exception as e:
        # Log error and return empty list to prevent frontend crash
        import sys
        print(f"[Recommendations] Error generating recommendations: {type(e).__name__}: {e}", file=sys.stderr)
        return {"recommendations": []}


# What-if analysis
@router.post("/what-if", response_model=WhatIfResponse)
def what_if_handler(req: WhatIfRequest):
    result = what_if(req.profile.dict(), req.changes, top_k=req.top_k)
    return result


# User Favorites endpoints
@router.post("/user/favorites", response_model=UserFavoritesResponse)
def save_favorites(req: UserFavoritesRequest, authorization: str = Header(None)):
    """Save user favorites"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = session_data["user_id"]
    success = save_user_favorites(user_id, req.favorites)
    
    return {
        "success": success,
        "favorites": req.favorites if success else [],
    }


@router.get("/user/favorites", response_model=UserFavoritesResponse)
def get_favorites(authorization: str = Header(None)):
    """Get user favorites"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = session_data["user_id"]
    favorites = get_user_favorites(user_id)
    
    return {
        "success": True,
        "favorites": favorites,
    }


# User Comparison endpoints
@router.post("/user/comparison", response_model=UserComparisonResponse)
def save_comparison(req: UserComparisonRequest, authorization: str = Header(None)):
    """Save user comparison list"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = session_data["user_id"]
    success = save_user_comparison(user_id, req.comparison_list)
    
    return {
        "success": success,
        "comparison_list": req.comparison_list if success else [],
    }


@router.get("/user/comparison", response_model=UserComparisonResponse)
def get_comparison(authorization: str = Header(None)):
    """Get user comparison list"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = session_data["user_id"]
    comparison_list = get_user_comparison(user_id)
    
    return {
        "success": True,
        "comparison_list": comparison_list,
    }


# User Profile endpoints
@router.get("/user/profile", response_model=UserProfileResponse)
def get_profile(authorization: str = Header(None)):
    """Get user profile settings"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = session_data["user_id"]
    profile = get_user_profile(user_id)
    
    return {
        "success": True,
        "profile": profile,
        "message": "Profile retrieved successfully",
    }


@router.put("/user/profile", response_model=UserProfileResponse)
def update_profile(req: UserProfileRequest, authorization: str = Header(None)):
    """Update user profile settings"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = session_data["user_id"]
    
    # Prepare profile data (only non-None fields)
    profile_data = {}
    if req.entScore is not None:
        profile_data["entScore"] = req.entScore
    if req.ieltsScore is not None:
        profile_data["ieltsScore"] = req.ieltsScore
    if req.profileSubjects is not None:
        profile_data["profileSubjects"] = req.profileSubjects
    if req.interests is not None:
        profile_data["interests"] = req.interests
    if req.budget is not None:
        profile_data["budget"] = req.budget
    if req.preferredCity is not None:
        profile_data["preferredCity"] = req.preferredCity
    
    success = save_user_profile(user_id, profile_data)
    
    if success:
        updated_profile = get_user_profile(user_id)
        return {
            "success": True,
            "profile": updated_profile,
            "message": "Profile updated successfully",
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to update profile")


# Roadmap endpoints
@router.post("/roadmap", response_model=RoadmapResponse)
def create_roadmap(req: RoadmapRequest, authorization: str = Header(None)):
    """Generate and save a personalised roadmap for the authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = session_data["user_id"]
    if user_id != req.user_id:
        raise HTTPException(status_code=403, detail="User mismatch")

    # Gather context
    profile = get_user_profile(user_id) or {}
    university = get_university(req.university_id)
    program = get_program(req.university_id, req.program_id)

    context = {
        "user_profile": profile,
        "university": university or {},
        "program": program or {},
        "start_date": req.start_date,
        "deadline": req.deadline,
        "preferences": req.preferences or {}
    }

    roadmap_result = generate_roadmap(context)
    items = roadmap_result.get("roadmap", [])

    # Persist roadmap
    save_roadmap(user_id, items)

    return {"success": True, "roadmap": items}


@router.get("/roadmap", response_model=RoadmapResponse)
def get_user_roadmap(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = session_data["user_id"]
    items = get_roadmap(user_id)
    return {"success": True, "roadmap": items}


# Argumentation endpoint (structured explanation why program recommended)
@router.get("/argumentation/{program_compound_id}")
def get_argumentation(program_compound_id: str, authorization: str = Header(None)):
    """Return structured argumentation for a given program.

    program_compound_id should be in form "{university_id}-{program_id}".
    This is a lightweight, rule-based explanation generator for the hackathon.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    is_valid, session_data = verify_token(token)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = session_data["user_id"]
    profile = get_user_profile(user_id) or {}

    # Expect compound id like "nu-cs"
    if "-" not in program_compound_id:
        raise HTTPException(status_code=400, detail="program_compound_id must be 'university-program'")

    uni_id, prog_id = program_compound_id.split("-", 1)
    university = get_university(uni_id)
    program = get_program(uni_id, prog_id)

    if not university or not program:
        raise HTTPException(status_code=404, detail="University or program not found")

    # Rule-based analysis
    ent = profile.get("entScore", 0)
    ielts = profile.get("ieltsScore", 0)
    budget = profile.get("budget", 0)

    strong_points = []
    risks = []

    # ENT check
    if ent >= program.get("minENT", 0):
        strong_points.append({"title": "Соответствие по ЕНТ", "detail": f"ЕНТ {ent} ≥ минимум {program.get('minENT')}"})
    else:
        risks.append({"title": "ЕНТ ниже требования", "detail": f"ЕНТ {ent} < {program.get('minENT')} — рекомендуется подготовка"})

    # IELTS / language
    if program.get("minIELTS", 0) > 0:
        if ielts >= program.get("minIELTS", 0):
            strong_points.append({"title": "Языковые требования", "detail": f"IELTS {ielts} ≥ {program.get('minIELTS')}"})
        elif ielts > 0:
            risks.append({"title": "Разрыв по IELTS", "detail": f"IELTS {ielts} < {program.get('minIELTS')} — план подготовки"})
        else:
            risks.append({"title": "IELTS не указан", "detail": "Нужно подтвердить уровень языка"})

    # Interests match (simple intersection)
    interests = set(profile.get("interests", []))
    prog_tags = set(program.get("tags", []) or [])
    if interests and prog_tags:
        intersect = interests.intersection(prog_tags)
        if intersect:
            strong_points.append({"title": "Совпадение интересов", "detail": f"Интересы: {', '.join(list(intersect))}"})
        else:
            risks.append({"title": "Низкое совпадение интересов", "detail": "Ваши интересы не совпадают с ключевыми направлениями программы"})

    # Budget check
    tuition = program.get("tuition", 0)
    if budget >= tuition:
        strong_points.append({"title": "Финансы", "detail": "Бюджет покрывает стоимость обучения"})
    else:
        shortfall = tuition - (budget or 0)
        risks.append({"title": "Финансирование", "detail": f"Недостаток средств: {shortfall:,.0f} KZT. Рассмотрите стипендии/кредиты"})

    # Compute simple scores
    score_match = 50
    if strong_points:
        score_match += min(40, len(strong_points) * 12)
    if risks:
        score_match -= min(30, len(risks) * 10)
    score_match = max(0, min(100, int(score_match)))

    interest_match = 0
    if interests and prog_tags:
        interest_match = int((len(interests.intersection(prog_tags)) / max(1, len(prog_tags))) * 100)

    response = {
        "program_id": f"{uni_id}-{prog_id}",
        "program_name": program.get("name"),
        "university_name": university.get("name"),
        "score_match": score_match,
        "interest_match": interest_match,
        "strong_points": strong_points,
        "risks": risks,
        "raw_profile": {"entScore": ent, "ieltsScore": ielts, "budget": budget},
    }

    return response


# Applications endpoints
@router.post("/user/applications", response_model=ApplicationsResponse)
def save_user_applications(data: ApplicationsRequest, authorization: str = Header(None)):
    """Save or update user applications list"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    save_applications(user_id, [app.dict() for app in data.applications])
    return {
        "success": True,
        "applications": data.applications,
        "message": "Applications saved successfully",
    }


@router.get("/user/applications", response_model=ApplicationsResponse)
def get_user_applications(authorization: str = Header(None)):
    """Get user applications list"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    applications = get_applications(user_id)
    return {
        "success": True,
        "applications": applications,
        "message": "Applications retrieved successfully",
    }
