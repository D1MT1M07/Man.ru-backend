/**
 * Category Page Script
 * Управляет статьями на страницах категорий
 */

class CategoryPageManager {
    constructor() {
        this.category = document.body.dataset.category || 'health';
        this.articlesKey = 'man_ru_articles';
        this.init();
    }

    init() {
        this.setupModalHandlers();
        this.setupMenuToggle();
        this.setupNewsletter();
        this.renderArticles();
        this.renderCategoryTrends();
        this.setupArticleClickHandlers();
    }

    // MODAL HANDLERS
    setupModalHandlers() {
        const modal = document.getElementById('addArticleModal');
        if (!modal) return;

        const btn = document.getElementById('addArticleBtn');
        const closeBtn = document.getElementById('closeModalBtn');
        const form = document.getElementById('articleForm');
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
                this.addArticle();
            });
        }
    }

    // ADD ARTICLE
    addArticle() {
        const title = document.getElementById('articleTitle').value.trim();
        const description = document.getElementById('articleDescription').value.trim();
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('man_ru_current_user'));
        const author = currentUser ? currentUser.name : (document.getElementById('articleAuthor')?.value || 'Аноним');

        if (!title) {
            this.showNotification('❌ Пожалуйста, введите заголовок статьи', 'error');
            return;
        }

        if (!description) {
            this.showNotification('❌ Пожалуйста, введите описание статьи', 'error');
            return;
        }

        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        
        const newArticle = {
            id: Date.now(),
            title: title,
            description: description,
            content: description,
            author: author,
            authorEmail: currentUser ? currentUser.email : 'anonymous',
            authorId: currentUser ? currentUser.id : null,
            category: this.category,
            date: new Date().toLocaleString('ru-RU'),
            views: 0
        };

        articles.push(newArticle);
        localStorage.setItem(this.articlesKey, JSON.stringify(articles));

        const modal = document.getElementById('addArticleModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        document.getElementById('articleForm').reset();
        this.showNotification('✅ Статья успешно добавлена!');
        this.renderArticles();
        this.renderCategoryTrends();
        
        // Обновляем статистику на главной странице
        if (window.indexPageManager) {
            window.indexPageManager.updateSiteStats();
            window.indexPageManager.renderTrendingArticles();
        }
    }

    // RENDER ARTICLES
    renderArticles() {
        const container = document.getElementById('articlesGrid');
        if (!container) return;

        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
        const filtered = articles.filter(a => a.category === this.category);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <p style="font-size: 48px; margin-bottom: 10px;">📝</p>
                    <p style="color: #999; font-size: 16px;">Статей пока нет</p>
                    <p style="color: #ccc; font-size: 14px;">Будьте первым, кто опубликует статью в этой категории!</p>
                </div>
            `;
            return;
        }

        // Get all comments from localStorage
        const allComments = JSON.parse(localStorage.getItem('man_ru_article_comments')) || {};

        container.innerHTML = filtered.map(article => {
            // Get dynamic comment count
            const commentCount = (allComments[article.id] || []).length;
            
            // Get author avatar and ID
            const author = users.find(u => u.email === article.authorEmail);
            const authorId = author ? author.id : '';
            const avatar = author ? author.avatar : '👤';
            let avatarHTML = avatar;
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 6px;">`;
            } else {
                avatarHTML = `<span style="font-size: 16px; margin-right: 4px;">${avatar}</span>`;
            }
            
            const authorLink = authorId ? 
                `<span style="display: flex; align-items: center;"><a href="view-profile.html?id=${authorId}" style="cursor: pointer; color: #4a9eff; text-decoration: underline; display: flex; align-items: center; gap: 4px;">${avatarHTML} ${article.author}</a></span>` :
                `<span style="display: flex; align-items: center;">${avatarHTML} ${article.author}</span>`;
            
            return `
            <article class="article-card" data-article-id="${article.id}">
                <div class="article-card__image"></div>
                <div class="article-card__content">
                    <span class="article-card__category">${this.getCategoryName(this.category)}</span>
                    <h3 class="article-card__title">${article.title}</h3>
                    <p class="article-card__description">${article.description}</p>
                    <div class="article-card__meta">
                        <time>${article.date}</time>
                        ${authorLink}
                        <span>👁️ ${article.views}</span>
                        <span>💬 ${commentCount} комментариев</span>
                    </div>
                </div>
            </article>
        `
        }).join('');

        // Добавляем обработчики кликов
        this.attachArticleClickHandlers();
    }

    attachArticleClickHandlers() {
        const cards = document.querySelectorAll('.article-card');
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                const articleId = card.getAttribute('data-article-id');
                const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
                const article = articles.find(a => a.id == articleId);
                
                if (article) {
                    this.openArticleModal(article);
                }
            });
        });
    }

    openArticleModal(article) {
        // Увеличиваем количество просмотров
        this.incrementArticleViews(article.id);
        
        const modalId = 'article-modal-' + article.id;
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        
        // Получаем обновлённую статью с новым количеством просмотров
        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        const updatedArticle = articles.find(a => a.id == article.id);
        const views = updatedArticle ? updatedArticle.views : (article.views || 0);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${article.title}</h2>
                    <span class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</span>
                </div>
                <div class="modal-meta">
                    <span>📝 ${this.getCategoryName(article.category)}</span>
                    <span>👤 <span style="cursor: pointer; color: #4a9eff; text-decoration: underline;" onclick="window.categoryManager.viewUserProfile('${article.author}')">${article.author}</span></span>
                    <span>📅 ${article.date}</span>
                    <span>👁️ ${views} просмотров</span>
                </div>
                <div class="modal-body">
                    <p>${article.content || article.description}</p>
                </div>
                <div class="modal-comments">
                    <h3 style="margin-bottom: 15px; font-size: 16px;">💬 Комментарии</h3>
                    <div class="comments-list" id="comments-${article.id}">
                        <p style="color: #999; font-size: 12px;">Загрузка комментариев...</p>
                    </div>
                    <div class="comment-form">
                        <textarea id="comment-input-${article.id}" placeholder="Напишите комментарий (5-500 символов)..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; font-size: 13px; resize: vertical; min-height: 80px;"></textarea>
                        <button onclick="window.categoryManager.submitComment(${article.id})" style="background: #3498db; color: white; border: none; padding: 10px 16px; margin-top: 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">Отправить</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadArticleComments(article.id);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    incrementArticleViews(articleId) {
        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        const article = articles.find(a => a.id == articleId);
        
        if (article) {
            article.views = (article.views || 0) + 1;
            localStorage.setItem(this.articlesKey, JSON.stringify(articles));
        }
    }

    loadArticleComments(articleId) {
        const commentsList = document.getElementById(`comments-${articleId}`);
        if (!commentsList) return;

        const allComments = JSON.parse(localStorage.getItem('man_ru_article_comments')) || {};
        const comments = allComments[articleId] || [];
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];

        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #999; font-size: 12px;">Нет комментариев. Будьте первым!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(c => {
            // Get author avatar
            const author = users.find(u => u.email === c.authorEmail);
            const avatar = author ? author.avatar : '👤';
            let avatarHTML = avatar;
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 16px; height: 16px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 4px;">`;
            } else {
                avatarHTML = `<span style="font-size: 14px; margin-right: 2px;">${avatar}</span>`;
            }
            
            return `
            <div class="comment-item">
                <strong style="display: flex; align-items: center;">${avatarHTML} ${c.author}</strong>
                <div style="color: #666; font-size: 13px; margin-top: 5px;">${c.text}</div>
                <div style="color: #999; font-size: 11px; margin-top: 5px;">${c.date}</div>
            </div>
        `}).join('');
    }

    submitComment(articleId) {
        const input = document.getElementById(`comment-input-${articleId}`);
        if (!input || !input.value.trim()) {
            alert('Напишите комментарий!');
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

        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('man_ru_current_user'));
        const author = currentUser ? currentUser.name : 'Аноним';
        const authorEmail = currentUser ? currentUser.email : 'anonymous';

        const allComments = JSON.parse(localStorage.getItem('man_ru_article_comments')) || {};
        if (!allComments[articleId]) allComments[articleId] = [];

        allComments[articleId].push({
            author: author,
            authorEmail: authorEmail,
            text: text,
            date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem('man_ru_article_comments', JSON.stringify(allComments));
        input.value = '';
        this.loadArticleComments(articleId);

        // Показываем уведомление
        this.showNotification('✅ Комментарий добавлен!');
    }

    setupArticleClickHandlers() {
        // Этот метод вызывается из renderArticles
    }

    // MENU TOGGLE
    setupMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const navigation = document.getElementById('navigation');

        if (menuToggle && navigation) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navigation.classList.toggle('active');
            });

            const navLinks = navigation.querySelectorAll('.navigation__link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.classList.remove('active');
                    navigation.classList.remove('active');
                });
            });
        }
    }

    // NEWSLETTER
    setupNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('✅ Спасибо за подписку!');
            form.reset();
        });
    }

    viewUserProfile(username) {
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
        const user = users.find(u => u.name === username);
        
        if (!user) {
            alert('Пользователь не найден');
            return;
        }
        
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
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

    // CATEGORY NAME
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

    // NOTIFICATIONS
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

    renderCategoryTrends() {
        const trendingList = document.querySelector('.trending-list');
        if (!trendingList) return;

        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        
        // Фильтруем только статьи из этой категории
        const categoryArticles = articles.filter(a => a.category === this.category);
        
        // Сортируем по количеству просмотров (популярные первыми)
        const sortedByViews = [...categoryArticles].sort((a, b) => (b.views || 0) - (a.views || 0));
        
        // Берём топ 5 статей
        const topArticles = sortedByViews.slice(0, 5);
        
        if (topArticles.length === 0) {
            trendingList.innerHTML = '<li style="padding: 10px; color: #999; text-align: center;">Нет статей в этой категории</li>';
            return;
        }

        // Отображаем каждую статью как элемент тренда
        trendingList.innerHTML = topArticles.map((article, index) => {
            return `
                <li class="trending-item" style="cursor: pointer;" data-article-id="${article.id}">
                    <span class="trending-item__number">${index + 1}</span>
                    <a href="#" class="trending-item__link">${article.title} <span style="font-size: 11px; color: #999;">(👁️ ${article.views || 0})</span></a>
                </li>
            `;
        }).join('');

        // Добавляем обработчики кликов для всех элементов трендов
        document.querySelectorAll('.trending-list .trending-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const articleId = item.getAttribute('data-article-id');
                const article = articles.find(a => a.id == articleId);
                if (article) {
                    this.openArticleModal(article);
                }
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.categoryManager = new CategoryPageManager();
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
`;
document.head.appendChild(style);
