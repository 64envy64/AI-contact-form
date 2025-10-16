-- AI Contact Form
-- Запускать файл в SQL Editor Supabase

-- 1. Создать ДБ
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  ai_usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создать индексы 
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Комментарии (на англ для удобства)
COMMENT ON TABLE users IS 'Stores user information with AI usage tracking';
COMMENT ON COLUMN users.name IS 'Unique user name stored in localStorage';
COMMENT ON COLUMN users.ai_usage_count IS 'Number of times user has used AI improvement feature';

-- 2. Создать сабмишн тейблы
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_name FOREIGN KEY (user_name) REFERENCES users(name) ON DELETE CASCADE
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_submissions_user_name ON submissions(user_name);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Комменты на англ
COMMENT ON TABLE submissions IS 'Stores contact form submissions';
COMMENT ON COLUMN submissions.user_name IS 'References users.name - the user who submitted the form';
COMMENT ON COLUMN submissions.subject IS 'Form subject: General Inquiry, Bug Report, Feature Request, or Billing Question';
COMMENT ON COLUMN submissions.message IS 'User message (50-1000 characters)';