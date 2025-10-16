-- Сабмишн тейбл создать
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

-- Комментарии на англ
COMMENT ON TABLE submissions IS 'Stores contact form submissions';
COMMENT ON COLUMN submissions.user_name IS 'References users.name - the user who submitted the form';
COMMENT ON COLUMN submissions.subject IS 'Form subject: General Inquiry, Bug Report, Feature Request, or Billing Question';
COMMENT ON COLUMN submissions.message IS 'User message (50-1000 characters)';
