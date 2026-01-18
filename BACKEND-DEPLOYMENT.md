# 🚀 ПОЛНОЕ РУКОВОДСТВО ПО РАЗВЁРТЫВАНИЮ MAN.RU В ИНТЕРНЕТ

## 📋 ЭТАП 1: ПОДГОТОВКА SUPABASE БАЗЫ ДАННЫХ

### Шаг 1.1 - Создать проект Supabase

1. Перейди на https://supabase.com
2. Нажми "Start your project"
3. Выбери "Create a new project"
4. Заполни поля:
   - **Project name**: `man-ru-db`
   - **Password**: Сохрани (очень важно!)
   - **Region**: Europe / Moscow (если доступно)
5. Нажми "Create new project"
6. Жди 2-3 минуты инициализации

### Шаг 1.2 - Скопировать API ключи

Перейди в **Settings → API**:
- Скопируй **Project URL** (выглядит как `https://xxxxx.supabase.co`)
- Скопируй **anon key** (длинная строка)
- Сохрани их безопасно!

### Шаг 1.3 - Инициализировать базу данных

1. В Supabase перейди в **SQL Editor**
2. Создай новый query
3. Скопируй весь контент из файла `DATABASE_INIT.sql`
4. Запусти (нажми "Run" или Ctrl+Enter)
5. Жди завершения (должно быть зелёное "Success")

✅ Таблицы созданы!

---

## 📋 ЭТАП 2: НАСТРОЙКА BACKEND СЕРВЕРА

### Шаг 2.1 - Установить Node.js

```bash
# Проверить установку
node --version
npm --version

# Если не установлен, скачай с https://nodejs.org/
```

### Шаг 2.2 - Установить зависимости

```bash
cd "/home/d1mt1m/Рабочий стол/men.ru new"

# Обновить package.json с backend зависимостями
npm install

# Установить дополнительные пакеты
npm install express cors dotenv @supabase/supabase-js bcryptjs jsonwebtoken body-parser

# Для разработки с hot-reload
npm install --save-dev nodemon
```

### Шаг 2.3 - Создать файл .env

1. Скопируй `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируй `.env` и заполни значения:
```
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://твой-проект.supabase.co
SUPABASE_KEY=твой-anon-key
JWT_SECRET=твоя-очень-длинная-случайная-строка
```

### Шаг 2.4 - Запустить сервер локально

```bash
# Разработка (с автоперезагрузкой)
npm run dev

# Или продакшн
npm start
```

Должно вывести:
```
🚀 Man.ru Backend Server Started
📡 Server running on port 3000
🌍 API: http://localhost:3000/api
```

### Шаг 2.5 - Тестировать API

Открой в браузере или используй curl:
```bash
# Health check
curl http://localhost:3000/health

# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","email":"test@example.com","password":"password123"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📋 ЭТАП 3: ОБНОВЛЕНИЕ ФРОНТЕНДА

### Шаг 3.1 - Обновить supabase-config.js

В файле `supabase-config.js` обновить API URL:

```javascript
// Вместо localStorage используем бэкенд
const API_BASE_URL = 'http://localhost:3000/api';

// Для продакшна:
// const API_BASE_URL = 'https://api.твой-домен.com/api';
```

### Шаг 3.2 - Обновить auth-script.js

Замени прямые вызовы Supabase на API calls:

```javascript
// БЫЛО:
await SupabaseStorage.createUser(user);

// СТАЛО:
const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
});

const data = await response.json();
if (data.token) {
    localStorage.setItem('auth_token', data.token);
    SupabaseStorage.setCurrentUser(data.user);
}
```

### Шаг 3.3 - Добавить токен в запросы

Для защищённых endpoint'ов добавляй токен в header:

```javascript
const token = localStorage.getItem('auth_token');

const response = await fetch(`${API_BASE_URL}/articles`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(articleData)
});
```

---

## 📋 ЭТАП 4: РАЗВЁРТЫВАНИЕ НА NETLIFY + HEROKU

### Вариант A: Netlify (фронтенд) + Heroku (бэкенд)

#### Развёртывание фронтенда на Netlify

1. Инициализируй git репозиторий:
```bash
git init
git add .
git commit -m "Initial commit - Man.ru frontend"
```

2. Загрузи на GitHub:
```bash
git remote add origin https://github.com/твой-username/men-ru-frontend.git
git branch -M main
git push -u origin main
```

3. Зарегистрируйся на https://netlify.com
4. Нажми "Add new site"
5. Выбери "Import an existing project" → GitHub
6. Выбери репозиторий `men-ru-frontend`
7. Нажми "Deploy site"

✅ Фронтенд live! Получишь URL вида `https://men-ru-xxxxxx.netlify.app`

#### Развёртывание бэкенда на Heroku

1. Зарегистрируйся на https://heroku.com
2. Установи Heroku CLI:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

3. Создай новое приложение:
```bash
heroku login
heroku create men-ru-backend
```

4. Добавь переменные окружения:
```bash
heroku config:set SUPABASE_URL=https://твой-проект.supabase.co
heroku config:set SUPABASE_KEY=твой-anon-key
heroku config:set JWT_SECRET=твой-secret-key
heroku config:set NODE_ENV=production
```

5. Загрузи код на Heroku:
```bash
git push heroku main
```

6. Проверь логи:
```bash
heroku logs --tail
```

✅ Бэкенд live! Получишь URL вида `https://men-ru-backend.herokuapp.com`

### Вариант B: Netlify Functions (всё в одном месте)

Это проще, но имеет ограничения. Можешь запустить бэкенд-функции прямо на Netlify.

---

## 📋 ЭТАП 5: ФИНАЛЬНАЯ КОНФИГУРАЦИЯ

### Шаг 5.1 - Обновить API URL в продакшне

В `supabase-config.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://men-ru-backend.herokuapp.com/api'
    : 'http://localhost:3000/api';
```

### Шаг 5.2 - Обновить CORS на бэкенде

В `server.js`:
```javascript
app.use(cors({
    origin: [
        'https://men-ru-xxxxxx.netlify.app', // твой Netlify домен
        'https://men-ru-backend.herokuapp.com',
        'http://localhost:3000',
        'http://localhost:8000'
    ],
    credentials: true
}));
```

### Шаг 5.3 - Проверить HTTPS

Убедись, что:
- ✅ Netlify автоматически включает HTTPS (Let's Encrypt)
- ✅ Heroku автоматически включает HTTPS
- ✅ Supabase использует HTTPS

### Шаг 5.4 - Включить Custom Domain (опционально)

На Netlify:
1. Site settings → Domain management
2. Нажми "Add custom domain"
3. Введи `men.ru` или `men-ru.com`
4. Следуй инструкциям для DNS

---

## 🔒 БЕЗОПАСНОСТЬ В ПРОДАКШЕНЕ

### Обязательно сделай:

1. **Хеширование паролей** ✅ (bcryptjs в server.js)
2. **JWT аутентификация** ✅ (jsonwebtoken в server.js)
3. **HTTPS** ✅ (Netlify + Heroku автоматически)
4. **CORS настройка** ✅ (только твои домены)
5. **Rate limiting** (добавить express-rate-limit)
6. **Input validation** (express-validator)
7. **Environment variables** ✅ (.env файл)
8. **SQL injection защита** ✅ (используем Supabase ORM)

### Добавить Rate Limiting:

```bash
npm install express-rate-limit
```

В `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // лимит 100 запросов за окно
});

app.use('/api/', limiter);
```

---

## 📊 ПРОВЕРКА ГОТОВНОСТИ

Перед публикацией убедись:

- [ ] Supabase БД инициализирована
- [ ] Backend сервер запускается без ошибок
- [ ] API endpoints отвечают (health check)
- [ ] Регистрация/вход работают
- [ ] Создание статей/постов работает
- [ ] CORS настроен правильно
- [ ] JWT токены генерируются
- [ ] .env файл не загружен на GitHub
- [ ] SSL сертификат включён
- [ ] Логирование настроено
- [ ] Бэкапы настроены (Supabase автоматически)

---

## 🚀 КОМАНДЫ РАЗВЁРТЫВАНИЯ

```bash
# Локальная разработка
npm run dev

# Тестирование перед продакшном
npm start

# Загрузка на GitHub
git add .
git commit -m "Update: production ready"
git push origin main

# Heroku будет автоматически перестраивать при push
# Netlify будет автоматически перестраивать при push
```

---

## 📝 URLS ПОСЛЕ РАЗВЁРТЫВАНИЯ

```
Frontend (Netlify):
  https://men-ru-xxxxxx.netlify.app

Backend (Heroku):
  https://men-ru-backend.herokuapp.com
  API: https://men-ru-backend.herokuapp.com/api

Database (Supabase):
  https://твой-проект.supabase.co

Health check:
  https://men-ru-backend.herokuapp.com/health
```

---

## ❓ РЕШЕНИЕ ПРОБЛЕМ

### Проблема: CORS ошибка
**Решение**: Добавь фронтенд URL в CORS на бэкенде

### Проблема: 404 на API
**Решение**: Проверь что бэкенд запущен и правильно скопирован URL

### Проблема: Ошибка аутентификации
**Решение**: Убедись что JWT_SECRET одинаков везде

### Проблема: Heroku app crashed
**Решение**: Смотри логи `heroku logs --tail`

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Supabase Документация](https://supabase.com/docs)
- [Express.js Документация](https://expressjs.com/)
- [Netlify Документация](https://docs.netlify.com/)
- [Heroku Документация](https://devcenter.heroku.com/)
- [PostgreSQL Документация](https://www.postgresql.org/docs/)

---

**Всё готово к боевому развёртыванию! 🎉**

Если у тебя возникнут вопросы, обратись ко мне. Удачи!
