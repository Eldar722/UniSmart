from pydantic import BaseModel
from typing import List, Optional, Dict, Any

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
    password: Optional[str] = None  # optional for backward compatibility
    ent: Optional[int] = None
    ielts: Optional[float] = None
    budget: Optional[int] = None
    city: Optional[str] = None
    outcomes: Optional[List[str]] = None

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


class UserProfile(BaseModel):
    entScore: int
    ieltsScore: float
    profileSubjects: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    budget: Optional[int] = 0
    preferredCity: Optional[str] = "Любой"


class RecommendationRequest(BaseModel):
    profile: UserProfile
    top_k: Optional[int] = 5


class ExplanationStructure(BaseModel):
    """AI-generated explanation structure for recommendations.
    
    This model represents the analytical explanation provided by the AI service.
    All fields are derived from computed match scores and factors - no hallucinations.
    """
    summary: str  # 2-3 sentence analytical summary
    key_factors: Optional[List[Dict[str, Any]]] = []  # Top factors with contributions
    explanation: Optional[str] = None  # Detailed justification
    strengths: Optional[List[str]] = []  # List of strong matches/advantages
    considerations: Optional[List[str]] = []  # Important notes or potential gaps


class RecommendationItem(BaseModel):
    university_id: str
    program_id: str
    university_name: str
    program_name: str
    score: float
    factors: Optional[dict] = {}
    explanation: Optional[ExplanationStructure] = None


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]


class WhatIfRequest(BaseModel):
    profile: UserProfile
    changes: dict
    top_k: Optional[int] = 5


class WhatIfResponse(BaseModel):
    base: List[RecommendationItem]
    scenario: List[RecommendationItem]
    deltas: List[dict]


class UserFavoritesRequest(BaseModel):
    favorites: List[str]  # list of university IDs


class UserFavoritesResponse(BaseModel):
    success: bool
    favorites: List[str]


class UserComparisonRequest(BaseModel):
    comparison_list: List[str]  # list of "uni_id-program_id"


class UserComparisonResponse(BaseModel):
    success: bool
    comparison_list: List[str]


class UserProfileRequest(BaseModel):
    entScore: Optional[int] = None
    ieltsScore: Optional[float] = None
    profileSubjects: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    budget: Optional[int] = None
    preferredCity: Optional[str] = None


class UserProfileResponse(BaseModel):
    success: bool
    profile: Optional[Dict[str, Any]] = None
    message: str = ""


class RoadmapItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None  # ISO date string
    priority: Optional[int] = 3  # 1-high ... 5-low
    notify_before_days: Optional[int] = 7
    subtasks: Optional[List[Dict[str, Any]]] = []


class RoadmapRequest(BaseModel):
    user_id: str
    university_id: str
    program_id: str
    start_date: Optional[str] = None  # ISO date
    deadline: Optional[str] = None  # ISO date by which admission should happen
    preferences: Optional[Dict[str, Any]] = {}


class RoadmapResponse(BaseModel):
    success: bool
    roadmap: List[RoadmapItem]
    message: Optional[str] = ""


class ApplicationItem(BaseModel):
    id: Optional[str] = None
    university: str
    program: str
    appliedOn: str  # ISO date
    status: str  # "Draft", "Submitted", "Interview", "Accepted", "Rejected"


class ApplicationsRequest(BaseModel):
    applications: List[ApplicationItem]


class ApplicationsResponse(BaseModel):
    success: bool
    applications: List[ApplicationItem]
    message: Optional[str] = ""
