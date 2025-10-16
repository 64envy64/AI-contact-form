# Быстрый старт Supabase

Краткая инструкция. Подробности в `SETUP.md`.

## 1. Создать проект

1. Зайти на [supabase.com](https://supabase.com) и создать проект
2. Подождать инициализацию (~2 минуты)

## 2. Выполнить миграцию

1. Открыть **SQL Editor** в дашборде Supabase
2. Нажать "New query"
3. Скопировать содержимое `migrations/000_complete_schema.sql`
4. Нажать "Run" (или Ctrl+Enter)
5. Должно появиться "Success. No rows returned"

## 3. Настроить RLS

**Вариант A - Простой (для разработки):**
1. **Database** → **Tables**
2. Для таблиц `users` и `submissions` снять галочку "Enable Row Level Security"

**Вариант B - Безопасный (для продакшена):**
1. **Authentication** → **Policies**
2. Для каждой таблицы создать политики:
   - Enable read access for all users
   - Enable insert access for all users
   - Enable update access for all users

## 4. Получить ключи API

1. **Settings** → **API**
2. Скопировать:
   - **Project URL**
   - **anon public** key (НЕ service_role)

## 5. Обновить .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Проверить

```bash
npm run dev
```

В консоли браузера не должно быть ошибок подключения к Supabase.

## Частые ошибки

| Ошибка | Решение |
|--------|---------|
| "Invalid API key" | Использовать `anon public`, а не `service_role` |
| "relation does not exist" | Выполнить миграцию заново |
| "violates foreign key constraint" | Сначала создать пользователя в `users` |

## Тест базы данных

1. **Table Editor** → таблица `users`
2. "Insert row" → добавить тестового пользователя:
   - name: "Test User"
   - ai_usage_count: 0
3. Таблица `submissions` → добавить тестовую отправку с user_name = "Test User"

Если обе операции прошли успешно - база настроена правильно.
