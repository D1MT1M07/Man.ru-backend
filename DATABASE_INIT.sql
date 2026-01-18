/**
 * Инициализация PostgreSQL базы данных для Man.ru
 * Запуск в Supabase SQL Editor
 */

-- ========================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
-- ========================================

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  bio TEXT,
  birth_date DATE,
  registration_date TIMESTAMP DEFAULT NOW(),
  followers JSONB DEFAULT '[]',
  following JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);

-- ========================================
-- ТАБЛИЦА СТАТЕЙ
-- ========================================

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT NOT NULL,
  author TEXT,
  author_email TEXT,
  author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMP,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- ========================================
-- ТАБЛИЦА ФОРУМ ПОСТОВ
-- ========================================

CREATE TABLE IF NOT EXISTS forum_posts (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  title TEXT NOT NULL,
  message TEXT,
  category TEXT NOT NULL,
  author TEXT,
  author_email TEXT,
  author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMP,
  comments INT DEFAULT 0,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);

-- ========================================
-- ТАБЛИЦА ОТВЕТОВ НА ФОРУМЕ
-- ========================================

CREATE TABLE IF NOT EXISTS forum_replies (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  post_id BIGINT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author TEXT,
  author_email TEXT,
  author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message TEXT,
  date TIMESTAMP,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);

-- ========================================
-- ТАБЛИЦА КОММЕНТАРИЕВ К СТАТЬЯМ
-- ========================================

CREATE TABLE IF NOT EXISTS article_comments (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author TEXT,
  author_email TEXT,
  author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message TEXT,
  date TIMESTAMP,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_article_comments_author_id ON article_comments(author_id);

-- ========================================
-- ТАБЛИЦА УВЕДОМЛЕНИЙ
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ========================================
-- ТАБЛИЦА ЛОГОВ АКТИВНОСТИ
-- ========================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id BIGINT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ========================================
-- ТАБЛИЦА ПОДПИСОК
-- ========================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT PRIMARY KEY DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_subscriptions_follower ON subscriptions(follower_id);
CREATE INDEX idx_subscriptions_following ON subscriptions(following_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Политики для пользователей
CREATE POLICY "Enable read access for all users" 
  ON users FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on id"
  ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Политики для статей
CREATE POLICY "Enable read access for all articles" 
  ON articles FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON articles FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for article author"
  ON articles FOR UPDATE USING (auth.uid()::text = author_id::text);

-- Политики для форума
CREATE POLICY "Enable read access for all forum posts" 
  ON forum_posts FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON forum_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for post author"
  ON forum_posts FOR UPDATE USING (auth.uid()::text = author_id::text);

-- Политики для ответов
CREATE POLICY "Enable read access for all forum replies" 
  ON forum_replies FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON forum_replies FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for reply author"
  ON forum_replies FOR UPDATE USING (auth.uid()::text = author_id::text);

-- ========================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ========================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON article_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ПРИМЕРЫ ДАННЫХ (для тестирования)
-- ========================================

-- Добавляем тестового пользователя
INSERT INTO users (id, email, name, password, avatar, bio, registration_date) VALUES
  (1, 'test@example.com', 'Тестовый пользователь', 'hashed_password_here', '👨', 'Тестовый профиль', NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- ПРОВЕРКА
-- ========================================

-- Проверяем созданные таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
