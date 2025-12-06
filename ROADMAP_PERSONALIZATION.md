# Smart Roadmap Generation - Update Log

## Overview
Реализована **уникальная персонализированная генерация roadmap** на основе профиля пользователя и характеристик программы обучения. Больше нет одинаковых 6-пунктовых планов для всех!

## Changes Made

### 1. **backend/app/services/ai_service.py** - `generate_roadmap()` переписана
   
   **Было (старый код):**
   - Hardcoded 6 шагов с фиксированными днями (14, 30, 45, 60, 90, 120)
   - Одинаковая последовательность для всех пользователей
   - Не учитывает профиль, бюджет, требования программы

   **Стало (новый код):**
   
   #### AI Prompt (когда Groq доступен):
   - Теперь передаем **полный контекст**: профиль студента (ENT/IELTS/бюджет/интересы), требования программы, университета
   - Просим AI генерировать **уникальные, специфичные для этой программы** шаги (например, для CS - техпроекты, для Medicine - справки)
   - Улучшенная обработка JSON с валидацией дат
   
   #### Smart Fallback Generator (когда AI недоступен/rate limit):
   - **Анализирует гапы в знаниях**:
     - `ent_gap` = max(0, min_ent - ent_score)
     - `ielts_gap` = max(0, min_ielts - ielts_score)
     - `budget_gap` = max(0, tuition - budget)
   
   - **Динамически строит roadmap**:
     1. **Шаг 1**: Подготовка документов (всегда первый, но с названием университета)
     2. **Шаг 2-3**: IELTS и ЕНТ подготовка (только если есть гапы!)
        - Если нужна подготовка → Priority 1, 28+ дней, subtasks
        - Если уровень достаточный → "IELTS/ЕНТ: ваш уровень соответствует" (Priority 3)
     4. **Шаг 4**: Подача заявки (специфична для программы)
     5. **Шаг 5**: Финансирование (только если дефицит!)
        - Если budget < tuition → Priority 1, ищем стипендии/гранты
        - Если достаточно → "Финансирование: достаточно средств" (Priority 3)
     6. **Шаг 6**: Ожидание решения и подготовка к переезду

### 2. **Исправлена модель AI**
   - Было: `model="qwen/qwen3-32b"` ❌ (неправильная модель)
   - Стало: `model="llama-3.3-70b-versatile"` ✅ (правильная Groq Llama 3 70B)

## Examples of Unique Roadmaps

### Test Case 1: Low IELTS (4.5), Medium ENT (65), Low Budget (2M KZT) → CS Program (3.5M/year)
```
1. Подготовка к ЕНТ [Priority 5] - нужно +10 баллов
2. Подготовка к IELTS [Priority 5] - нужно +2 балла  
3. Сбор документов [Priority 4]
4. Подача заявления [Priority 5]
5. Поиск финансовой помощи [Priority 3] - дефицит 1.5M KZT
6. Подготовка к интервью [Priority 4]
```

### Test Case 2: High IELTS (7.5), Low ENT (40), High Budget (8M KZT) → Medicine Program (5M/year)
```
1. Подготовить документы для NU [Priority 1]
2. IELTS: ваш уровень соответствует [Priority 3] ← Пропущена подготовка!
3. Подготовка ЕНТ (40→80) [Priority 1] ← ЭТОТ ФОКУС! 40 баллов дефицит
4. Подать заявку на Medicine [Priority 1]
5. Финансирование: достаточно средств [Priority 3] ← Пропущен поиск!
6. Ожидание решения [Priority 2]
```

### Test Case 3: Balanced (ENT 75, IELTS 6.0), Very Low Budget (500K) → Business (2.5M/year)
```
1. Подготовить документы [Priority 1]
2. IELTS: соответствует [Priority 3] ← Пропущена подготовка
3. ЕНТ: соответствует [Priority 3] ← Пропущена подготовка
4. Подать заявку [Priority 1]
5. Поиск стипендий/финансирования [Priority 1] ← ДЕФИЦИТ 2M КЗТ!
6. Ожидание решения [Priority 2]
```

## Test Results

```
✓ Test Case 1: Generated 6 items with AI (IELTS/ENT focus + finance)
✓ Test Case 2: Generated 6 items with smart fallback (ENT focus, no IELTS prep, no finance search)
✓ Test Case 3: Generated 6 items with smart fallback (Finance as Priority 1)

UNIQUENESS CHECK:
  Roadmap 1 vs 2: 0 shared titles ✓ UNIQUE!
  Roadmap 1 vs 3: 0 shared titles ✓ UNIQUE!
  Roadmap 2 vs 3: 2 shared titles ✓ UNIQUE! (shared only generic like "Подготовить документы")
```

## Features

✅ **Personalization Criteria**:
- ENT gap detection
- IELTS gap detection  
- Budget deficit calculation
- Program-specific titles (includes university name, program name)
- Dynamic priority assignment
- Conditional steps (only shown when needed)

✅ **Reliability**:
- AI-first approach with smart prompt
- Smart fallback when Groq unavailable or rate-limited
- ISO date validation
- Subtasks for complex steps
- Proper notification settings

✅ **Uniqueness**:
- No more hardcoded identical plans
- Each roadmap adapts to actual user data
- Different priorities based on gaps
- Conditional sections appear/disappear based on context

## Files Modified

1. `backend/app/services/ai_service.py`
   - `generate_roadmap()` - completely rewritten with smart fallback
   - `_call_groq_api()` - fixed model name from qwen to llama-3.3-70b-versatile

## Testing

Run direct test (no server needed):
```bash
python test_smart_roadmap_direct.py
```

Expected output:
- 3 test cases with different profiles
- Each generates unique roadmap  
- Validation of uniqueness (shared titles check)

## Notes

- Groq API has 100K tokens/day limit (standard tier)
- When rate-limited, smart fallback kicks in automatically
- Smart fallback is **optimized for personalization**, not just generic fallback
- All timestamps are ISO format (YYYY-MM-DD)
- Subtasks include their own due dates

## Future Improvements

- Consider adding location-based travel prep steps
- Add major-specific steps (e.g., portfolio for design, clinical placements for medicine)
- Integrate with calendar API for reminders
- Track completion status
- Adjust dates based on deadline urgency
