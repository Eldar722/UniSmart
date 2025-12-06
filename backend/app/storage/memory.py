"""Simple in-memory storage for MVP.

This module provides in-memory data storage for the UniSmart platform.

STORAGE STRUCTURES:
- memory_store: Conversation memory per user (for AI navigator)
- users_db: User accounts and profiles (indexed by email)
- universities: Static dataset of universities and programs

DATA STRUCTURE:
Each university has:
- id: Unique identifier
- name: Full university name
- city: Location
- minENT: Minimum ENT score (university-wide default)
- minIELTS: Minimum IELTS score (university-wide default)
- programs: List of program dicts

Each program has:
- id: Unique identifier
- name: Program name
- degree: Degree level (Bachelor, Master, etc.)
- minENT: Minimum ENT score (program-specific, overrides university)
- minIELTS: Minimum IELTS score (program-specific)
- tuition: Annual tuition in KZT (0 = free/government grant)
- duration: Program duration in years
- employmentRate: Percentage of graduates employed (0-100)
- avgSalary: Average starting salary in KZT

WHY IN-MEMORY:
- MVP: Fast iteration, no database setup required
- Simplicity: Easy to understand and modify
- Performance: Instant access for small datasets
- Migration: Can replace with DB without changing business logic

For production, replace functions with database queries while maintaining
the same interface.
"""

memory_store = {}
users_db = {}
# Roadmap storage per user (in-memory)
roadmap_store = {}
# Applications storage per user (in-memory)
applications_store = {}

# Dataset of universities and programs in Kazakhstan
# This data is used by logic_service to compute match scores
# Each university represents a real institution with realistic requirements
universities = [
    {
        "id": "nu",
        "name": "Nazarbayev University",
        "city": "Astana",
        "minENT": 120,
        "minIELTS": 6.5,
        "programs": [
            {"id": "cs", "name": "Computer Science", "degree": "Bachelor", "minENT": 125, "minIELTS": 6.5, "tuition": 0, "duration": 4, "employmentRate": 98, "avgSalary": 800000},
            {"id": "medicine", "name": "Medicine", "degree": "Bachelor", "minENT": 130, "minIELTS": 7.0, "tuition": 0, "duration": 5, "employmentRate": 100, "avgSalary": 600000},
        ],
    },
    {
        "id": "kaznu",
        "name": "Al-Farabi Kazakh National University",
        "city": "Almaty",
        "minENT": 75,
        "minIELTS": 5.5,
        "programs": [
            {"id": "it", "name": "Information Systems", "degree": "Bachelor", "minENT": 80, "minIELTS": 5.5, "tuition": 900000, "duration": 4, "employmentRate": 85, "avgSalary": 450000},
            {"id": "economics", "name": "Economics", "degree": "Bachelor", "minENT": 75, "minIELTS": 5.0, "tuition": 850000, "duration": 4, "employmentRate": 82, "avgSalary": 400000},
        ],
    },
    {
        "id": "kbtu",
        "name": "Kazakh-British Technical University",
        "city": "Almaty",
        "minENT": 85,
        "minIELTS": 6.0,
        "programs": [
            {"id": "kbtu-cs", "name": "Computer Engineering", "degree": "Bachelor", "minENT": 90, "minIELTS": 6.0, "tuition": 1200000, "duration": 4, "employmentRate": 88, "avgSalary": 500000},
            {"id": "kbtu-ece", "name": "Electronics and Communications", "degree": "Bachelor", "minENT": 88, "minIELTS": 5.5, "tuition": 1150000, "duration": 4, "employmentRate": 84, "avgSalary": 420000},
        ],
    },
    {
        "id": "kimep",
        "name": "KIMEP University",
        "city": "Almaty",
        "minENT": 70,
        "minIELTS": 6.0,
        "programs": [
            {"id": "kimep-business", "name": "Business Administration", "degree": "Bachelor", "minENT": 72, "minIELTS": 6.0, "tuition": 1000000, "duration": 4, "employmentRate": 90, "avgSalary": 480000},
            {"id": "kimep-econ", "name": "Economics", "degree": "Bachelor", "minENT": 70, "minIELTS": 5.5, "tuition": 950000, "duration": 4, "employmentRate": 86, "avgSalary": 430000},
        ],
    },
    {
        "id": "sdu",
        "name": "Suleyman Demirel University",
        "city": "Kaskelen",
        "minENT": 60,
        "minIELTS": 5.0,
        "programs": [
            {"id": "sdu-law", "name": "Law", "degree": "Bachelor", "minENT": 62, "minIELTS": 5.0, "tuition": 700000, "duration": 4, "employmentRate": 78, "avgSalary": 300000},
            {"id": "sdu-it", "name": "Software Engineering", "degree": "Bachelor", "minENT": 65, "minIELTS": 5.5, "tuition": 750000, "duration": 4, "employmentRate": 80, "avgSalary": 350000},
        ],
    },
    {
        "id": "aitu",
        "name": "Astana IT University",
        "city": "Astana",
        "minENT": 70,
        "minIELTS": 5.5,
        "programs": [
            {"id": "aitu-cs", "name": "Data Science", "degree": "Bachelor", "minENT": 75, "minIELTS": 5.5, "tuition": 800000, "duration": 4, "employmentRate": 87, "avgSalary": 460000},
            {"id": "aitu-cyber", "name": "Cybersecurity", "degree": "Bachelor", "minENT": 74, "minIELTS": 5.5, "tuition": 820000, "duration": 4, "employmentRate": 85, "avgSalary": 440000},
        ],
    },
]


def get_user_memory(user_id: str):
    return memory_store.get(user_id, [])


def save_to_memory(user_id: str, data: str):
    if user_id not in memory_store:
        memory_store[user_id] = []
    memory_store[user_id].append(data)


def list_universities():
    return universities


def get_university(uni_id: str):
    return next((u for u in universities if u["id"] == uni_id), None)


def get_program(uni_id: str, program_id: str):
    uni = get_university(uni_id)
    if not uni:
        return None
    return next((p for p in uni.get("programs", []) if p["id"] == program_id), None)


def add_user(user: dict):
    users_db[user["id"]] = user


def get_user(user_id: str):
    return users_db.get(user_id)


def save_roadmap(user_id: str, roadmap: list):
    """Save generated roadmap for a user (in-memory)."""
    roadmap_store[user_id] = roadmap


def get_roadmap(user_id: str):
    return roadmap_store.get(user_id, [])


def save_applications(user_id: str, applications: list):
    """Save applications list for a user (in-memory)."""
    applications_store[user_id] = applications


def get_applications(user_id: str):
    return applications_store.get(user_id, [])
