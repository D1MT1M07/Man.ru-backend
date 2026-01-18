/**
 * Forum Page Search Script
 * Поиск только по постам форума
 */

class ForumSearchManager {
    constructor() {
        this.postsKey = 'man_ru_forum_posts';
        this.usersKey = 'man_ru_users';
        this.searchResultsContainer = null;
        this.init();
    }

    init() {
        this.setupSearchInput();
    }

    setupSearchInput() {
        const searchInput = document.querySelector('.header__search-input');
        if (!searchInput) return;

        // Удаляем существующий контейнер если он есть
        const existingContainer = document.getElementById('searchResults');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Создаём новый контейнер для результатов
        this.searchResultsContainer = document.createElement('div');
        this.searchResultsContainer.id = 'searchResults';
        this.searchResultsContainer.className = 'search-results-dropdown';
        
        // Вставляем контейнер рядом с поиском
        const searchContainer = searchInput.parentElement;
        searchContainer.appendChild(this.searchResultsContainer);

        // Обработчик ввода
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                this.searchResultsContainer.classList.remove('active');
                return;
            }

            if (query.length < 2) {
                this.searchResultsContainer.classList.remove('active');
                return;
            }

            this.performSearch(query);
            this.searchResultsContainer.classList.add('active');
        });

        // Закрываем результаты при клике снаружи
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                this.searchResultsContainer.classList.remove('active');
            }
        });

        // Закрываем результаты при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchResultsContainer.classList.remove('active');
                searchInput.value = '';
            }
        });
    }

    performSearch(query) {
        const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];

        const queryLower = query.toLowerCase();
        
        // Ищем только в постах форума
        const foundPosts = posts.filter(post => 
            post.title.toLowerCase().includes(queryLower) ||
            post.message.toLowerCase().includes(queryLower)
        ).slice(0, 6);

        // Отображаем результаты
        if (foundPosts.length === 0) {
            this.searchResultsContainer.innerHTML = `
                <div style="padding: 15px; color: #999; text-align: center;">
                    Тем не найдено
                </div>
            `;
            return;
        }

        this.searchResultsContainer.innerHTML = foundPosts.map(post => {
            const user = users.find(u => u.email === post.authorEmail);
            const avatar = user ? user.avatar : '👤';
            let avatarHTML = avatar;
            
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 8px;">`;
            } else {
                avatarHTML = `<span style="font-size: 18px; margin-right: 8px; display: inline-block;">${avatar}</span>`;
            }

            const authorName = post.author || 'Аноним';
            const description = post.message.substring(0, 50) + '...';
            const itemId = `post-${post.id}`;

            return `
                <div class="search-result-item" data-id="${itemId}" data-type="post" data-article-id="${post.id}" style="padding: 12px 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="font-size: 20px; min-width: 24px;">💬</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${post.title}</div>
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
                const postId = item.getAttribute('data-article-id');
                const posts = JSON.parse(localStorage.getItem(this.postsKey)) || [];
                const post = posts.find(p => p.id == postId);
                
                if (post && window.forumManager) {
                    window.forumManager.openForumPostModal(post);
                }
                
                // Закрываем результаты и очищаем поле
                const searchInput = document.querySelector('.header__search-input');
                this.searchResultsContainer.classList.remove('active');
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
}

// Инициализируем поиск когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    // Убеждаемся, что глобальный searchManager не инициализируется
    if (window.searchManager) {
        delete window.searchManager;
    }
    window.forumSearchManager = new ForumSearchManager();
});
