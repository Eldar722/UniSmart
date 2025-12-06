"""AI Service для UniSmart - Groq Llama 3 70B.

Этот модуль отвечает за взаимодействие с Groq API (Llama 3 70B).
AI используется ТОЛЬКО для объяснения уже вычисленных рекомендаций,
а не для их генерации.

Архитектура:
- Business Logic Service → вычисляет сами рекомендации (детерминировано)
- AI Service → объясняет почему эти рекомендации хороши (на основе фактов)
"""

import json
import sys
import re
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

from ..config import GROQ_API_KEY

# Попытаемся импортировать Groq API
try:
    from groq import Groq
    _GROQ_AVAILABLE = True
except ImportError:
    _GROQ_AVAILABLE = False
    print("[AI] WARNING: groq не установлен", file=sys.stderr)


def _call_groq_api(system_prompt: str, user_message: str) -> Optional[str]:
    """Обращение к Groq API (Llama 3 70B).
    
    Args:
        system_prompt: Системный промпт (инструкции для AI)
        user_message: Сообщение пользователя (факты для анализа)
    
    Returns:
        Текст ответа от Groq или None если ошибка
    """
    if not _GROQ_AVAILABLE:
        print("[AI] Groq не доступен", file=sys.stderr)
        return None
    
    if not GROQ_API_KEY:
        print("[AI] GROQ_API_KEY не установлен", file=sys.stderr)
        return None
    
    try:
        # Инициализируем клиент Groq
        client = Groq(api_key=GROQ_API_KEY)
        
        print("[AI] Отправляю запрос к Groq Llama 3...", file=sys.stderr)
        
        # Вызываем Llama 3 70B
        response = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        
        # Извлекаем текст
        if response.choices and response.choices[0].message.content:
            text = response.choices[0].message.content.strip()
            print("[AI] ✓ Ответ получен от Llama 3", file=sys.stderr)
            return text
        else:
            print("[AI] Пустой ответ от Groq", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"[AI] Ошибка при вызове Groq: {type(e).__name__}: {e}", file=sys.stderr)
        return None


def explain_recommendation(context: Dict[str, Any]) -> Dict[str, Any]:
    """Объяснить рекомендацию университетской программы.
    
    Args:
        context: Словарь с ключом "facts"
    
    Returns:
        Словарь с объяснением в структурированном формате
    """
    
    facts = context.get("facts", {})
    
    if not facts:
        print("[AI] Пустые facts, используем fallback", file=sys.stderr)
        return _fallback_explanation(facts)
    
    # Простой промпт для Llama 3
    system_prompt = """Ты помощник по выбору университетов. Анализируй факты и отвечай ТОЛЬКО JSON.
JSON структура:
{
    "summary": "2-3 предложения почему это хорошо",
    "key_factors": [
        {"factor": "название", "value": "описание", "contribution": 40},
        {"factor": "название2", "value": "описание2", "contribution": 20}
    ],
    "explanation": "1-2 предложения",
    "strengths": ["сильная сторона 1", "сильная сторона 2"],
    "considerations": ["замечание 1"]
}
ТОЛЬКО JSON БЕЗ КОДА!"""
    
    user_message = f"""Верни JSON для этой программы:
{json.dumps(facts, ensure_ascii=False, indent=2)}

ВЕРНИ ТОЛЬКО JSON!"""
    
    # Пытаемся вызвать Groq
    ai_response = _call_groq_api(system_prompt, user_message)
    
    if ai_response:
        try:
            # Очищаем JSON от markdown блоков и лишнего текста
            cleaned = ai_response
            
            # Ищем JSON объект
            match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if match:
                cleaned = match.group(0)
            
            cleaned = cleaned.strip()
            
            # Парсим JSON ответ
            result = json.loads(cleaned)
            
            # Валидируем структуру - ВАЖНО: key_factors должны быть списком объектов
            if isinstance(result, dict):
                # Валидируем key_factors
                key_factors = result.get("key_factors", [])
                if not isinstance(key_factors, list):
                    key_factors = []
                
                # Проверяем каждый factor
                validated_factors = []
                for factor in key_factors:
                    if isinstance(factor, dict):
                        validated_factors.append({
                            "factor": factor.get("factor", ""),
                            "value": factor.get("value", ""),
                            "contribution": float(factor.get("contribution", 0))
                        })
                
                return {
                    "summary": result.get("summary", ""),
                    "key_factors": validated_factors,
                    "explanation": result.get("explanation", ""),
                    "strengths": result.get("strengths", []) if isinstance(result.get("strengths"), list) else [],
                    "considerations": result.get("considerations", []) if isinstance(result.get("considerations"), list) else []
                }
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            print(f"[AI] Не удалось распарсить JSON: {str(e)[:100]}", file=sys.stderr)
    
    # Fallback если AI не ответил или был error
    print("[AI] Используем fallback объяснение", file=sys.stderr)
    return _fallback_explanation(facts)


def _fallback_explanation(facts: Dict[str, Any]) -> Dict[str, Any]:
    """Генерирует объяснение без AI (детерминировано).
    
    Используется когда:
    - API ключ не установлен
    - Groq недоступен
    - Произошла ошибка при вызове AI
    """
    
    if not facts:
        return {
            "summary": "Программа доступна в вашем профиле.",
            "key_factors": [],
            "explanation": "Рекомендация основана на соответствии критериям.",
            "strengths": [],
            "considerations": []
        }
    
    # Извлекаем базовые данные
    uni_name = facts.get("university_name", "Университет")
    prog_name = facts.get("program_name", "Программа")
    score = float(facts.get("score", 0))
    factors = facts.get("factors", {})
    
    # Определяем качество соответствия
    if score >= 80:
        quality = "отличное соответствие"
    elif score >= 60:
        quality = "хорошее соответствие"
    elif score >= 40:
        quality = "среднее соответствие"
    else:
        quality = "базовое соответствие"
    
    # Основное резюме
    summary = f"{uni_name} — программа '{prog_name}' показывает {quality} (оценка: {score:.0f}/100)."
    
    # Извлекаем ключевые факторы
    key_factors = []
    strengths = []
    considerations = []
    
    factor_names_ru = {
        "ent": "Баллы ЕНТ",
        "ielts": "IELTS",
        "budget": "Бюджет",
        "city": "Город",
        "outcomes": "Карьерные перспективы"
    }
    
    if isinstance(factors, dict):
        for fname, fdata in factors.items():
            if not isinstance(fdata, dict):
                continue
            
            factor_ru = factor_names_ru.get(fname, fname)
            contribution = float(fdata.get("contribution", 0))
            
            # Формируем описание фактора
            value_desc = ""
            
            if fname == "ent":
                user_ent = float(fdata.get("user", 0))
                required = float(fdata.get("required", 0))
                if user_ent >= required:
                    value_desc = f"Ваш результат ({user_ent:.0f}) соответствует требованию ({required:.0f})"
                    strengths.append(f"Результат ЕНТ соответствует требованиям")
                else:
                    value_desc = f"Ваш результат ({user_ent:.0f}) ниже требования ({required:.0f})"
                    gap = required - user_ent
                    considerations.append(f"Нужно улучшить ЕНТ на {gap:.0f} баллов")
            
            elif fname == "ielts":
                user_ielts = float(fdata.get("user", 0))
                required = float(fdata.get("required", 0))
                if required == 0:
                    value_desc = "IELTS не требуется"
                elif user_ielts >= required:
                    value_desc = f"Ваш IELTS ({user_ielts:.1f}) соответствует требованию ({required:.1f})"
                    strengths.append(f"IELTS соответствует требованиям")
                else:
                    value_desc = f"Ваш IELTS ({user_ielts:.1f}) ниже требования ({required:.1f})"
                    gap = required - user_ielts
                    considerations.append(f"Нужно улучшить IELTS на {gap:.1f} балла")
            
            elif fname == "budget":
                budget = float(fdata.get("budget", 0))
                tuition = float(fdata.get("tuition", 0))
                if tuition == 0:
                    value_desc = "Бесплатное обучение (грант)"
                    strengths.append("Бесплатное обучение")
                elif budget >= tuition:
                    value_desc = f"Бюджет ({budget:,.0f}) ≥ стоимость ({tuition:,.0f})"
                else:
                    shortfall = tuition - budget
                    value_desc = f"Нужно {shortfall:,.0f} тенге дополнительно"
                    considerations.append(f"Недостаток средств: {shortfall:,.0f} тенге/год")
            
            elif fname == "city":
                preferred = fdata.get("preferred", "Любой")
                uni_city = fdata.get("university_city", "")
                if preferred == "Любой" or preferred == uni_city:
                    value_desc = f"Город совпадает ({uni_city})"
                    if preferred == uni_city:
                        strengths.append(f"Университет в предпочитаемом городе ({uni_city})")
                else:
                    value_desc = f"Город отличается: {uni_city} vs {preferred}"
            
            elif fname == "outcomes":
                employment = float(fdata.get("employment", 0))
                salary = float(fdata.get("avgSalary", 0))
                value_desc = f"Трудоустройство: {employment}%, зарплата: {salary:,.0f} тенге"
                if employment >= 85:
                    strengths.append(f"Высокое трудоустройство ({employment}%)")
            
            else:
                value_desc = str(fdata)
            
            if value_desc:
                key_factors.append({
                    "factor": factor_ru,
                    "value": value_desc,
                    "contribution": round(contribution, 1)
                })
    
    # Общее объяснение
    if score >= 70:
        explanation = "Программа хорошо соответствует вашему профилю. Рекомендуем рассмотреть."
    elif score >= 50:
        explanation = "Программа подходит, но есть ограничения. Может быть вариантом."
    else:
        explanation = "Базовое соответствие. Рассмотрите улучшение показателей."
    
    return {
        "summary": summary,
        "key_factors": key_factors[:5],  # Топ 5 факторов
        "explanation": explanation,
        "strengths": strengths[:3] if strengths else ["Соответствие основным требованиям"],
        "considerations": considerations[:3] if considerations else []
    }


def generate_roadmap(context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a personalised roadmap (timeline) to apply to a program.

    Expected context keys: user_profile, university, program, start_date (ISO), deadline (ISO)
    Returns a dict with key 'roadmap' -> list of roadmap items.
    """

    profile = context.get("user_profile", {})
    uni = context.get("university", {})
    program = context.get("program", {})
    start_date_iso = context.get("start_date")
    deadline_iso = context.get("deadline")

    # Parse dates
    try:
        start_date = datetime.fromisoformat(start_date_iso) if start_date_iso else datetime.utcnow()
    except Exception:
        start_date = datetime.utcnow()

    try:
        deadline = datetime.fromisoformat(deadline_iso) if deadline_iso else None
    except Exception:
        deadline = None

    system_prompt = (
        "Ты опытный советник по поступлению в университеты. Создай уникальный, детализированный план (roadmap) поступления для студента.\n"
        "ВАЖНО: Верни ТОЛЬКО валидный JSON без markdown, без ```json блоков.\n"
        "Учитывай профиль студента, требования программы и даты.\n"
        "Структура: {\"roadmap\": [{\"title\": \"...\", \"description\": \"...\", \"due_date\": \"YYYY-MM-DD\", \"priority\": 1-5, \"notify_before_days\": 7, \"subtasks\": [{\"title\": \"...\", \"due_date\": \"YYYY-MM-DD\"}]}]}\n"
        "Создай 6-8 уникальных пунктов в зависимости от программы и профиля.\n"
        "Задачи должны быть специфичны для этой программы, не обобщены.\n"
        "Включи сроки для тестов, подачи, интервью, финансовых вопросов, если они релевантны.\n"
        "Возвращай ТОЛЬКО JSON, начиная с {."
    )

    user_message = (
        f"Студент с профилем:\n"
        f"- ЕНТ: {profile.get('entScore', '?')}\n"
        f"- IELTS: {profile.get('ieltsScore', '?')}\n"
        f"- Бюджет: {profile.get('budget', '?')} KZT\n"
        f"- Город: {profile.get('preferredCity', 'Любой')}\n"
        f"- Интересы: {', '.join(profile.get('interests', []))}\n\n"
        f"Хочет поступить на:\n"
        f"- Университет: {uni.get('name', '?')}\n"
        f"- Программа: {program.get('name', '?')}\n"
        f"- Степень: {program.get('degree', '?')}\n"
        f"- Язык обучения: {program.get('language', '?')}\n"
        f"- Стоимость: {program.get('tuition', '?')} KZT в год\n"
        f"- Требования: ЕНТ {program.get('minENT', '?')}, IELTS {program.get('minIELTS', '?')}\n"
        f"- Трудоустройство: {program.get('employmentRate', '?')}%\n\n"
        f"Дата начала: {start_date.strftime('%Y-%m-%d')}\n"
        f"Дедлайн (если есть): {deadline.strftime('%Y-%m-%d') if deadline else 'Не указан'}\n\n"
        f"Создай уникальный roadmap на основе ВСЕЙ этой информации. Учитывай:\n"
        f"- Пробелы в требованиях (например, нужна ли подготовка IELTS)\n"
        f"- Специфику программы (напр. для IT нужны техпроекты, для медицины - справки)\n"
        f"- Финансовые аспекты\n"
        f"- Сроки подачи\n\n"
        f"Верни ТОЛЬКО JSON без каких-либо комментариев!"
    )

    ai_response = _call_groq_api(system_prompt, user_message)

    if ai_response:
        try:
            cleaned = ai_response.strip()
            
            # Remove markdown code blocks if present
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            cleaned = cleaned.strip()
            
            # Find JSON object
            match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if match:
                cleaned = match.group(0)
            
            result = json.loads(cleaned)
            if isinstance(result, dict) and isinstance(result.get("roadmap"), list):
                # Validate and normalize
                items = []
                for it in result.get("roadmap", []):
                    try:
                        due = it.get("due_date")
                        if due:
                            # Validate ISO format
                            _ = datetime.fromisoformat(due)
                    except Exception:
                        # If date invalid, auto-calculate
                        offset = len(items) * 20  # Spread them out
                        due = (start_date + timedelta(days=offset)).date().isoformat()
                        it["due_date"] = due
                    
                    it.setdefault("id", str(uuid.uuid4()))
                    it.setdefault("priority", 3)
                    it.setdefault("notify_before_days", 7)
                    it.setdefault("subtasks", [])
                    items.append(it)
                
                if items:  # Return AI roadmap if we got items
                    return {"roadmap": items}
        except Exception as e:
            print(f"[AI] Не удалось распарсить roadmap JSON: {e}", file=sys.stderr)

    # Fallback: Generate smart roadmap based on profile and program
    print("[AI] Используем smart fallback roadmap генератор", file=sys.stderr)
    roadmap = []

    # Determine what needs to be done based on profile
    ent_score = profile.get("entScore", 0)
    ielts_score = profile.get("ieltsScore", 0)
    budget = profile.get("budget", 0)
    min_ent = program.get("minENT", 0)
    min_ielts = program.get("minIELTS", 0)
    tuition = program.get("tuition", 0)
    degree = program.get("degree", "Бакалавриат")
    prog_name = program.get("name", "программе")
    uni_name = uni.get("name", "университете")
    language = program.get("language", "Английский")

    # Calculate gaps
    ent_gap = max(0, min_ent - ent_score)
    ielts_gap = max(0, min_ielts - ielts_score)
    budget_gap = max(0, tuition - budget)

    offset = 7  # Start offset in days

    # Step 1: Prepare documents (always first)
    roadmap.append({
        "id": str(uuid.uuid4()),
        "title": f"Подготовить документы для {uni_name}",
        "description": f"Соберите оригиналы/копии: аттестат/диплом, выписку оценок, паспорт, фото. "
                      f"Переводы на {'английский' if language == 'Английский' else 'русский'} язык обучения.",
        "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
        "priority": 1,
        "notify_before_days": 7,
        "subtasks": []
    })
    offset += 14

    # Step 2: Language prep (if needed)
    if ielts_gap > 0 or ielts_score == 0:
        title = f"Подготовка IELTS (текущий: {ielts_score}, нужно: {min_ielts})"
        desc = (f"Требуется улучшение на {ielts_gap:.1f} балла. "
                f"Запишитесь на курсы подготовки, сдайте пробный тест, "
                f"зарегистрируйтесь на экзамен IELTS.")
        roadmap.append({
            "id": str(uuid.uuid4()),
            "title": title,
            "description": desc,
            "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
            "priority": 1 if ielts_gap > 1 else 2,
            "notify_before_days": 14,
            "subtasks": [
                {"title": "Выбрать центр подготовки IELTS", "due_date": (start_date + timedelta(days=offset)).date().isoformat()},
                {"title": "Сдать пробный тест", "due_date": (start_date + timedelta(days=offset+7)).date().isoformat()},
                {"title": "Зарегистрироваться на экзамен", "due_date": (start_date + timedelta(days=offset+10)).date().isoformat()},
            ]
        })
        offset += 28
    else:
        roadmap.append({
            "id": str(uuid.uuid4()),
            "title": "IELTS: ваш уровень соответствует",
            "description": f"IELTS {ielts_score} >= {min_ielts} (требуется). Можно переходить к подаче документов.",
            "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
            "priority": 3,
            "notify_before_days": 0,
            "subtasks": []
        })
        offset += 7

    # Step 3: ENT prep (if needed)
    if ent_gap > 0:
        roadmap.append({
            "id": str(uuid.uuid4()),
            "title": f"Подготовка ЕНТ (текущий: {ent_score}, нужно: {min_ent})",
            "description": f"Нужно улучшить на {ent_gap:.0f} баллов. "
                          f"Пройдите курсы подготовки, решайте тесты, найдите репетитора по слабым предметам.",
            "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
            "priority": 1,
            "notify_before_days": 14,
            "subtasks": [
                {"title": "Оценить текущий уровень (пробный тест)", "due_date": (start_date + timedelta(days=offset)).date().isoformat()},
                {"title": "Записаться на курсы подготовки", "due_date": (start_date + timedelta(days=offset+3)).date().isoformat()},
                {"title": "Еженедельно решать практические тесты", "due_date": (start_date + timedelta(days=offset+30)).date().isoformat()},
            ]
        })
        offset += 35
    else:
        roadmap.append({
            "id": str(uuid.uuid4()),
            "title": "ЕНТ: ваш уровень соответствует",
            "description": f"ЕНТ {ent_score} >= {min_ent} (требуется). Можете подавать документы.",
            "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
            "priority": 3,
            "notify_before_days": 0,
            "subtasks": []
        })
        offset += 7

    # Step 4: Submit application
    roadmap.append({
        "id": str(uuid.uuid4()),
        "title": f"Подать заявку на {prog_name}",
        "description": f"Заполните онлайн-форму приёмной комиссии {uni_name}, загрузите все документы, "
                      f"убедитесь что форма полностью заполнена. Сохраните номер заявки.",
        "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
        "priority": 1,
        "notify_before_days": 3,
        "subtasks": [
            {"title": "Найти ссылку на подачу документов", "due_date": (start_date + timedelta(days=offset)).date().isoformat()},
            {"title": "Заполнить форму заявки", "due_date": (start_date + timedelta(days=offset+1)).date().isoformat()},
            {"title": "Загрузить все документы", "due_date": (start_date + timedelta(days=offset+2)).date().isoformat()},
        ]
    })
    offset += 14

    # Step 5: Scholarships (if applicable)
    if budget_gap > 0 or budget < tuition:
        roadmap.append({
            "id": str(uuid.uuid4()),
            "title": f"Поиск стипендий и финансирования (дефицит: {budget_gap:,.0f} KZT)",
            "description": f"Ваш бюджет {budget:,.0f} KZT, стоимость программы {tuition:,.0f} KZT в год. "
                          f"Ищите стипендии, гранты, кредиты, или варианты рассрочки платежей.",
            "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
            "priority": 1,
            "notify_before_days": 7,
            "subtasks": [
                {"title": "Изучить стипендии на сайте университета", "due_date": (start_date + timedelta(days=offset)).date().isoformat()},
                {"title": "Подать заявки на гранты", "due_date": (start_date + timedelta(days=offset+5)).date().isoformat()},
                {"title": "Проверить варианты финансирования", "due_date": (start_date + timedelta(days=offset+10)).date().isoformat()},
            ]
        })
        offset += 21
    else:
        roadmap.append({
            "id": str(uuid.uuid4()),
            "title": "Финансирование: достаточно средств",
            "description": f"Ваш бюджет {budget:,.0f} KZT покрывает стоимость обучения {tuition:,.0f} KZT.",
            "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
            "priority": 3,
            "notify_before_days": 0,
            "subtasks": []
        })
        offset += 7

    # Step 6: Wait for decision and prepare
    roadmap.append({
        "id": str(uuid.uuid4()),
        "title": "Ожидание решения и подготовка к переезду",
        "description": f"Дождитесь ответа комиссии {uni_name}. Зарезервируйте жилье, "
                      f"подготовьте визу (если нужна), спланируйте переезд, соберите чемоданы.",
        "due_date": (start_date + timedelta(days=offset)).date().isoformat(),
        "priority": 2,
        "notify_before_days": 14,
        "subtasks": []
    })

    return {"roadmap": roadmap}
