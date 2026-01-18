/**
 * Authentication Script v2
 * Полностью переделанная система аутентификации
 */

class AuthManager {
    constructor() {
        this.usersKey = 'man_ru_users';
        this.currentUserKey = 'man_ru_current_user';
        this.init();
    }

    init() {
        // Миграция и синхронизация данных
        this.migrateUserData();
        
        // Пытаемся восстановить профиль, если он был потерян
        this.recoverUserProfile();
        
        this.setupAuthButton();
        this.setupAuthModal();
        this.updateAuthUI();
    }

    // ========================================
    // MIGRATE USER DATA
    // ========================================
    migrateUserData() {
        // Гарантируем, что у каждого пользователя есть все необходимые поля
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        let updated = false;

        users.forEach(user => {
            if (!user.followers) {
                user.followers = [];
                updated = true;
            }
            if (!user.following) {
                user.following = [];
                updated = true;
            }
            if (!user.avatar) {
                user.avatar = '👤';
                updated = true;
            }
            if (!user.bio) {
                user.bio = '';
                updated = true;
            }
            if (!user.birthDate) {
                user.birthDate = '';
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem(this.usersKey, JSON.stringify(users));
        }

        // Также добавляем authorEmail к статьям, если его нет
        const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
        let articlesUpdated = false;

        articles.forEach(article => {
            if (!article.authorEmail) {
                // Пытаемся найти email автора по имени
                const author = users.find(u => u.name === article.author);
                if (author) {
                    article.authorEmail = author.email;
                    articlesUpdated = true;
                }
            }
        });

        if (articlesUpdated) {
            localStorage.setItem('man_ru_articles', JSON.stringify(articles));
        }

        // Добавляем authorEmail к постам форума
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        let postsUpdated = false;

        posts.forEach(post => {
            if (!post.authorEmail) {
                const author = users.find(u => u.name === post.author);
                if (author) {
                    post.authorEmail = author.email;
                    postsUpdated = true;
                }
            }
        });

        if (postsUpdated) {
            localStorage.setItem('man_ru_forum_posts', JSON.stringify(posts));
        }
    }

    // ========================================
    // SETUP AUTH BUTTON
    // ========================================
    setupAuthButton() {
        const authContainer = document.getElementById('authContainer');
        if (!authContainer) return;

        let authBtn = document.getElementById('authBtn');
        if (!authBtn) {
            authContainer.innerHTML = `
                <button id="authBtn" style="background: #4a9eff; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s;">
                    Войти
                </button>
            `;
            authBtn = document.getElementById('authBtn');
        }

        authBtn.addEventListener('click', () => {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                this.showLogoutMenu();
            } else {
                document.getElementById('authModal').classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // ========================================
    // SETUP AUTH MODAL
    // ========================================
    setupAuthModal() {
        if (document.getElementById('authModal')) return;

        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'auth-modal';
        modal.innerHTML = this.getModalHTML();
        document.body.appendChild(modal);

        this.attachModalEventListeners();
    }

    // ========================================
    // GET MODAL HTML
    // ========================================
    getModalHTML() {
        return `
            <div class="auth-modal-overlay" id="authModalOverlay"></div>
            <div class="auth-modal-content" id="authModalContent">
                <button class="auth-modal-close" id="authModalClose">&times;</button>
                
                <div class="auth-tabs-container">
                    <button class="auth-tab-btn active" data-tab="login" id="tabLogin">🔓 Вход</button>
                    <button class="auth-tab-btn" data-tab="register" id="tabRegister">📝 Регистрация</button>
                </div>

                <!-- LOGIN FORM -->
                <div class="auth-form active" data-form="login" id="loginForm">
                    <h2>Вход в аккаунт</h2>
                    <p style="color: #666; font-size: 13px; margin: 0 0 20px 0;">Введите ваши учетные данные</p>
                    
                    <div class="form-group">
                        <label>Email адрес</label>
                        <input type="email" id="loginEmail" class="form-input" placeholder="ваш@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required>
                    </div>
                    <button type="button" class="form-submit" id="loginBtn">🔓 Войти</button>
                    <p style="text-align: center; color: #999; font-size: 13px; margin-top: 12px;">
                        Нет аккаунта? <button type="button" class="link-btn" id="toRegisterBtn">Создайте его</button>
                    </p>
                </div>

                <!-- REGISTER FORM -->
                <div class="auth-form" data-form="register" id="registerForm">
                    <h2>Создать аккаунт</h2>
                    <p style="color: #666; font-size: 13px; margin: 0 0 20px 0;">Присоединяйтесь к нашему сообществу</p>
                    
                    <div class="form-group">
                        <label>Ваше имя</label>
                        <small style="display: block; color: #999; margin-bottom: 5px;">Как вас будут видеть другие</small>
                        <input type="text" id="registerName" class="form-input" placeholder="Иван Петров" required>
                    </div>
                    <div class="form-group">
                        <label>Email адрес</label>
                        <small style="display: block; color: #999; margin-bottom: 5px;">Уникальный адрес для входа</small>
                        <input type="email" id="registerEmail" class="form-input" placeholder="ваш@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <small style="display: block; color: #999; margin-bottom: 5px;">Минимум 6 символов</small>
                        <input type="password" id="registerPassword" class="form-input" placeholder="••••••••" required>
                    </div>
                    <div class="form-group">
                        <label>Подтверждение пароля</label>
                        <small style="display: block; color: #999; margin-bottom: 5px;">Повторите пароль</small>
                        <input type="password" id="registerPasswordConfirm" class="form-input" placeholder="••••••••" required>
                    </div>
                    <button type="button" class="form-submit" id="registerBtn">✅ Создать аккаунт</button>
                    <p style="text-align: center; color: #999; font-size: 13px; margin-top: 12px;">
                        Уже есть аккаунт? <button type="button" class="link-btn" id="toLoginBtn">Войдите</button>
                    </p>
                </div>
            </div>
        `;
    }

    // ========================================
    // ATTACH MODAL EVENT LISTENERS
    // ========================================
    attachModalEventListeners() {
        const modal = document.getElementById('authModal');
        const overlay = document.getElementById('authModalOverlay');
        const closeBtn = document.getElementById('authModalClose');
        const tabButtons = document.querySelectorAll('.auth-tab-btn');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const toRegisterBtn = document.getElementById('toRegisterBtn');
        const toLoginBtn = document.getElementById('toLoginBtn');

        // Close modal
        closeBtn.addEventListener('click', () => this.closeAuthModal());
        overlay.addEventListener('click', () => this.closeAuthModal());

        // Tab switching
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Link buttons for form switching
        toRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('register');
        });

        toLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('login');
        });

        // Form submissions
        loginBtn.addEventListener('click', () => this.handleLogin());
        registerBtn.addEventListener('click', () => this.handleRegister());

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeAuthModal();
            }
        });
    }

    // ========================================
    // SWITCH TAB
    // ========================================
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.dataset.form === tabName);
        });
    }

    // ========================================
    // CLOSE MODAL
    // ========================================
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // ========================================
    // HANDLE LOGIN
    // ========================================
    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email) {
            this.showNotification('❌ Введите email', 'error');
            return;
        }

        if (!password) {
            this.showNotification('❌ Введите пароль', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            this.showNotification('❌ Неправильный email или пароль', 'error');
            return;
        }

        // Login success - save full user data
        localStorage.setItem(this.currentUserKey, JSON.stringify({
            id: user.id || Date.now().toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar || '👤',
            bio: user.bio || '',
            birthDate: user.birthDate || '',
            followers: user.followers || [],
            following: user.following || [],
            loginTime: new Date().toLocaleString('ru-RU')
        }));

        this.showNotification('✅ Успешный вход!');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        setTimeout(() => {
            this.closeAuthModal();
            this.updateAuthUI();
        }, 500);
    }

    // ========================================
    // HANDLE REGISTER
    // ========================================
    handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        // Validation
        if (!name) {
            this.showNotification('❌ Введите имя', 'error');
            return;
        }

        if (!email) {
            this.showNotification('❌ Введите email', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('❌ Неправильный email формат', 'error');
            return;
        }

        if (!password) {
            this.showNotification('❌ Введите пароль', 'error');
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

        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];

        if (users.find(u => u.email === email)) {
            this.showNotification('❌ Email уже зарегистрирован', 'error');
            return;
        }

        // Create user with all required fields
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            avatar: '👤',
            bio: '',
            birthDate: '',
            registrationDate: new Date().toLocaleDateString('ru-RU'),
            followers: [],
            following: [],
            articles: [],
            forumPosts: []
        };

        users.push(newUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));

        // Auto login with full user data
        localStorage.setItem(this.currentUserKey, JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            avatar: newUser.avatar,
            bio: newUser.bio,
            birthDate: newUser.birthDate,
            followers: newUser.followers,
            following: newUser.following,
            loginTime: new Date().toLocaleString('ru-RU')
        }));

        this.showNotification('✅ Аккаунт создан!');
        
        // Clear form
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerPasswordConfirm').value = '';

        setTimeout(() => {
            this.closeAuthModal();
            this.updateAuthUI();
            
            // Обновляем статистику на главной странице
            if (window.indexPageManager) {
                window.indexPageManager.updateSiteStats();
            }
        }, 500);
    }

    // ========================================
    // EMAIL VALIDATION
    // ========================================
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // ========================================
    // UPDATE AUTH UI
    // ========================================
    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        const currentUser = this.getCurrentUser();

        if (currentUser) {
            authBtn.textContent = `👤 ${currentUser.name}`;
            authBtn.style.background = '#4caf50';
        } else {
            authBtn.textContent = 'Войти';
            authBtn.style.background = '#4a9eff';
        }
    }

    // ========================================
    // GET CURRENT USER
    // ========================================
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    // ========================================
    // SHOW LOGOUT MENU
    // ========================================
    showLogoutMenu() {
        // Remove existing menu if present
        const existingMenu = document.getElementById('logoutMenu');
        if (existingMenu) existingMenu.remove();

        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const menu = document.createElement('div');
        menu.id = 'logoutMenu';
        menu.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            min-width: 220px;
            overflow: hidden;
        `;

        menu.innerHTML = `
            <div style="padding: 15px; border-bottom: 1px solid #eee;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #333;">👤 ${currentUser.name}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">${currentUser.email}</p>
            </div>
            <a href="profile.html" style="display: block; width: 100%; padding: 12px 15px; background: none; border: none; text-align: left; cursor: pointer; color: #4a9eff; font-weight: 600; transition: background 0.3s; text-decoration: none;">
                📋 Мой профиль
            </a>
            <button id="deleteAccountBtn" style="width: 100%; padding: 12px 15px; background: none; border: none; text-align: left; cursor: pointer; color: #ff9800; font-weight: 600; transition: background 0.3s; border-top: 1px solid #eee;">
                🗑️ Удалить аккаунт
            </button>
            <button id="logoutBtn" style="width: 100%; padding: 12px 15px; background: none; border: none; text-align: left; cursor: pointer; color: #ff6b6b; font-weight: 600; transition: background 0.3s; border-top: 1px solid #eee;">
                🚪 Выход
            </button>
        `;

        document.body.appendChild(menu);

        // Add logout button handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Add delete account button handler
        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            this.deleteAccount();
        });

        // Close menu on outside click
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target) && e.target.id !== 'authBtn') {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 0);
    }

    // ========================================
    // LOGOUT
    // ========================================
    logout() {
        localStorage.removeItem(this.currentUserKey);
        const menu = document.getElementById('logoutMenu');
        if (menu) menu.remove();
        this.updateAuthUI();
        this.showNotification('✅ Вы вышли из аккаунта');
    }

    // ========================================
    // DELETE ACCOUNT
    // ========================================
    deleteAccount() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.showNotification('❌ Пользователь не найден', 'error');
            return;
        }

        // Confirmation dialog
        if (!confirm(`⚠️ Вы уверены? Это действие удалит аккаунт "${currentUser.name}" и все ваши статьи, посты и комментарии. Это невозможно отменить.`)) {
            return;
        }

        // Double confirmation
        if (!confirm('❗ Последний шанс! Удалить аккаунт? Все ваши данные будут удалены безвозвратно.')) {
            return;
        }

        // Get all storage keys
        const usersKey = 'man_ru_users';
        const articlesKey = 'man_ru_articles';
        const forumPostsKey = 'man_ru_forum_posts';
        const commentsKey = 'man_ru_article_comments';
        const repliesKey = 'man_ru_forum_replies';

        try {
            // Remove user from users list
            let users = JSON.parse(localStorage.getItem(usersKey)) || [];
            users = users.filter(u => u.email !== currentUser.email);
            localStorage.setItem(usersKey, JSON.stringify(users));

            // Remove all user's articles
            let articles = JSON.parse(localStorage.getItem(articlesKey)) || [];
            articles = articles.filter(a => a.authorEmail !== currentUser.email);
            localStorage.setItem(articlesKey, JSON.stringify(articles));

            // Remove all user's forum posts
            let posts = JSON.parse(localStorage.getItem(forumPostsKey)) || [];
            posts = posts.filter(p => p.authorEmail !== currentUser.email);
            localStorage.setItem(forumPostsKey, JSON.stringify(posts));

            // Remove all user's comments
            let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
            comments = comments.filter(c => c.authorEmail !== currentUser.email);
            localStorage.setItem(commentsKey, JSON.stringify(comments));

            // Remove all user's forum replies
            let replies = JSON.parse(localStorage.getItem(repliesKey)) || [];
            replies = replies.filter(r => r.authorEmail !== currentUser.email);
            localStorage.setItem(repliesKey, JSON.stringify(replies));

            // Logout and close menu
            localStorage.removeItem(this.currentUserKey);
            const menu = document.getElementById('logoutMenu');
            if (menu) menu.remove();

            // Update UI and show notification
            this.updateAuthUI();
            this.showNotification('✅ Аккаунт удалён. Все ваши данные были удалены.');

            // Redirect to home page after notification
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

            // Update stats if available
            if (window.indexPageManager) {
                window.indexPageManager.updateSiteStats();
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            this.showNotification('❌ Ошибка при удалении аккаунта', 'error');
        }
    }

    // ========================================
    // SHOW NOTIFICATION
    // ========================================
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.innerHTML = message;
        
        const bgColor = type === 'error' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 'linear-gradient(135deg, #4caf50 0%, #3d8b40 100%)';
        const shadow = type === 'error' ? 'rgba(255, 107, 107, 0.4)' : 'rgba(76, 175, 80, 0.4)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 16px ${shadow};
            font-size: 14px;
            font-weight: 500;
            z-index: 10002;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // ========================================
    // SUBSCRIBE TO USER
    // ========================================
    subscribeToUser(userIdToFollow) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.showNotification('❌ Пожалуйста, войдите в аккаунт', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        const currentUserData = users.find(u => u.id === currentUser.id);
        const userToFollow = users.find(u => u.id === userIdToFollow);

        if (!currentUserData || !userToFollow) {
            this.showNotification('❌ Пользователь не найден', 'error');
            return;
        }

        // Check if already following
        if (!currentUserData.following) {
            currentUserData.following = [];
        }
        if (!userToFollow.followers) {
            userToFollow.followers = [];
        }

        if (currentUserData.following.includes(userIdToFollow)) {
            // Unsubscribe
            currentUserData.following = currentUserData.following.filter(id => id !== userIdToFollow);
            userToFollow.followers = userToFollow.followers.filter(id => id !== currentUser.id);
            this.showNotification('✅ Вы отписались от пользователя');
        } else {
            // Subscribe
            currentUserData.following.push(userIdToFollow);
            userToFollow.followers.push(currentUser.id);
            this.showNotification('✅ Вы подписались на пользователя');
        }

        // Update users in localStorage
        localStorage.setItem(this.usersKey, JSON.stringify(users));

        // Update UI if available
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('subscribersUpdated', { 
                detail: { userId: userIdToFollow } 
            }));
        }
    }

    // ========================================
    // GET USER SUBSCRIBERS COUNT
    // ========================================
    getSubscribersCount(userId) {
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        const user = users.find(u => u.id === userId);
        return user && user.followers ? user.followers.length : 0;
    }

    // ========================================
    // GET USER FOLLOWING COUNT
    // ========================================
    getFollowingCount(userId) {
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        const user = users.find(u => u.id === userId);
        return user && user.following ? user.following.length : 0;
    }

    // ========================================
    // CHECK IF CURRENT USER FOLLOWS
    // ========================================
    isFollowing(userIdToCheck) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        const currentUserData = users.find(u => u.id === currentUser.id);

        return currentUserData && currentUserData.following && currentUserData.following.includes(userIdToCheck);
    }

    // ========================================
    // RECOVER USER PROFILE
    // ========================================
    recoverUserProfile() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.email) return false;

        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        let userExists = users.find(u => u.email === currentUser.email);

        // Если пользователь существует, восстанавливаем из него
        if (userExists) {
            localStorage.setItem(this.currentUserKey, JSON.stringify({
                id: userExists.id,
                email: userExists.email,
                name: userExists.name,
                avatar: userExists.avatar || '👤',
                bio: userExists.bio || '',
                birthDate: userExists.birthDate || '',
                followers: userExists.followers || [],
                following: userExists.following || [],
                loginTime: new Date().toLocaleString('ru-RU')
            }));
            return true;
        }

        // Если профиля нет, но есть статьи/посты от этого email - восстанавливаем профиль
        const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        
        const userArticles = articles.filter(a => a.authorEmail === currentUser.email);
        const userPosts = posts.filter(p => p.authorEmail === currentUser.email);

        if (userArticles.length > 0 || userPosts.length > 0) {
            // Восстанавливаем профиль на основе контента
            const recoveredUser = {
                id: currentUser.id || Date.now().toString(),
                name: currentUser.name || 'Пользователь',
                email: currentUser.email,
                password: '', // Без пароля, т.к. восстанавливаем из контента
                avatar: currentUser.avatar || '👤',
                bio: currentUser.bio || '',
                birthDate: currentUser.birthDate || '',
                registrationDate: new Date().toLocaleDateString('ru-RU'),
                followers: currentUser.followers || [],
                following: currentUser.following || [],
                articles: userArticles.map(a => a.id),
                forumPosts: userPosts.map(p => p.id)
            };

            users.push(recoveredUser);
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            
            // Обновляем currentUser с полной информацией
            localStorage.setItem(this.currentUserKey, JSON.stringify({
                id: recoveredUser.id,
                email: recoveredUser.email,
                name: recoveredUser.name,
                avatar: recoveredUser.avatar,
                bio: recoveredUser.bio,
                birthDate: recoveredUser.birthDate,
                followers: recoveredUser.followers,
                following: recoveredUser.following,
                loginTime: new Date().toLocaleString('ru-RU')
            }));

            this.showNotification('✅ Профиль восстановлен!');
            return true;
        }

        return false;
    }
}

// ========================================
// GLOBAL INSTANCE
// ========================================
let authManager;

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});

// ========================================
// GLOBAL UTILITY FUNCTIONS
// ========================================
window.recoverAllProfiles = function() {
    const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
    const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
    const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
    
    let recovered = 0;
    
    // Собираем уникальные email авторов из статей и постов
    const authorEmails = new Set();
    articles.forEach(a => { if (a.authorEmail) authorEmails.add(a.authorEmail); });
    posts.forEach(p => { if (p.authorEmail) authorEmails.add(p.authorEmail); });
    
    // Проверяем, какие авторы отсутствуют в списке пользователей
    authorEmails.forEach(email => {
        const exists = users.find(u => u.email === email);
        if (!exists) {
            // Пытаемся восстановить из имени
            let authorName = 'Пользователь';
            const authorArticle = articles.find(a => a.authorEmail === email);
            const authorPost = posts.find(p => p.authorEmail === email);
            
            if (authorArticle) authorName = authorArticle.author;
            else if (authorPost) authorName = authorPost.author;
            
            // Создаём восстановленного пользователя
            const recoveredUser = {
                id: Date.now().toString() + Math.random().toString(),
                name: authorName,
                email: email,
                password: '', // Без пароля
                avatar: '👤',
                bio: '',
                birthDate: '',
                registrationDate: new Date().toLocaleDateString('ru-RU'),
                followers: [],
                following: [],
                articles: [],
                forumPosts: []
            };
            
            users.push(recoveredUser);
            recovered++;
        }
    });
    
    if (recovered > 0) {
        localStorage.setItem('man_ru_users', JSON.stringify(users));
        console.log(`✅ Восстановлено ${recovered} профилей!`);
    } else {
        console.log('✅ Все профили в порядке!');
    }
    
    return recovered;
};

window.syncUserEmails = function() {
    const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
    const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
    const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
    
    // Добавляем authorEmail к статьям
    articles.forEach(article => {
        if (!article.authorEmail) {
            const author = users.find(u => u.name === article.author);
            if (author) {
                article.authorEmail = author.email;
            }
        }
    });
    
    // Добавляем authorEmail к постам
    posts.forEach(post => {
        if (!post.authorEmail) {
            const author = users.find(u => u.name === post.author);
            if (author) {
                post.authorEmail = author.email;
            }
        }
    });
    
    localStorage.setItem('man_ru_articles', JSON.stringify(articles));
    localStorage.setItem('man_ru_forum_posts', JSON.stringify(posts));
    
    console.log('✅ Синхронизация завершена!');
};

// ========================================
// STYLES
// ========================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(400px); }
        to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(400px); }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .auth-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }

    .auth-modal.active {
        display: flex;
        animation: fadeIn 0.3s ease;
    }

    .auth-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }

    .auth-modal-content {
        position: relative;
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 420px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideInRight 0.3s ease;
    }

    .auth-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 32px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    }

    .auth-modal-close:hover {
        color: #333;
        transform: rotate(90deg);
    }

    .auth-tabs-container {
        display: flex;
        gap: 10px;
        margin-bottom: 30px;
        border-bottom: 2px solid #f0f0f0;
    }

    .auth-tab-btn {
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
        border: none;
        cursor: pointer;
        font-weight: 600;
        color: #666;
        border-radius: 8px 8px 0 0;
        transition: all 0.3s ease;
        font-size: 14px;
    }

    .auth-tab-btn:hover {
        background: linear-gradient(135deg, #efefef 0%, #e5e5e5 100%);
        color: #333;
    }

    .auth-tab-btn.active {
        color: white;
        background: linear-gradient(135deg, #4a9eff 0%, #2d7ed8 100%);
        box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
    }

    .auth-form {
        display: none;
    }

    .auth-form.active {
        display: block;
    }

    .auth-form h2 {
        margin: 0 0 10px 0;
        font-size: 22px;
        color: #333;
    }

    .form-group {
        margin-bottom: 18px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .form-input {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 14px;
        transition: all 0.3s;
    }

    .form-input:focus {
        outline: none;
        border-color: #4a9eff;
        box-shadow: 0 0 8px rgba(74, 158, 255, 0.3);
    }

    .form-submit {
        width: 100%;
        background: linear-gradient(135deg, #4a9eff 0%, #2d7ed8 100%);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s;
        box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
    }

    .form-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
    }

    .form-submit:active {
        transform: translateY(0);
    }

    .link-btn {
        background: none;
        border: none;
        color: #4a9eff;
        cursor: pointer;
        font-weight: 600;
        text-decoration: none;
        padding: 0;
        font: inherit;
    }

    .link-btn:hover {
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .auth-modal-content {
            max-width: 95%;
            padding: 30px 20px;
        }

        .auth-form h2 {
            font-size: 18px;
        }
    }
`;
document.head.appendChild(styleSheet);
