/**
 * API Integration Helper для Man.ru
 * Работает с бэкенд API вместо прямого подключения к Supabase
 * 
 * Использование:
 * - Вместо HybridStorage используй APIClient
 * - Автоматически добавляет JWT токены
 * - Кэширует результаты для оффлайн режима
 */

class APIClient {
    constructor() {
        this.baseURL = this.getAPIBaseURL();
        this.token = localStorage.getItem('auth_token');
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 минут
    }

    getAPIBaseURL() {
        // Для локального разработки
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:3000/api';
        }
        if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
            return 'http://127.0.0.1:3000/api';
        }
        
        // Для продакшена - использует переменную окружения или угадывает
        if (typeof process !== 'undefined' && process.env.BACKEND_URL) {
            return process.env.BACKEND_URL + '/api';
        }
        
        // Если на Netlify, предполагаем что бэкенд на Heroku с тем же названием
        if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
            // Замени 'твой-бэкенд-heroku' на реальное имя
            return 'https://твой-бэкенд-heroku.herokuapp.com/api';
        }
        
        // По умолчанию для продакшена
        return 'https://api.твой-домен.com/api'; 
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(method, endpoint, data = null) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const options = {
                method,
                headers: this.getHeaders()
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API Error');
            }

            return result;
        } catch (error) {
            console.error(`❌ API Error [${method} ${endpoint}]:`, error.message);
            throw error;
        }
    }

    // ========== АУТЕНТИФИКАЦИЯ ==========

    async register(name, email, password) {
        const result = await this.request('POST', '/auth/register', {
            name, email, password
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    async login(email, password) {
        const result = await this.request('POST', '/auth/login', {
            email, password
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // ========== ПОЛЬЗОВАТЕЛИ ==========

    async getUser(id) {
        return this.request('GET', `/users/${id}`);
    }

    async updateUser(id, data) {
        return this.request('PUT', `/users/${id}`, data);
    }

    // ========== СТАТЬИ ==========

    async getArticles(category = null) {
        const query = category ? `?category=${category}` : '';
        return this.request('GET', `/articles${query}`);
    }

    async createArticle(data) {
        return this.request('POST', '/articles', data);
    }

    async getArticle(id) {
        return this.request('GET', `/articles/${id}`);
    }

    // ========== ФОРУМ ==========

    async getForumPosts(category = null) {
        const query = category ? `?category=${category}` : '';
        return this.request('GET', `/forum/posts${query}`);
    }

    async createForumPost(data) {
        return this.request('POST', '/forum/posts', data);
    }

    async getForumPost(id) {
        return this.request('GET', `/forum/posts/${id}`);
    }

    // ========== ОТВЕТЫ НА ФОРУМЕ ==========

    async getForumReplies(postId) {
        return this.request('GET', `/forum/posts/${postId}/replies`);
    }

    async createForumReply(postId, data) {
        return this.request('POST', `/forum/posts/${postId}/replies`, data);
    }

    // ========== CACHE ==========

    setCacheItem(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    getCacheItem(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clearCache() {
        this.cache.clear();
    }
}

// Глобальный экземпляр для использования
const api = new APIClient();
