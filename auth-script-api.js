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
        // Инициализация всегда происходит сразу в constructor
        // DOM должен быть готов к этому моменту
        console.log('AuthManager: init() called, DOM readyState:', document.readyState);
        
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
        const currentUser = localStorage.getItem(this.currentUserKey);
        
        console.log('🔄 Restoring session...', { token: !!token, userId, currentUser: !!currentUser });
        
        // Если есть сохранённый пользователь в localStorage - используем его
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                console.log('✅ User restored from localStorage:', user.name);
                
                // Если есть токен - пытаемся обновить данные с сервера
                if (token && userId) {
                    this.api.setToken(token);
                    try {
                        const freshUser = await this.api.getUser(userId);
                        console.log('✅ User data updated from server');
                        localStorage.setItem(this.currentUserKey, JSON.stringify(freshUser));
                    } catch (error) {
                        console.warn('⚠️ Could not update user from server, using cached:', error.message);
                        // Используем кэшированного пользователя
                    }
                }
                return;
            } catch (e) {
                console.error('❌ Error parsing cached user:', e);
            }
        }
        
        // Если нет кэша но есть токен - пытаемся загрузить с сервера
        if (token && userId) {
            this.api.setToken(token);
            try {
                const user = await this.api.getUser(userId);
                console.log('✅ User loaded from server:', user.name);
                localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            } catch (error) {
                console.warn('⚠️ Session expired or invalid:', error.message);
                // Не вызываем logout() автоматически - пусть пользователь решит
                // Просто очищаем токены
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_id');
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
            console.log('📤 Sending registration request...', { name, email });
            const result = await this.api.register(name, email, password);
            console.log('✅ Registration successful:', result);
            
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
            console.error('❌ Registration error details:', error);
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
            console.log('📤 Sending login request...', { email });
            const result = await this.api.login(email, password);
            console.log('✅ Login successful:', result);
            
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
            console.error('❌ Login error details:', error);
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
    // DELETE PROFILE
    // ========================================

    async deleteProfile() {
        const confirmed = confirm('⚠️ Вы уверены? Это действие необратимо и удалит ваш профиль.');
        
        if (!confirmed) {
            return;
        }

        const doubleCheck = prompt('Введите "удалить" для подтверждения удаления профиля:');
        
        if (doubleCheck !== 'удалить') {
            this.showNotification('❌ Удаление отменено', 'error');
            return;
        }

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                this.showNotification('❌ Ошибка: пользователь не найден', 'error');
                return;
            }

            console.log('🗑️ Deleting profile for user:', userId);
            await this.api.deleteUser(userId);
            
            this.showNotification('✅ Ваш профиль удалён. До свидания!', 'success');
            this.logout();
            
        } catch (error) {
            console.error('❌ Delete error:', error);
            this.showNotification(`❌ Ошибка удаления: ${error.message}`, 'error');
        }
    }

    // ========================================
    // UI MANAGEMENT
    // ========================================

    setupAuthButton() {
        const authContainer = document.getElementById('authContainer');
        if (!authContainer) {
            console.warn('authContainer not found');
            return;
        }

        const currentUser = this.getCurrentUser();

        if (currentUser) {
            // Пользователь вошел
            authContainer.innerHTML = `
                <div class="user-menu-wrapper">
                    <button class="auth-btn" id="userMenuBtn" style="cursor: pointer;">
                        👤 ${currentUser.name}
                    </button>
                    <div class="user-dropdown-menu" id="userMenu">
                        <a href="profile.html" class="user-menu-item">👤 Профиль</a>
                        <button class="user-menu-item delete-btn" id="deleteProfileBtn">🗑️ Удалить профиль</button>
                        <button class="user-menu-item logout-btn" id="logoutBtn">🚪 Выход</button>
                    </div>
                </div>
            `;
            
            const userMenuBtn = document.getElementById('userMenuBtn');
            const deleteProfileBtn = document.getElementById('deleteProfileBtn');
            const logoutBtn = document.getElementById('logoutBtn');

            if (userMenuBtn) {
                userMenuBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const menu = document.getElementById('userMenu');
                    if (menu) {
                        menu.classList.toggle('active');
                    }
                });
            }

            if (deleteProfileBtn) {
                deleteProfileBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.deleteProfile();
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.logout();
                });
            }

            // Закрытие меню при клике вне меню
            document.addEventListener('click', (e) => {
                const menu = document.getElementById('userMenu');
                const menuBtn = document.getElementById('userMenuBtn');
                if (menu && menuBtn && !menu.contains(e.target) && e.target !== menuBtn) {
                    menu.classList.remove('active');
                }
            });

        } else {
            // Пользователь не вошел
            authContainer.innerHTML = `
                <button class="auth-btn" id="authBtn" style="cursor: pointer;">🔐 Вход / Регистрация</button>
            `;
            
            const authBtn = document.getElementById('authBtn');
            if (authBtn) {
                authBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Auth button clicked - opening modal');
                    this.openAuthModal();
                });
            } else {
                console.error('authBtn not found');
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
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const registerName = document.getElementById('registerName');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');

        if (loginSubmit) {
            loginSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Login button clicked');
                this.handleLogin();
            });
        }

        // Добавляем обработчик Enter для логина
        if (loginEmail && loginPassword) {
            const handleLoginEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLogin();
                }
            };
            loginEmail.addEventListener('keypress', handleLoginEnter);
            loginPassword.addEventListener('keypress', handleLoginEnter);
        }

        if (registerSubmit) {
            registerSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Register button clicked');
                this.handleRegister();
            });
        }

        // Добавляем обработчик Enter для регистрации
        if (registerName && registerEmail && registerPassword && registerPasswordConfirm) {
            const handleRegisterEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleRegister();
                }
            };
            registerName.addEventListener('keypress', handleRegisterEnter);
            registerEmail.addEventListener('keypress', handleRegisterEnter);
            registerPassword.addEventListener('keypress', handleRegisterEnter);
            registerPasswordConfirm.addEventListener('keypress', handleRegisterEnter);
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
        console.log('Opening auth modal:', modal);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        } else {
            console.error('Auth modal not found in DOM');
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }

    updateAuthUI() {
        this.setupAuthButton();
        
        // Обновляем профиль если на странице профиля
        if (window.location.pathname.includes('profile.html')) {
            const currentUser = this.getCurrentUser();
            console.log('📄 On profile page, user:', currentUser?.name);
            
            // Если пользователь не авторизирован - перенаправляем на главную
            if (!currentUser) {
                console.warn('⚠️ User not authorized on profile page, redirecting...');
                // Добавляем небольшую задержку чтобы пользователь мог увидеть сообщение
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
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

// Инициализируем AuthManager
function initializeAuthManager() {
    if (window.authManager) return; // Already initialized
    
    console.log('Initializing AuthManager...');
    window.authManager = new AuthManager();
    
    // Setup logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.authManager.logout();
        });
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthManager);
} else {
    // DOM already loaded
    initializeAuthManager();
}
