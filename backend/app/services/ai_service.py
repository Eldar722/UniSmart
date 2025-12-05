from google import genai
from config import GENAI_API_KEY

client = genai.Client(api_key=GENAI_API_KEY)

def generate_ai_response(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text
