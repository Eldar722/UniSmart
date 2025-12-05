from storage.memory import get_user_memory, save_to_memory
from services.ai_service import generate_ai_response

def ai_navigator_logic(user_id: str, user_message: str):
    memory = get_user_memory(user_id)

    system_prompt = f"""
Ты интеллектуальный навигатор.

Контекст пользователя:
{memory}

Новый запрос:
{user_message}

1. Используй контекст
2. Дай понятный и полезный ответ
3. Если найдёшь важный факт — сохрани его
"""

    ai_answer = generate_ai_response(system_prompt)

    # сохраняем в память
    save_to_memory(user_id, f"User: {user_message}")
    save_to_memory(user_id, f"AI: {ai_answer}")

    return ai_answer, memory
