from pydantic import BaseModel
from typing import List, Optional

class AIRequest(BaseModel):
    user_id: str
    message: str

class AIResponse(BaseModel):
    answer: str
    memory_used: Optional[List[str]] = []

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None

class User(BaseModel):
    id: str
    name: str
    email: str
    created_at: Optional[str] = None
