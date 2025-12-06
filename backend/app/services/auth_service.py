import uuid
import hashlib
from datetime import datetime
from typing import Optional, Tuple

# In-memory storage for users
users_db = {}
sessions = {}

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a unique session token"""
    return str(uuid.uuid4())

def register_user(name: str, email: str, password: str) -> Tuple[bool, str, Optional[dict]]:
    """
    Register a new user
    Returns: (success, message, user_data)
    """
    # Check if user already exists
    if email in users_db:
        return False, "User with this email already exists", None
    
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)
    
    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now().isoformat(),
    }
    
    users_db[email] = user
    
    # Create session token
    token = generate_token()
    sessions[token] = {
        "user_id": user_id,
        "email": email,
        "created_at": datetime.now().isoformat(),
    }
    
    return True, "User registered successfully", {
        "id": user_id,
        "name": name,
        "email": email,
        "token": token,
    }

def login_user(email: str, password: str) -> Tuple[bool, str, Optional[dict]]:
    """
    Login user with email and password
    Returns: (success, message, user_data_with_token)
    """
    # Check if user exists
    if email not in users_db:
        return False, "User not found", None
    
    user = users_db[email]
    hashed_password = hash_password(password)
    
    # Verify password
    if user["password"] != hashed_password:
        return False, "Invalid password", None
    
    # Create session token
    token = generate_token()
    sessions[token] = {
        "user_id": user["id"],
        "email": email,
        "created_at": datetime.now().isoformat(),
    }
    
    return True, "Login successful", {
        "id": user["id"],
        "name": user["name"],
        "email": email,
        "token": token,
    }

def verify_token(token: str) -> Tuple[bool, Optional[dict]]:
    """
    Verify if a token is valid and return session data
    Returns: (is_valid, session_data)
    """
    if token not in sessions:
        return False, None
    
    return True, sessions[token]

def logout_user(token: str) -> Tuple[bool, str]:
    """
    Logout user by removing token
    Returns: (success, message)
    """
    if token in sessions:
        del sessions[token]
        return True, "Logged out successfully"
    
    return False, "Invalid token"

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "created_at": user["created_at"],
            }
    return None


def save_user_favorites(user_id: str, favorites: list) -> bool:
    """Save user favorites list"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            user["favorites"] = favorites
            return True
    return False


def get_user_favorites(user_id: str) -> list:
    """Get user favorites list"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            return user.get("favorites", [])
    return []


def save_user_comparison(user_id: str, comparison_list: list) -> bool:
    """Save user comparison list"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            user["comparison_list"] = comparison_list
            return True
    return False


def get_user_comparison(user_id: str) -> list:
    """Get user comparison list"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            return user.get("comparison_list", [])
    return []


def save_user_profile(user_id: str, profile_data: dict) -> bool:
    """Save user profile settings"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            if "profile" not in user:
                user["profile"] = {}
            user["profile"].update(profile_data)
            return True
    return False


def get_user_profile(user_id: str) -> dict:
    """Get user profile settings"""
    for email, user in users_db.items():
        if user["id"] == user_id:
            return user.get("profile", {})
    return {}
