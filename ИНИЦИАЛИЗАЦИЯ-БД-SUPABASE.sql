-- ========================================
-- ИНИЦИАЛИЗАЦИЯ БД SUPABASE
-- ========================================

-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ТАБЛИЦА СТАТЕЙ
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    category VARCHAR(100),
    author VARCHAR(255),
    author_email VARCHAR(255),
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(255),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ТАБЛИЦА ПОСТОВ ФОРУМА
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100),
    author VARCHAR(255),
    author_email VARCHAR(255),
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(255),
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ТАБЛИЦА ОТВЕТОВ НА ФОРУМЕ
CREATE TABLE IF NOT EXISTS forum_replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
    author VARCHAR(255),
    author_email VARCHAR(255),
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    date VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Отключить RLS для быстрого тестирования
-- Если хотите безопасность - включите с политиками

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies DISABLE ROW LEVEL SECURITY;

-- ========================================
-- СОЗДАТЬ ИНДЕКСЫ ДЛЯ БЫСТРОГО ПОИСКА
-- ========================================

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);

CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_created_at ON forum_replies(created_at DESC);

-- ========================================
-- ИНСТРУКЦИИ ДЛЯ SUPABASE
-- ========================================

/*
1. Откройте Supabase Dashboard
2. Перейдите на SQL Editor
3. Создайте новый query
4. Скопируйте ВСЕ содержимое этого файла
5. Нажмите "Run" (или Ctrl+Enter)
6. Все таблицы будут созданы автоматически!

Если хотите добавить RLS политики - используйте это:

-- ПОЛИТИКА: Позволить всем читать статьи и посты форума
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON articles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for article authors" ON articles FOR UPDATE USING (auth.uid()::text = author_email) WITH CHECK (auth.uid()::text = author_email);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for post authors" ON forum_posts FOR UPDATE USING (auth.uid()::text = author_email) WITH CHECK (auth.uid()::text = author_email);
*/
