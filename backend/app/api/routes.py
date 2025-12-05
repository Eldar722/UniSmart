from fastapi import APIRouter, Header, HTTPException
from models.schemas import (
    AIRequest,
    AIResponse,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
)
from services.logic_service import ai_navigator_logic
from services.auth_service import (
    register_user,
    login_user,
    verify_token,
    logout_user,
    get_user_by_id,
)

router = APIRouter()

# Auth endpoints
@router.post("/auth/register", response_model=AuthResponse)
def register(data: RegisterRequest):
    """Register a new user"""
    success, message, user = register_user(data.name, data.email, data.password)
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

# AI endpoint
@router.post("/ai", response_model=AIResponse)
def ai_handler(data: AIRequest):
    """Handle AI requests"""
    answer, memory = ai_navigator_logic(
        user_id=data.user_id,
        user_message=data.message
    )
    return {
        "answer": answer,
        "memory_used": memory,
    }
