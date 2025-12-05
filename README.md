# UniSmart — помощник при выборе университета

Кратко

UniSmart — прототип веб-приложения, которое помогает студентам находить подходящие университеты и программы в Казахстане на основе профиля (баллы ЕНТ, IELTS, бюджет и предпочтения). Проект содержит фронтенд (React + Vite + TypeScript) и бэкенд (FastAPI, Python). В приложении реализованы рекомендации, сравнение программ и избранное, а также базовая авторизация/сессии для прототипа.

Идея проекта

- Собрать профиль абитуриента (ЕНТ, IELTS, интересы, бюджет).
- Сопоставить профиль с базой университетов и программ, вычислить «match score».
- Предоставить рекомендации, возможность добавить университеты/программы в избранное и сравнение, а также детальную страницу ВУЗа.
- Прототип включает локальную (in-memory) авторизацию с токенами для демо; в дальнейшем — заменить на БД и JWT.

Ключевые возможности

- Регистрация и вход (simple in-memory auth, токен в `localStorage`).
- Автоматическое восстановление сессии через `GET /api/auth/me`.
- Рекомендации вузов (AI-like scoring по mock-данным).
- Избранное (локальное) и сравнение программ (локальное, поддерживает до 3 программ).
- UI на React + Tailwind, готовая структура компонентов для расширения.

Технологический стек

- Фронтенд:
  - React (TypeScript)
  - Vite
  - Tailwind CSS
  - Lucide icons и набор UI-компонентов (внутренние)
- Бэкенд:
  - Python 3.11+
  - FastAPI
  - Uvicorn (ASGI сервер)
- Прочее:
  - Хранение сессий/пользователей в памяти (для прототипа)
  - `localStorage` на фронтенде для токена (`auth_token`), `favorites`, `comparison_list`

Файловая структура (важное)

- `backend/app` — FastAPI приложение
  - `api/routes.py` — маршруты, включая `/api/auth/*` и `/api/ai`
  - `services/auth_service.py` — in-memory сервис авторизации
  - `models/schemas.py` — Pydantic модели
- `frontend/src` — React приложение (Vite)
  - `context/UserContext.tsx` — логика авторизации, хранение токена, избранное/сравнение
  - `pages/Auth.tsx` — форма регистрации/входа
  - `pages/Compare.tsx` — страница сравнения программ
  - `components/recommendations/UniversityCard.tsx` — карточки вузов (+ избранное)

Запуск локально (Windows PowerShell)

1) Backend (FastAPI)

Откройте терминал и выполните:

```powershell
cd C:\Users\root\Desktop\o\Coding\Hackathon\backend
# (опционально) создать и активировать виртуальное окружение
python -m venv .venv; .\.venv\Scripts\Activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

После этого API будет доступно по адресу `http://localhost:8000/api`.

Доступные важные эндпоинты (демо):
- `POST /api/auth/register` — регистрирует и возвращает `token`
- `POST /api/auth/login` — логин, возвращает `token`
- `POST /api/auth/logout` — логаут (требует заголовок `Authorization: Bearer <token>`)
- `GET  /api/auth/me` — получить данные текущего пользователя
- `POST /api/ai` — демонстрационный AI-эндпоинт (используется внутренне)

2) Frontend (Vite)

В новом терминале выполните:

```powershell
cd C:\Users\root\Desktop\o\Coding\Hackathon\frontend
# Установите зависимости (npm/pnpm/bun — используйте ваш менеджер)
npm install
npm run dev
```

По умолчанию фронтенд ожидает API на `http://localhost:8000/api`. При необходимости можно настроить базовый URL через `VITE_API_BASE` в `.env` (файл должен называться `.env` в корне фронтенда или передаваться окружением при запуске). Пример: `VITE_API_BASE=http://localhost:8000/api`.

Коротко про авторизацию на фронтенде

- После успешного входа/регистрации бек возвращает `token`; фронтенд сохраняет его в `localStorage` под ключом `auth_token`.
- При загрузке приложение пытается восстановить сессию (`GET /api/auth/me`) и, если токен валиден, устанавливает `isAuthenticated` и данные `user` в `UserContext`.
- `favorites` и `comparison_list` сохраняются локально в `localStorage` для быстрого прототипа (ключи `favorites` и `comparison_list`).

Как проверять/тестировать

- Зарегистрируйтесь через UI (`/auth`) — после успешной регистрации токен появится в `localStorage`.
- На странице университета добавьте программы в сравнение (в `comparison_list` будут элементы формата `<uniId>-<programId>`).
- Перейдите на `/compare` — таблица сравнения должна показывать выбранные программы.

Примечания и улучшения (рекомендации для продакшна)

- Заменить in-memory хранение пользователей и сессий на БД (Postgres/SQLite) и хранение сессий в Redis или использовать JWT с подписью.
- Сделать бэкенд миграционный (alembic) и модели ORM (SQLAlchemy/peewee).
- Синхронизация `favorites` и `comparison_list` на сервере — сейчас всё локально.
- Валидация и обработка ошибок в UI — показывать сообщения с точными причинами (например, "Email уже зарегистрирован").

Контакты

email: ekainazarov1@gmail.com
email: adelyamasanova@gmail.com
email: lmaololakek20.a@gmail.com