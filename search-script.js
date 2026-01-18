/**
 * Search Script
 * Поиск по статьям и обсуждениям на всех страницах
 */

class SearchManager {
    constructor() {
        this.articlesKey = 'man_ru_articles';
        this.postsKey = 'man_ru_forum_posts';
        this.usersKey = 'man_ru_users';
        this.init();
    }

    init() {
        this.setupSearchInput();
    }

    setupSearchInput() {
        const searchInput = document.querySelector('.header__search-input');
        if (!searchInput) return;

        // Создаём контейнер для результатов
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.id = 'searchResults';
        searchResultsContainer.className = 'search-results-dropdown';
        
        // Вставляем контейнер рядом с поиском
        const searchContainer = searchInput.parentElement;
        searchContainer.appendChild(searchResultsContainer);

        // Обработчик ввода
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                searchResultsContainer.classList.remove('active');
                return;
            }

            if (query.length < 2) {
                searchResultsContainer.classList.remove('active');
                return;
            }

            this.performSearch(query, searchResultsContainer);
            searchResultsContainer.classList.add('active');
        });

        // Закрываем результаты при клике снаружи
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResultsContainer.classList.remove('active');
            }
        });

        // Закрываем результаты при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResultsContainer.classList.remove('active');
                searchInput.value = '';
            }
        });
    }

    performSearch(query, container) {
        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];

        const queryLower = query.toLowerCase();
        
        // Ищем в статьях
        const foundArticles = articles.filter(article => 
            article.title.toLowerCase().includes(queryLower) ||
            article.description.toLowerCase().includes(queryLower)
        ).slice(0, 3);

        // Ищем в постах форума
        const foundPosts = posts.filter(post => 
            post.title.toLowerCase().includes(queryLower) ||
            post.message.toLowerCase().includes(queryLower)
        ).slice(0, 3);

        // Объединяем результаты
        const results = [
            ...foundArticles.map(a => ({ ...a, type: 'article' })),
            ...foundPosts.map(p => ({ ...p, type: 'post' }))
        ].slice(0, 6);

        // Отображаем результаты
        if (results.length === 0) {
            container.innerHTML = `
                <div style="padding: 15px; color: #999; text-align: center;">
                    Ничего не найдено
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(item => {
            const user = users.find(u => u.email === item.authorEmail);
            const avatar = user ? user.avatar : '👤';
            let avatarHTML = avatar;
            
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 8px;">`;
            } else {
                avatarHTML = `<span style="font-size: 18px; margin-right: 8px; display: inline-block;">${avatar}</span>`;
            }

            const title = item.type === 'article' ? item.title : item.title;
            const category = item.type === 'article' ? item.category : item.category;
            const categoryEmoji = item.type === 'article' ? this.getCategoryEmoji(category) : '💬';
            const authorName = item.author || 'Аноним';
            const description = item.type === 'article' ? 
                item.description.substring(0, 50) + '...' : 
                item.message.substring(0, 50) + '...';

            const itemId = item.type === 'article' ? `article-${item.id}` : `post-${item.id}`;

            return `
                <div class="search-result-item" data-id="${itemId}" data-type="${item.type}" data-article-id="${item.id}" style="padding: 12px 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; hover: background #f5f5f5;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="font-size: 20px; min-width: 24px;">${categoryEmoji}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</div>
                            <div style="font-size: 12px; color: #999; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${description}</div>
                            <div style="font-size: 11px; color: #999; margin-top: 4px; display: flex; align-items: center;">
                                ${avatarHTML}
                                <span>${authorName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Добавляем обработчики кликов
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const type = item.getAttribute('data-type');
                const articleId = item.getAttribute('data-article-id');
                
                if (type === 'article') {
                    const article = articles.find(a => a.id == articleId);
                    if (article) {
                        this.openArticle(article);
                    }
                } else if (type === 'post') {
                    const post = posts.find(p => p.id == articleId);
                    if (post) {
                        this.openPost(post);
                    }
                }
                
                // Закрываем результаты и очищаем поле
                const searchInput = document.querySelector('.header__search-input');
                const container = document.getElementById('searchResults');
                container.classList.remove('active');
                searchInput.value = '';
            });
        });

        // При наведении меняем фон
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f5f5f5';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'white';
            });
        });
    }

    getCategoryEmoji(category) {
        const emojis = {
            'health': '❤️',
            'fitness': '💪',
            'career': '💼',
            'tech': '⚡',
            'style': '👔',
            'relations': '💑'
        };
        return emojis[category] || '📝';
    }

    openArticle(article) {
        // Определяем какой скрипт управляет статьями на текущей странице
        if (window.categoryManager) {
            window.categoryManager.openArticleModal(article);
        } else if (window.indexPageManager) {
            window.indexPageManager.openArticleModal(article);
        } else {
            // Если нет менеджера, открываем в новой вкладке
            const url = `${article.category}.html`;
            window.open(url, '_blank');
        }
    }

    openPost(post) {
        // Если мы на странице форума, открываем пост
        if (window.forumManager) {
            window.forumManager.openForumPostModal(post);
        } else {
            // Иначе открываем форум
            window.open('forum.html', '_blank');
        }
    }
}

// Инициализируем поиск когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});
