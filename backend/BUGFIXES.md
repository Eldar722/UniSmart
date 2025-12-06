# Исправления ошибок в рекомендациях и интеграции

## ПОСЛЕДНИЕ ИСПРАВЛЕНИЯ (декабрь 2025) - Третья волна

### Issue: Pydantic validation error - key_factors должны быть объекты, не строки

**Проблема:**
- ❌ Gemini возвращал key_factors как список строк вместо объектов
- ❌ Pydantic не мог распарсить структуру
- ❌ Частые SAFETY блокировки от Gemini

**Решение: Переход на Groq Llama 3 70B**
1. ✅ Заменил Gemini на Groq (более надежный, бесплатный API)
2. ✅ Используем модель `llama-3-70b-8192` (лучше понимает JSON)
3. ✅ Добавлена валидация структуры JSON перед возвратом
4. ✅ Fallback объяснение с правильной структурой

**Файлы изменены:**
- `backend/app/config.py` - добавлен GROQ_API_KEY
- `backend/app/services/ai_service.py` - полностью переделан на Groq
- `backend/requirements.txt` - заменена groq на google-generativeai
- `backend/.env` - добавлены Groq ключи

**Преимущества Groq:**
- ✅ Бесплатный API (generous free tier)
- ✅ Llama 3 70B - отличное понимание структур
- ✅ Нет SAFETY блокировок на безопасном контенте
- ✅ Быстрее чем Gemini
- ✅ Лучше парсит JSON

---

## Исправления второй волны

### Issue: Gemini API выдавал ошибки `finish_reason=2` и не парсился JSON

**Решения:**
1. ✅ Использовал `gemini-1.5-flash` вместо `gemini-2.5-flash`
2. ✅ Добавлены safety_settings: BLOCK_NONE для всех категорий
3. ✅ Улучшена логика извлечения текста из candidates напрямую
4. ✅ Добавлена очистка JSON от markdown блоков
5. ✅ Обновлены требования: `google-generativeai==0.7.2`

---

## Исправления первой волны

### Issue: AI рекомендации не работали в фронтенде
**Решения:**
1. ✅ Обновлен `Recommendations.tsx` - API Base: `http://localhost:8000/api`
2. ✅ Добавлена отправка токена в заголовке `Authorization: Bearer {token}`
3. ✅ Добавлен тип `token` в `UserContext`

## Проверка работы:

1. **Получить Groq API ключ:**
   - Перейти на https://console.groq.com
   - Создать API ключ
   - Добавить в `.env`: `GROQ_API_KEY=gsk_...`

2. **Установить новую версию**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Запустить бэкенд**:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

4. **Протестировать рекомендации**:
   ```bash
   python test_api.py
   ```

5. **Ожидаемое поведение**:
   - ✅ С Groq API ключом: Llama 3 генерирует объяснения в правильной структуре
   - ✅ Без API ключа: Используется deterministic fallback
   - ✅ key_factors всегда список объектов {factor, value, contribution}
   - ✅ Фронтенд правильно отображает рекомендации

