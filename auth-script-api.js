/**
 * Authentication Script v3 - With API Backend
 * Использует APIClient для подключения к Express бэкенду
 */

class AuthManager {
    constructor() {
        this.api = new APIClient();
        this.currentUserKey = 'man_ru_current_user';
        this.init();
    }

    init() {
        this.setupAuthButton();
        this.setupAuthModal();
        this.updateAuthUI();
        this.restoreSession();
    }

    // ========================================
    // SESSION MANAGEMENT
    // ========================================

    async restoreSession() {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        
        if (token && userId) {
            this.api.setToken(token);
            try {
                const user = await this.api.getUser(userId);
                localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            } catch (error) {
                console.warn('Session expired:', error);
                this.logout();
            }
        }
    }

    getCurrentUser() {
        try {
            const user = localStorage.getItem(this.currentUserKey);
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    // ========================================
    // REGISTRATION
    // ========================================

    async handleRegister() {
        const name = document.getElementById('registerName')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;

        // Validation
        if (!name || !email || !password || !passwordConfirm) {
            this.showNotification('❌ Заполните все поля', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('❌ Неправильный email формат', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('❌ Пароль минимум 6 символов', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            this.showNotification('❌ Пароли не совпадают', 'error');
            return;
        }

        try {
            const result = await this.api.register(name, email, password);
            
            // Сохраняем токен и данные пользователя
            this.api.setToken(result.token);
            localStorage.setItem('user_id', result.user.id);
            localStorage.setItem(this.currentUserKey, JSON.stringify(result.user));
            
            this.showNotification('✅ Успешная регистрация! Добро пожаловать!', 'success');
            this.closeAuthModal();
            this.updateAuthUI();
            
            // Перенаправляем на профиль
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification(`❌ Ошибка регистрации: ${error.message}`, 'error');
        }
    }

    // ========================================
    // LOGIN
    // ========================================

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.showNotification('❌ Введите email и пароль', 'error');
            return;
        }

        try {
            const result = await this.api.login(email, password);
            
            // Сохраняем токен и данные пользователя
            this.api.setToken(result.token);
            localStorage.setItem('user_id', result.user.id);
            localStorage.setItem(this.currentUserKey, JSON.stringify(result.user));
            
            this.showNotification('✅ Успешный вход!', 'success');
            this.closeAuthModal();
            this.updateAuthUI();
            
            // Перенаправляем на профиль
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(`❌ Ошибка входа: ${error.message}`, 'error');
        }
    }

    // ========================================
    // LOGOUT
    // ========================================

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem(this.currentUserKey);
        this.updateAuthUI();
        this.showNotification('✅ Вы вышли из системы', 'success');
        window.location.href = 'index.html';
    }

    // ========================================
    // UI MANAGEMENT
    // ========================================

    setupAuthButton() {
        const authContainer = document.getElementById('authContainer');
        if (!authContainer) return;

        const currentUser = this.getCurrentUser();

        if (currentUser) {
            // Пользователь вошел
            authContainer.innerHTML = `
                <button class="auth-btn" id="userMenuBtn">
                    👤 ${currentUser.name}
                </button>
            `;
            
            document.getElementById('userMenuBtn').addEventListener('click', () => {
                const menu = document.getElementById('userMenu');
                if (menu) {
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
            });
        } else {
            // Пользователь не вошел
            authContainer.innerHTML = `
                <button class="auth-btn" id="authBtn">🔐 Вход / Регистрация</button>
            `;
            
            const authBtn = document.getElementById('authBtn');
            if (authBtn) {
                authBtn.addEventListener('click', () => this.openAuthModal());
            }
        }
    }

    setupAuthModal() {
        // Переключение между вкладками
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.addEventListener('click', () => {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
            });

            registerTab.addEventListener('click', () => {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                loginTab.classList.remove('active');
                registerTab.classList.add('active');
            });
        }

        // Обработчики форм
        const loginSubmit = document.getElementById('loginSubmit');
        const registerSubmit = document.getElementById('registerSubmit');

        if (loginSubmit) {
            loginSubmit.addEventListener('click', () => this.handleLogin());
        }

        if (registerSubmit) {
            registerSubmit.addEventListener('click', () => this.handleRegister());
        }

        // Закрытие модального окна
        const closeBtn = document.getElementById('closeAuthBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAuthModal());
        }

        // Закрытие при клике вне модального окна
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAuthModal();
                }
            });
        }
    }

    openAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'block';
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
    }

    updateAuthUI() {
        this.setupAuthButton();
        
        // Обновляем профиль если на странице профиля
        if (window.location.pathname.includes('profile.html')) {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                window.location.href = 'index.html';
            }
        }
    }

    // ========================================
    // UTILITIES
    // ========================================

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showNotification(message, type = 'info') {
        // Создаём notification если его нет
        let notification = document.getElementById('authNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'authNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: #333;
                color: white;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 500;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }
}

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    
    // Обработчик кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.authManager.logout();
        });
    }
});
