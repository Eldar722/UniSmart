import os
from dotenv import load_dotenv

load_dotenv()

# Groq API Key (используем Llama 3 70B вместо Gemini)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    GROQ_API_KEY = None

# Legacy (оставляем для совместимости)
GENAI_API_KEY = os.getenv("GENAI_API_KEY")
if not GENAI_API_KEY:
    GENAI_API_KEY = None
