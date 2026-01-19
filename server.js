/**
 * Man.ru Backend Server
 * Node.js + Express + Supabase PostgreSQL
 * 
 * Запуск: npm install && npm start
 * Разработка: npm run dev
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CORS CONFIGURATION
// ========================================

// Для разработки и тестирования - разрешаем все CORS запросы
const corsOptions = {
    origin: '*', // Разрешаем все источники
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Заголовки для отключения кэша
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`   Body:`, JSON.stringify(req.body).substring(0, 100));
    }
    next();
});

// ========================================
// STATIC FILES - SERVE FRONTEND
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ВАЖНО: /api маршруты должны быть обработаны ПОСЛЕ этой проверки
// Но ПЕРЕД тем как мы вызовем express.static
app.use((req, res, next) => {
    // Логируем что видим
    console.log(`   🔍 Static middleware check: ${req.method} ${req.path}, ext: ${path.extname(req.path)}`);
    
    const ext = path.extname(req.path);
    
    // Если есть расширение файла (CSS, JS, PNG, и т.д.) - ищем статический файл
    if (ext) {
        console.log(`   ✅ Has extension, serving static file`);
        express.static(path.join(__dirname))(req, res, next);
    } else {
        // Иначе пропускаем - будет обработано SPA routing или API
        console.log(`   ⏭️  No extension, skipping to next middleware`);
        next();
    }
});

// Для главной страницы
app.get('/', (req, res) => {
    console.log('   → Serving index.html for /');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljhmjfqxvgshkazpoody.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_u4LJ6le0y-XutIbsLMHoNg_5It98lgf';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

console.log('📋 Environment Variables Check:');
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ SET' : '❌ NOT SET'}`);
if (SUPABASE_URL) {
    console.log(`      Value: ${SUPABASE_URL.substring(0, 50)}...`);
}
console.log(`   SUPABASE_KEY: ${SUPABASE_KEY ? '✅ SET' : '❌ NOT SET'}`);
if (SUPABASE_KEY) {
    console.log(`      Length: ${SUPABASE_KEY.length} characters`);
    console.log(`      Value: ${SUPABASE_KEY.substring(0, 30)}...`);
}
console.log(`   JWT_SECRET: ${JWT_SECRET ? '✅ SET' : '❌ NOT SET'}`);

// Проверяем что переменные установлены
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌❌❌ CRITICAL: SUPABASE Environment Variables NOT SET!');
    console.error('   SUPABASE_URL is:', SUPABASE_URL || 'undefined');
    console.error('   SUPABASE_KEY is:', SUPABASE_KEY || 'undefined');
    console.error('   You MUST set these on Render Dashboard!');
    console.error('   Go to: Render Dashboard → Settings → Environment');
    console.error('   Add:');
    console.error('   SUPABASE_URL=https://ljhmjfqxvgshkazpoody.supabase.co');
    console.error('   SUPABASE_KEY=your_key_from_supabase');
    throw new Error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_KEY');
}

let supabase;
try {
    console.log('⏳ Creating Supabase client...');
    console.log(`   Using URL: ${SUPABASE_URL}`);
    console.log(`   Using KEY (length): ${SUPABASE_KEY.length}`);
    
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅✅✅ Supabase client created successfully!');
    console.log(`   Database is now connected!`);
} catch (error) {
    console.error('❌ ERROR creating Supabase client!');
    console.error('   Error:', error.message);
    console.error('   This is a CRITICAL error - registration will not work!');
    throw error;
}

// ========================================
// MIDDLEWARE - АУТЕНТИФИКАЦИЯ
// ========================================

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ========================================
// ROUTES - ПОЛЬЗОВАТЕЛИ
// ========================================

console.log('📍 ABOUT TO REGISTER ROUTES...');

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    console.log('🔐 Registration request received');
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    try {
        const { name, email, password } = req.body;
        console.log(`   User: ${name} <${email}>`);

        if (!name || !email || !password) {
            console.log('   ❌ Missing fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Проверка на существующий email
        console.log('   ⏳ Checking if email exists...');
        const { data: existing, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        
        console.log(`   ✅ Email check completed. Error:`, checkError?.message || 'none');

        if (existing) {
            console.log('   ❌ Email already exists');
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Хеширование пароля
        console.log('   ⏳ Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('   ✅ Password hashed');

        // Создание пользователя
        console.log('   ⏳ Inserting user to database...');
        const { data: user, error: insertError } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                password: hashedPassword,
                avatar: '👤',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            console.log('   ❌ Database insert error:', insertError);
            throw insertError;
        }

        console.log('   ✅ User created:', user?.id);

        // Генерация JWT токена
        console.log('   ⏳ Generating JWT token...');
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('   ✅ Token generated');
        console.log('   ⏳ Sending response...');

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            token
        });
        
        console.log('   ✅ Response sent successfully!');
    } catch (error) {
        console.error('❌❌❌ CRITICAL ERROR in registration:');
        console.error('   Error type:', error.constructor.name);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        console.error('   ⏳ Sending error response...');
        res.status(500).json({ 
            error: error.message,
            details: error.toString(),
            type: error.constructor.name
        });
        console.error('   ✅ Error response sent');
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        // Поиск пользователя
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Генерация JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            token
        });
    } catch (error) {
        console.error('❌ Ошибка входа:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Получить профиль пользователя
app.get('/api/users/:id', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, avatar, bio, created_at')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('❌ Ошибка получения профиля:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Обновить профиль (требует аутентификации)
app.put('/api/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { name, bio, avatar } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .update({ name, bio, avatar })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('❌ Ошибка обновления профиля:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========== DELETE USER PROFILE ==========

app.delete('/api/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        console.log(`🗑️ Deleting user profile: ${req.params.id}`);

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Профиль успешно удалён'
        });
    } catch (error) {
        console.error('❌ Ошибка удаления профиля:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// ROUTES - ФОРУМ
// ========================================

// Получить все обсуждения форума
app.get('/api/forum/posts', async (req, res) => {
    try {
        const { category } = req.query;

        let query = supabase
            .from('forum_posts')
            .select('*, users(name, avatar)')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data: posts, error } = await query;

        if (error) throw error;

        res.json(posts);
    } catch (error) {
        console.error('❌ Ошибка получения постов форума:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Создать новое обсуждение
app.post('/api/forum/posts', verifyToken, async (req, res) => {
    try {
        const { title, category, message } = req.body;

        if (!title || !category || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: post, error } = await supabase
            .from('forum_posts')
            .insert([{
                title,
                category,
                message,
                author: req.user.name,
                author_email: req.user.email,
                author_id: req.user.id,
                date: new Date().toLocaleString('ru-RU'),
                comments: 0,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            post
        });
    } catch (error) {
        console.error('❌ Ошибка создания поста форума:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Получить обсуждение по ID
app.get('/api/forum/posts/:id', async (req, res) => {
    try {
        const { data: post, error } = await supabase
            .from('forum_posts')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!post) return res.status(404).json({ error: 'Post not found' });

        res.json(post);
    } catch (error) {
        console.error('❌ Ошибка получения поста:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// ROUTES - СТАТЬИ
// ========================================

// Получить все статьи
app.get('/api/articles', async (req, res) => {
    try {
        const { category } = req.query;

        let query = supabase
            .from('articles')
            .select('*, users(name, avatar)')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data: articles, error } = await query;

        if (error) throw error;

        res.json(articles);
    } catch (error) {
        console.error('❌ Ошибка получения статей:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Создать новую статью
app.post('/api/articles', verifyToken, async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: article, error } = await supabase
            .from('articles')
            .insert([{
                title,
                description,
                content: description,
                category,
                author: req.user.name,
                author_email: req.user.email,
                author_id: req.user.id,
                date: new Date().toLocaleString('ru-RU'),
                views: 0,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            article
        });
    } catch (error) {
        console.error('❌ Ошибка создания статьи:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Получить статью по ID
app.get('/api/articles/:id', async (req, res) => {
    try {
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!article) return res.status(404).json({ error: 'Article not found' });

        res.json(article);
    } catch (error) {
        console.error('❌ Ошибка получения статьи:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// ROUTES - ОТВЕТЫ НА ФОРУМЕ
// ========================================

// Получить ответы на пост
app.get('/api/forum/posts/:id/replies', async (req, res) => {
    try {
        const { data: replies, error } = await supabase
            .from('forum_replies')
            .select('*')
            .eq('post_id', req.params.id)
            .order('created_at');

        if (error) throw error;

        res.json(replies);
    } catch (error) {
        console.error('❌ Ошибка получения ответов:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Создать ответ на пост
app.post('/api/forum/posts/:id/replies', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const { data: reply, error } = await supabase
            .from('forum_replies')
            .insert([{
                post_id: parseInt(req.params.id),
                author: req.user.name,
                author_email: req.user.email,
                author_id: req.user.id,
                message,
                date: new Date().toLocaleString('ru-RU'),
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            reply
        });
    } catch (error) {
        console.error('❌ Ошибка создания ответа:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', async (req, res) => {
    console.log('🏥 Health check request');
    try {
        // Проверяем Supabase
        console.log('   ⏳ Testing Supabase connection...');
        const { data, error } = await supabase.from('users').select('id').limit(1);
        
        if (error) {
            console.log('   ❌ Supabase error:', error.message);
            return res.status(503).json({
                status: 'error',
                message: 'Supabase connection failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        console.log('   ✅ Supabase OK');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            supabase: 'connected',
            version: '1.0.0'
        });
    } catch (error) {
        console.error('   ❌ Health check failed:', error.message);
        res.status(503).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ========================================
// 404 HANDLER - SERVE INDEX.HTML FOR SPA
// ========================================

console.log('📍 All routes registered, setting up 404 handler');

app.use((req, res) => {
    // Если запрос не на API и не на статический файл, отправляем index.html
    console.log(`🚫 404 Handler: ${req.method} ${req.path}`);
    
    if (!req.path.startsWith('/api')) {
        console.log(`   → SPA routing, sending index.html`);
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        console.log(`   → API route not found, returning 404`);
        res.status(404).json({
            error: 'Route not found',
            path: req.path
        });
    }
});

// ========================================
// ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║  🚀 Man.ru Backend Server Started    ║
║  📡 Server running on port ${PORT}        ║
║  🌍 API: http://localhost:${PORT}/api   ║
║  ❤️  Health check: http://localhost:${PORT}/health ║
╚═══════════════════════════════════════╝
    `);
});
