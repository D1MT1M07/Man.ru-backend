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
            console.log('🔧 Using local API URL (localhost)');
            return 'http://localhost:3000/api';
        }
        if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
            console.log('🔧 Using local API URL (127.0.0.1)');
            return 'http://127.0.0.1:3000/api';
        }
        
        // Для Netlify версии - обращаемся к Render backend
        if (typeof window !== 'undefined' && (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com'))) {
            console.log('🔧 Using Render backend for Netlify frontend');
            return 'https://man-ru.onrender.com/api';
        }
        
        // Для продакшена на Render
        // Используем текущий домен + /api
        // Если фронтенд на https://man-ru.onrender.com, 
        // то API будет на https://man-ru.onrender.com/api
        const protocol = window.location.protocol; // https: или http:
        const host = window.location.host; // man-ru.onrender.com
        const backendURL = `${protocol}//${host}/api`;
        console.log('🔧 Using API URL:', backendURL);
        return backendURL;
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
        // Определяем url перед try чтобы она была доступна в catch
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            console.log(`🔗 API Request: ${method} ${url}`, data);
            console.log(`   Full URL: ${url}`);
            console.log(`   Headers:`, this.getHeaders());
            
            const options = {
                method,
                headers: this.getHeaders()
            };

            if (data) {
                options.body = JSON.stringify(data);
                console.log(`   Body:`, options.body);
            }

            console.log(`⏳ Fetching...`);
            const response = await fetch(url, options);
            console.log(`📊 Response received!`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Headers:`, {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length')
            });
            
            // Получаем текст ответа
            console.log(`⏳ Reading response text...`);
            const text = await response.text();
            console.log(`✅ Response text received (${text.length} bytes)`);
            console.log(`📝 Response text:`, text.substring(0, 300));
            
            // Проверяем пустой ответ
            if (!text) {
                console.error(`❌ Empty response! Status was ${response.status}`);
                console.error(`   Response headers:`, response.headers);
                throw new Error(`Empty response from server (status ${response.status})`);
            }
            
            // Пытаемся распарсить JSON
            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                console.error('Response was:', text);
                throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error(`❌ API Error [${method} ${endpoint}]:`);
            console.error(`   Message: ${error.message}`);
            console.error(`   Type: ${error.constructor.name}`);
            console.error(`   Stack: ${error.stack}`);
            
            // Специальная обработка для fetch ошибок
            if (error.message.includes('fetch') || error.constructor.name === 'TypeError') {
                console.error(`   🌐 Network/Fetch Error - возможно CORS, DNS или сервис down`);
                console.error(`   URL: ${url}`);
                console.error(`   Method: ${method}`);
            }
            
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
