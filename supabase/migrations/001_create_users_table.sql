-- ДБ
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  ai_usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Комментарии на англ
COMMENT ON TABLE users IS 'Stores user information with AI usage tracking';
COMMENT ON COLUMN users.name IS 'Unique user name stored in localStorage';
COMMENT ON COLUMN users.ai_usage_count IS 'Number of times user has used AI improvement feature';
