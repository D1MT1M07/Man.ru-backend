/**
 * Index Page Script
 * Управляет функциональностью главной страницы
 */

class IndexPageManager {
    constructor() {
        this.articlesKey = 'man_ru_articles';
        this.defaultArticleIds = [1, 2, 3, 4, 5, 6]; // IDs of default articles
        this.usersKey = 'man_ru_users';
        this.postsKey = 'man_ru_forum_posts';
        this.init();
    }

    init() {
        this.renderUserArticles();
        this.setupArticleClickHandlers();
        this.setupFeaturedArticleClickHandler();
        this.updateSiteStats();
        this.renderTrendingArticles();
        
        // Обновляем статистику при загрузке страницы (с небольшой задержкой для гарантии)
        setTimeout(() => this.updateSiteStats(), 100);
        
        // Добавляем отслеживание изменений в хранилище (для синхронизации между вкладками)
        window.addEventListener('storage', () => {
            this.updateSiteStats();
            this.renderTrendingArticles();
        });
    }

    updateSiteStats() {
        try {
            // Получаем количество пользователей
            const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
            const usersCount = users.length;

            // Получаем количество статей
            const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
            const articlesCount = articles.length;

            // Получаем количество обсуждений (постов форума)
            const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
            const postsCount = posts.length;

            // Форматируем числа для красивого отображения
            const formatNumber = (num) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
                return num.toString();
            };

            // Обновляем значения в HTML
            const usersElement = document.getElementById('statsUsers');
            const articlesElement = document.getElementById('statsArticles');
            const discussionsElement = document.getElementById('statsDiscussions');

            if (usersElement) {
                usersElement.textContent = formatNumber(usersCount);
            }
            if (articlesElement) {
                articlesElement.textContent = formatNumber(articlesCount);
            }
            if (discussionsElement) {
                discussionsElement.textContent = formatNumber(postsCount);
            }
            
            // Логирование для отладки (только в разработке)
            console.log('📊 Статистика обновлена:', { 
                users: usersCount, 
                articles: articlesCount, 
                discussions: postsCount 
            });
        } catch (error) {
            console.error('❌ Ошибка при обновлении статистики:', error);
        }
    }

    renderUserArticles() {
        const grid = document.getElementById('indexArticlesGrid');
        if (!grid) return;

        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
        
        // Фильтруем только пользовательские статьи (исключаем default articles)
        const userArticles = articles.filter(a => !this.defaultArticleIds.includes(a.id));
        
        // Сортируем по дате (новые первыми)
        userArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (userArticles.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 20px; grid-column: 1 / -1;">Пока нет опубликованных статей. Будьте первым автором!</p>';
            return;
        }

        grid.innerHTML = userArticles.map(article => {
            // Get author avatar
            const author = users.find(u => u.email === article.authorEmail);
            const authorId = author ? author.id : null;
            const avatar = author ? author.avatar : '👤';
            let avatarHTML = avatar;
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 6px;">`;
            } else {
                avatarHTML = `<span style="font-size: 16px; margin-right: 4px;">${avatar}</span>`;
            }
            
            // Создаём кликабельный профиль автора
            const authorLink = authorId ? 
                `<a href="view-profile.html?id=${authorId}" onclick="event.stopPropagation();" style="margin-left: 10px; display: flex; align-items: center; cursor: pointer; color: #4a9eff; text-decoration: underline;">${avatarHTML} ${article.author}</a>` :
                `<span style="margin-left: 10px; display: flex; align-items: center;">${avatarHTML} ${article.author}</span>`;
            
            return `
            <article class="article-card" data-article-id="${article.id}">
                <div class="article-card__image" style="background: #${Math.floor(Math.random()*16777215).toString(16)};"></div>
                <div class="article-card__content">
                    <span class="article-card__category">${this.getCategoryName(article.category)}</span>
                    <h4 class="article-card__title">${article.title}</h4>
                    <p class="article-card__description">${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}</p>
                    <div class="article-card__meta">
                        <time>${article.date}</time>
                        ${authorLink}
                        <span style="margin-left: 10px;">👁️ ${article.views || 0}</span>
                    </div>
                </div>
            </article>
        `}).join('');

        // Переприслушиваем клики для новых статей
        this.setupArticleClickHandlers();
    }

    setupArticleClickHandlers() {
        const cards = document.querySelectorAll('.article-card');
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const articleId = card.getAttribute('data-article-id');
                const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
                const article = articles.find(a => a.id == articleId);
                
                if (article) {
                    this.openArticleModal(article);
                }
            });
        });
    }

    setupFeaturedArticleClickHandler() {
        const featured = document.querySelector('.featured-article');
        if (featured) {
            featured.style.cursor = 'pointer';
            featured.addEventListener('click', () => {
                const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
                if (articles.length > 0) {
                    this.openArticleModal(articles[0]);
                }
            });
        }
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
                    <span>👤 <span style="cursor: pointer; color: #4a9eff; text-decoration: underline;" onclick="window.indexManager.viewUserProfile('${article.author}')">${article.author}</span></span>
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
                        <button onclick="window.indexManager.submitComment(${article.id})" style="background: #3498db; color: white; border: none; padding: 10px 16px; margin-top: 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">Отправить</button>
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

        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #999; font-size: 12px;">Нет комментариев. Будьте первым!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(c => `
            <div class="comment-item">
                <strong>${c.author}</strong>
                <div style="color: #666; font-size: 13px; margin-top: 5px;">${c.text}</div>
                <div style="color: #999; font-size: 11px; margin-top: 5px;">${c.date}</div>
            </div>
        `).join('');
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

        const allComments = JSON.parse(localStorage.getItem('man_ru_article_comments')) || {};
        if (!allComments[articleId]) allComments[articleId] = [];

        allComments[articleId].push({
            author: author,
            text: text,
            date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem('man_ru_article_comments', JSON.stringify(allComments));
        input.value = '';
        this.loadArticleComments(articleId);

        // Показываем уведомление
        this.showNotification('✅ Комментарий добавлен!');
    }

    viewUserProfile(username) {
        const users = JSON.parse(localStorage.getItem('man_ru_users')) || [];
        const user = users.find(u => u.name === username);
        
        if (!user) {
            alert('Пользователь не найден');
            return;
        }
        
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        
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

    renderTrendingArticles() {
        const trendingList = document.querySelector('.trending-list');
        if (!trendingList) return;

        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        
        // Берём все статьи и сортируем по количеству просмотров (популярные первыми)
        const sortedByViews = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
        
        // Берём топ 5 статей
        const topArticles = sortedByViews.slice(0, 5);
        
        if (topArticles.length === 0) {
            trendingList.innerHTML = '<li style="padding: 10px; color: #999; text-align: center;">Нет статей</li>';
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
        document.querySelectorAll('.trending-item').forEach(item => {
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
    window.indexPageManager = new IndexPageManager();
    window.indexManager = window.indexPageManager; // For compatibility
});
