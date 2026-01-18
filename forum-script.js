/**
 * Forum Script - Управление форумом
 */

class ForumPageManager {
    constructor() {
        this.postsKey = 'man_ru_forum_posts';
        this.init();
    }

    init() {
        this.initializeDefaultPosts();
        this.setupModalHandlers();
        this.setupMenuToggle();
        this.renderForumPosts();
        this.renderTopUsers();
        this.setupForumPostClickHandlers();
    }

    // Initialize default posts
    initializeDefaultPosts() {
        if (localStorage.getItem(this.postsKey)) return;

        const defaultPosts = [
            {
                id: 1,
                title: 'Сын попал в дурную компанию. Как вернуть его на правильный путь?',
                category: 'relations',
                message: 'Моему сыну 16 лет. Недавно узнал, что он ходит с ребятами, которые принимают наркотики. Не знаю, как с ним говорить, боюсь еще больше его отдалить. Как вообще разговаривать с подростком в такой ситуации?',
                author: 'Алексей',
                date: new Date().toLocaleString('ru-RU'),
                comments: 73
            },
            {
                id: 2,
                title: 'Жена требует развод, потому что я слишком работаю. Как найти баланс?',
                category: 'relations',
                message: 'Работаю в крупной компании, хорошая зарплата. Но жена говорит, что я ее игнорирую. Вчера сказала, что подумывает о разводе. Я люблю свою семью, но не могу быть везде одновременно. Может, я что-то не понимаю?',
                author: 'Николай',
                date: new Date(Date.now() - 86400000).toLocaleString('ru-RU'),
                comments: 156
            },
            {
                id: 3,
                title: 'Развод и дети - как правильно все сделать?',
                category: 'relations',
                message: 'С женой не сходимся по характеру. Три года брака, двое детей (5 и 8 лет). Оба понимаем, что дальше так не может быть, но боимся испортить жизнь детям. Как вообще рассказать им? Какой минимум нужно сделать?',
                author: 'Владимир',
                date: new Date(Date.now() - 172800000).toLocaleString('ru-RU'),
                comments: 42
            },
            {
                id: 4,
                title: 'Какие гаджеты облегчают жизнь?',
                category: 'tech',
                message: 'Какие технологические устройства вы считаете необходимыми? Поделитесь своими находками и рекомендациями.',
                author: 'Дмитрий А.',
                date: new Date(Date.now() - 259200000).toLocaleString('ru-RU'),
                comments: 124
            },
            {
                id: 5,
                title: 'Как выглядеть ухоженным?',
                category: 'style',
                message: 'Базовые правила ухода за собой и создания опрятного вида. Поделитесь своим опытом!',
                author: 'Сергей М.',
                date: new Date(Date.now() - 345600000).toLocaleString('ru-RU'),
                comments: 67
            },
            {
                id: 6,
                title: 'Здоровое питание для активных мужчин',
                category: 'health',
                message: 'Какой рацион питания вы считаете оптимальным для поддержания здоровья и энергии?',
                author: 'Константин В.',
                date: new Date(Date.now() - 432000000).toLocaleString('ru-RU'),
                comments: 89
            }
        ];

        localStorage.setItem(this.postsKey, JSON.stringify(defaultPosts));
    }

    // Modal handlers
    setupModalHandlers() {
        const modal = document.getElementById('createPostModal');
        if (!modal) return;

        const btn = document.getElementById('createPostBtn');
        const closeBtn = document.getElementById('closePostModalBtn');
        const form = document.getElementById('createPostForm');
        const modalContent = modal.querySelector('.modal__content');

        if (btn) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        // Prevent modal close when clicking on modal content
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        const overlay = modal.querySelector('.modal__overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createPost();
            });
        }
    }

    // Create post
    createPost() {
        const title = document.getElementById('postTitle').value.trim();
        const categoryElement = document.getElementById('postCategory');
        const category = categoryElement ? categoryElement.value.trim() : '';
        const message = document.getElementById('postMessage').value.trim();
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('man_ru_current_user'));
        const author = currentUser ? currentUser.name : (document.getElementById('postAuthor')?.value || 'Аноним');

        // Валидация с более понятными сообщениями об ошибках
        if (!title) {
            this.showNotification('❌ Пожалуйста, введите название темы', 'error');
            return;
        }
        
        if (!category) {
            this.showNotification('❌ Пожалуйста, выберите категорию', 'error');
            return;
        }
        
        if (!message) {
            this.showNotification('❌ Пожалуйста, введите описание темы', 'error');
            return;
        }

        const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
        
        const newPost = {
            id: Date.now(),
            title: title,
            category: category,
            message: message,
            content: message,
            description: message,
            author: author,
            authorEmail: currentUser ? currentUser.email : 'anonymous',
            authorId: currentUser ? currentUser.id : null,
            date: new Date().toLocaleString('ru-RU'),
            comments: 0
        };

        posts.push(newPost);
        localStorage.setItem(this.postsKey, JSON.stringify(posts));

        const modal = document.getElementById('createPostModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        document.getElementById('createPostForm').reset();
        this.showNotification('✅ Тема успешно создана!');
        this.renderForumPosts();
        
        // Обновляем статистику на главной странице
        if (window.indexPageManager) {
            window.indexPageManager.updateSiteStats();
        }
        this.renderTopUsers();
    }

    renderTopUsers() {
        const container = document.getElementById('topUsersList');
        if (!container) return;

        const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
        const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
        
        // Default авторы (системные заглушки)
        const defaultAuthors = new Set(['Игорь', 'Виктор', 'Павел', 'Максим', 'Андрей', 'Антон', 'Денис', 'Юрий']);
        
        // Получаем только реальных пользователей (зарегистрированных)
        const realUserNames = new Set(users.map(u => u.name));
        
        // Подсчитываем активность каждого пользователя
        const userActivity = {};
        
        posts.forEach(post => {
            // Пропускаем default авторов
            if (defaultAuthors.has(post.author)) return;
            
            if (!userActivity[post.author]) {
                userActivity[post.author] = { posts: 0, articles: 0, total: 0, avatar: '👤', id: '', email: '' };
            }
            userActivity[post.author].posts += 1;
        });
        
        articles.forEach(article => {
            // Пропускаем default авторов
            if (defaultAuthors.has(article.author)) return;
            
            if (!userActivity[article.author]) {
                userActivity[article.author] = { posts: 0, articles: 0, total: 0, avatar: '👤', id: '', email: '' };
            }
            userActivity[article.author].articles += 1;
        });
        
        // Получаем данные пользователей (аватарки и ID)
        users.forEach(user => {
            if (userActivity[user.name]) {
                userActivity[user.name].avatar = user.avatar || '👤';
                userActivity[user.name].id = user.id;
                userActivity[user.name].email = user.email;
            }
        });
        
        // Вычисляем общую активность и сортируем
        const sortedUsers = Object.entries(userActivity)
            .filter(([name]) => realUserNames.has(name)) // Показываем только реальных пользователей
            .map(([name, data]) => ({
                name,
                ...data,
                total: data.posts + data.articles
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
        
        if (sortedUsers.length === 0) {
            container.innerHTML = '<p style="font-size: 13px; opacity: 0.9; margin: 0;">Нет активных пользователей</p>';
            return;
        }
        
        container.innerHTML = sortedUsers.map((user, index) => {
            let avatarHTML = user.avatar;
            if (user.avatar && user.avatar.startsWith('data:')) {
                avatarHTML = `<img src="${user.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; display: inline-block;">`;
            } else {
                avatarHTML = `<span style="font-size: 18px;">${user.avatar}</span>`;
            }
            
            const profileLink = user.id ? `view-profile.html?id=${user.id}` : '#';
            
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2); cursor: pointer;">
                    <a href="${profileLink}" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; flex: 1;">
                        <span style="font-weight: bold; font-size: 14px;">${index + 1}</span>
                        ${avatarHTML}
                        <span style="font-size: 13px;">${user.name}</span>
                    </a>
                    <span style="font-size: 12px; opacity: 0.8;">${user.total} 📝</span>
                </div>
            `;
        }).join('');
    }

    // Render posts
    renderForumPosts() {
        const container = document.getElementById('forumPostsList');
        if (!container) return;

        const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
        const sorted = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sorted.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <p style="font-size: 48px; margin-bottom: 10px;">💭</p>
                    <p style="color: #999; font-size: 16px;">Обсуждений пока нет</p>
                </div>
            `;
            return;
        }

        // Get all replies from localStorage
        const allReplies = JSON.parse(localStorage.getItem('man_ru_forum_replies')) || {};

        container.innerHTML = sorted.map(post => {
            // Get dynamic reply count
            const replyCount = (allReplies[post.id] || []).length;
            
            // Get author avatar and ID
            const author = users.find(u => u.email === post.authorEmail);
            const authorId = author ? author.id : '';
            const avatar = author ? author.avatar : '👤';
            let avatarHTML = avatar;
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 6px;">`;
            } else {
                avatarHTML = `<span style="font-size: 16px; margin-right: 4px;">${avatar}</span>`;
            }
            
            const authorLink = authorId ?
                `<a href="view-profile.html?id=${authorId}" onclick="event.stopPropagation();" style="display: flex; align-items: center; cursor: pointer; color: #4a9eff; text-decoration: underline;">${avatarHTML} ${post.author}</a>` :
                `<span style="display: flex; align-items: center;">${avatarHTML} ${post.author}</span>`;
            
            return `
            <div class="forum-post" data-post-id="${post.id}" style="cursor: pointer;">
                <div class="forum-post__header">
                    <div>
                        <h4 class="forum-post__title">${post.title}</h4>
                        <span class="forum-post__category">${this.getCategoryName(post.category)}</span>
                    </div>
                </div>
                <div class="forum-post__author" style="display: flex; align-items: center;">${authorLink}</div>
                <p class="forum-post__message">${post.message}</p>
                <div class="forum-post__meta">
                    <span class="forum-post__date">🕐 ${post.date}</span>
                    <div class="forum-post__actions">
                        <span>💬 ${replyCount} ответов</span>
                    </div>
                </div>
            </div>
        `
        }).join('');

        // Add click listeners
        this.attachForumPostClickHandlers();
    }

    attachForumPostClickHandlers() {
        document.querySelectorAll('.forum-post').forEach(post => {
            post.addEventListener('click', (e) => {
                const postId = post.getAttribute('data-post-id');
                const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
                const forumPost = posts.find(p => p.id == postId);
                
                if (forumPost) {
                    this.openForumPostModal(forumPost);
                }
            });
        });
    }

    openForumPostModal(post) {
        // Увеличиваем количество просмотров
        this.incrementForumViews(post.id);
        
        const modalId = 'forum-modal-' + post.id;
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        
        // Получаем обновлённый пост с новым количеством просмотров
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        const updatedPost = posts.find(p => p.id == post.id);
        const views = updatedPost ? (updatedPost.views || 0) : (post.views || 0);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💬 ${post.title}</h2>
                    <span class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</span>
                </div>
                <div class="modal-meta">
                    <span>📂 ${this.getCategoryName(post.category)}</span>
                    <span>👤 <span style="cursor: pointer; color: #4a9eff; text-decoration: underline;" onclick="window.forumManager.viewUserProfile('${post.author}')">${post.author}</span></span>
                    <span>📅 ${post.date}</span>
                    <span>👁️ ${views} просмотров</span>
                    <span>💬 ${post.comments} ответов</span>
                </div>
                <div class="modal-body">
                    <p>${post.content || post.message}</p>
                </div>
                <div class="modal-comments">
                    <h3 style="margin-bottom: 15px; font-size: 16px;">📝 Ответы в обсуждение</h3>
                    <div class="comments-list" id="forum-replies-${post.id}">
                        <p style="color: #999; font-size: 12px;">Загрузка ответов...</p>
                    </div>
                    <div class="comment-form">
                        <textarea id="forum-reply-${post.id}" placeholder="Напишите ваш ответ в обсуждение (5-500 символов)..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; font-size: 13px; resize: vertical; min-height: 80px;"></textarea>
                        <button onclick="window.forumManager.submitForumReply(${post.id})" style="background: #3498db; color: white; border: none; padding: 10px 16px; margin-top: 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">Ответить</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadForumReplies(post.id);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    incrementForumViews(postId) {
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        const post = posts.find(p => p.id == postId);
        
        if (post) {
            post.views = (post.views || 0) + 1;
            localStorage.setItem('man_ru_forum_posts', JSON.stringify(posts));
        }
    }

    loadForumReplies(postId) {
        const repliesList = document.getElementById(`forum-replies-${postId}`);
        if (!repliesList) return;

        const allReplies = JSON.parse(localStorage.getItem('man_ru_forum_replies')) || {};
        const replies = allReplies[postId] || [];
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];

        if (replies.length === 0) {
            repliesList.innerHTML = '<p style="color: #999; font-size: 12px;">Нет ответов. Начните обсуждение!</p>';
            return;
        }

        repliesList.innerHTML = replies.map(r => {
            // Get author avatar
            const author = users.find(u => u.email === r.authorEmail);
            const avatar = author ? author.avatar : '👤';
            let avatarHTML = avatar;
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 16px; height: 16px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 4px;">`;
            } else {
                avatarHTML = `<span style="font-size: 14px; margin-right: 2px;">${avatar}</span>`;
            }
            
            return `
            <div class="comment-item">
                <strong style="display: flex; align-items: center;">${avatarHTML} ${r.author}</strong>
                <div style="color: #666; font-size: 13px; margin-top: 5px;">${r.text}</div>
                <div style="color: #999; font-size: 11px; margin-top: 5px;">${r.date}</div>
            </div>
        `}).join('');
    }

    submitForumReply(postId) {
        const input = document.getElementById(`forum-reply-${postId}`);
        if (!input || !input.value.trim()) {
            alert('Напишите ответ!');
            return;
        }

        const text = input.value.trim();
        if (text.length < 5) {
            alert('Минимум 5 символов');
            return;
        }

        if (text.length > 500) {
            alert('Максимум 500 символов');
            return;
        }

        const allReplies = JSON.parse(localStorage.getItem('man_ru_forum_replies')) || {};
        if (!allReplies[postId]) allReplies[postId] = [];

        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('man_ru_current_user'));
        const author = currentUser ? currentUser.name : 'Аноним';
        const authorEmail = currentUser ? currentUser.email : 'anonymous';

        allReplies[postId].push({
            author: author,
            authorEmail: authorEmail,
            text: text,
            date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem('man_ru_forum_replies', JSON.stringify(allReplies));
        input.value = '';
        this.loadForumReplies(postId);

        // Показываем уведомление
        this.showNotification('✅ Ответ добавлен!');
    }

    setupForumPostClickHandlers() {
        // Этот метод вызывается из renderForumPosts
    }

    // Menu toggle
    setupMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const navigation = document.getElementById('navigation');

        if (menuToggle && navigation) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navigation.classList.toggle('active');
            });
        }
    }

    viewUserProfile(username) {
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
        const user = users.find(u => u.name === username);
        
        if (!user) {
            alert('Пользователь не найден');
            return;
        }
        
        const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
        const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
        
        const userPosts = posts.filter(p => p.author === username).length;
        const userArticles = articles.filter(a => a.author === username).length;
        
        const birthDate = user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : 'Не указана';
        
        const modalHTML = `
            <div id="userProfileModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div id="userAvatarDisplay" style="font-size: 60px; margin-bottom: 15px; width: 80px; height: 80px; margin-left: auto; margin-right: auto; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 8px;">${user.avatar || '👤'}</div>
                        <h2 style="margin: 0 0 5px 0;">${user.name}</h2>
                        <p style="color: #666; margin: 0 0 10px 0;">${user.email}</p>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 0 0 10px 0; font-weight: 600;">📝 О пользователе</p>
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">${user.bio || '(Описание не заполнено)'}</p>
                        <p style="margin: 0; color: #999; font-size: 13px;">🎂 Дата рождения: ${birthDate}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <div style="background: #e8f4f8; padding: 15px; border-radius: 4px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #4a9eff;">${userArticles}</div>
                            <div style="color: #666; font-size: 12px;">Статей написано</div>
                        </div>
                        <div style="background: #f0e8f8; padding: 15px; border-radius: 4px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #764ba2;">${userPosts}</div>
                            <div style="color: #666; font-size: 12px;">Постов на форуме</div>
                        </div>
                    </div>
                    
                    <button onclick="document.getElementById('userProfileModal').remove()" style="width: 100%; background: #ddd; color: #333; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">❌ Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Отображаем фото если это Data URL
        if (user.avatar && user.avatar.startsWith('data:')) {
            const avatarDisplay = document.getElementById('userAvatarDisplay');
            if (avatarDisplay) {
                avatarDisplay.innerHTML = `<img src="${user.avatar}" style="width: 100%; height: 100%; border-radius: 8px; object-fit: cover;">`;
            }
        }
    }

    // Get category name
    getCategoryName(category) {
        const names = {
            'health': '🏥 Здоровье',
            'fitness': '🏋️ Фитнес',
            'career': '💼 Карьера',
            'tech': '⚙️ Технологии',
            'style': '👔 Стиль',
            'relations': '❤️ Отношения'
        };
        return names[category] || category;
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#4a9eff'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            font-size: 14px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global function
let forumManager;
function deletePost(postId) {
    if (forumManager) {
        forumManager.deletePost(postId);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    forumManager = new ForumPageManager();
});

// Styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(400px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(400px); }
    }
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }
    .modal.active {
        display: flex;
        animation: modalFadeIn 0.3s ease;
    }
    @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .modal__content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: modalSlideIn 0.3s ease;
    }
    .modal__content--large {
        max-width: 800px;
    }
    @keyframes modalSlideIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    .modal__close {
        float: right;
        font-size: 28px;
        font-weight: bold;
        color: #999;
        cursor: pointer;
        border: none;
        background: none;
        padding: 0;
        margin: -10px -10px 0 0;
    }
    .modal__close:hover {
        color: #333;
    }
    .form-group {
        margin-bottom: 20px;
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
    }
    .modal__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    .forum-post {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        transition: all 0.3s ease;
    }
    .forum-post:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #4a9eff;
    }
    .forum-post__title {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #2c2c2c;
    }
    .forum-post__category {
        display: inline-block;
        background: #4a9eff;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        margin-bottom: 12px;
    }
    .forum-post__author {
        color: #666;
        font-size: 13px;
        margin: 8px 0;
    }
    .forum-post__message {
        margin: 12px 0;
        color: #555;
        line-height: 1.6;
    }
    .forum-post__meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e0e0e0;
        font-size: 13px;
        color: #999;
    }
    .forum-post__actions {
        display: flex;
        gap: 15px;
        align-items: center;
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.forumManager = new ForumPageManager();
});
