# AI Контактная Форма

Веб-приложение на Next.js с AI-улучшением сообщений через Google Gemini API и хранением данных в Supabase.

## Что реализовано

- Контактная форма с валидацией в реальном времени
- AI-улучшение сообщений через Google Gemini
- Упрощенная система пользовательских сессий (localStorage)
- История отправок
- Счетчик использования AI
- E2E тестирование (Playwright)

## Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **База данных**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (free tier)
- **Тестирование**: Playwright
- **Валидация**: Zod

## Установка

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить Supabase

1. Создать проект на supabase.com
2. Получить Project URL и anon key (Settings → API)
3. Выполнить SQL миграцию в SQL Editor (если не делали):
   - Скопировать содержимое `supabase/migrations/000_complete_schema.sql`
   - Вставить и выполнить в SQL Editor

Подробная инструкция: `supabase/SETUP.md`

### 3. Настроить переменные окружения

Скопировать `.env.example` в `.env.local`:

```bash
copy .env.example .env.local
```

Заполнить значения в `.env.local`:

```env
GEMINI_API_KEY=ваш_ключ_gemini
NEXT_PUBLIC_SUPABASE_URL=ваш_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ_supabase
```

### 4. Запустить локально

```bash
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

### 5. Запустить тесты

```bash
npm test              # Запуск тестов
npm run test:ui       # Запуск с UI
```

## Структура базы данных

### Таблица `users`
- `id` - UUID (primary key)
- `name` - TEXT (unique) - имя пользователя из localStorage
- `ai_usage_count` - INTEGER - счетчик использования AI
- `created_at` - TIMESTAMP

### Таблица `submissions`
- `id` - UUID (primary key)
- `user_name` - TEXT (foreign key → users.name)
- `email` - TEXT
- `subject` - TEXT
- `message` - TEXT
- `created_at` - TIMESTAMP

## API маршруты

- `POST /api/submit` - Отправка формы
- `GET /api/submissions?name=[user_name]` - Получение отправок пользователя
- `POST /api/ai/improve` - Улучшение сообщения через AI
- `GET /api/ai/usage?name=[user_name]` - Получение счетчика использования AI

## Принятые решения

### Пользовательские сессии
- **localStorage** - простое решение для демо без сложной аутентификации
- Хранится только имя пользователя
- Автоматическая загрузка при возврате на страницу

### База данных
- **Supabase (PostgreSQL)** - простая настройка, free tier, удобно
- Две таблицы с foreign key и CASCADE delete
- Индексы для оптимизации запросов

### AI интеграция
- **Google Gemini API** - бесплатный tier
- Кастомный prompt для улучшения сообщений с сохранением точки зрения пользователя
- Обработка timeout (30s) и rate limiting
- Отслеживание использования

### Валидация
- **Zod** - типобезопасная валидация на клиенте и сервере
- Валидация в реальном времени
- Счетчик символов (50-1000)
- Блокировка отправки при ошибках

### UI/UX
- **Tailwind CSS** - быстрая разработка дизайна
- Адаптивный дизайн
- Состояния загрузки для всех асинхронных операций
- Модальные окна для ввода имени и preview AI

## Что можно улучшить

Реальная аутентификация - Supabase Auth вместо localStorage
Дизайн - подгонка дизайна под требования заказчика(?)
Rate limiting- ограничение запросов к AI API
Email уведомления - подтверждение отправки
Прикрепление файлов - загрузка файлов к сообщениям
Админ панель - управление всеми отправками
Расширенный AI - выбор тона, перевод, только грамматика
Аналитика - статистика использования
Языки - поддержка языков
Кэширование - Redis для частых запросов

## Деплой

🚀 **URL**: [Добавить после деплоя]

### Деплой на Vercel

1. Загрузить код на GitHub
2. Импортировать проект в [Vercel](https://vercel.com/new)
3. Добавить переменные окружения:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Задеплоить

## Использование ИИ

- Использовал Cursor AI, Kiro для улучшения документации, написания шаблонных функций с последующим ревью.

## Документация

- `QUESTIONNAIRE.md` - Ответы на вопросы о разработке
- `supabase/SETUP.md` - Инструкция по настройке Supabase
- `tests/README.md` - Документация по тестам
