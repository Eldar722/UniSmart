import os
from dotenv import load_dotenv

load_dotenv()

GENAI_API_KEY = os.getenv("GENAI_API_KEY")

if not GENAI_API_KEY:
    raise ValueError("GENAI_API_KEY не найден")
