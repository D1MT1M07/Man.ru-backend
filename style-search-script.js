/**
 * Style Page Search Script
 * Поиск только по статьям категории "Стиль"
 */

class StyleSearchManager {
    constructor() {
        this.articlesKey = 'man_ru_articles';
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

        const existingContainer = document.getElementById('searchResults');
        if (existingContainer) {
            existingContainer.remove();
        }

        this.searchResultsContainer = document.createElement('div');
        this.searchResultsContainer.id = 'searchResults';
        this.searchResultsContainer.className = 'search-results-dropdown';
        
        const searchContainer = searchInput.parentElement;
        searchContainer.appendChild(this.searchResultsContainer);

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

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                this.searchResultsContainer.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchResultsContainer.classList.remove('active');
                searchInput.value = '';
            }
        });
    }

    performSearch(query) {
        const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
        const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];

        const queryLower = query.toLowerCase();
        
        const foundArticles = articles.filter(article => 
            article.category === 'style' && (
                article.title.toLowerCase().includes(queryLower) ||
                article.description.toLowerCase().includes(queryLower)
            )
        ).slice(0, 6);

        if (foundArticles.length === 0) {
            this.searchResultsContainer.innerHTML = `
                <div style="padding: 15px; color: #999; text-align: center;">
                    Статей не найдено
                </div>
            `;
            return;
        }

        this.searchResultsContainer.innerHTML = foundArticles.map(article => {
            const user = users.find(u => u.email === article.authorEmail);
            const avatar = user ? user.avatar : '👤';
            let avatarHTML = avatar;
            
            if (avatar && avatar.startsWith('data:')) {
                avatarHTML = `<img src="${avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; display: inline-block; margin-right: 8px;">`;
            } else {
                avatarHTML = `<span style="font-size: 18px; margin-right: 8px; display: inline-block;">${avatar}</span>`;
            }

            const authorName = article.author || 'Аноним';
            const description = article.description.substring(0, 50) + '...';

            return `
                <div class="search-result-item" data-type="article" data-article-id="${article.id}" style="padding: 12px 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="font-size: 20px; min-width: 24px;">👔</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${article.title}</div>
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

        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const articleId = item.getAttribute('data-article-id');
                const articles = JSON.parse(localStorage.getItem(this.articlesKey)) || [];
                const article = articles.find(a => a.id == articleId);
                
                if (article && window.categoryManager) {
                    window.categoryManager.openArticleModal(article);
                }
                
                const searchInput = document.querySelector('.header__search-input');
                this.searchResultsContainer.classList.remove('active');
                searchInput.value = '';
            });
        });

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

document.addEventListener('DOMContentLoaded', () => {
    if (window.searchManager) {
        delete window.searchManager;
    }
    window.styleSearchManager = new StyleSearchManager();
});
