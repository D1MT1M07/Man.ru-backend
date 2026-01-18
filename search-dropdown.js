/**
 * Search Dropdown Component
 * Отображает результаты поиска (статьи и обсуждения) только с текущей страницы в выпадающем списке
 */

class SearchDropdown {
    constructor(searchInputSelector, searchBtnSelector) {
        this.searchInput = document.querySelector(searchInputSelector);
        this.searchBtn = document.querySelector(searchBtnSelector);
        this.currentCategory = document.body.getAttribute('data-category') || 'all';
        this.dropdown = null;
        this.debounceTimer = null;

        if (!this.searchInput || !this.searchBtn) {
            console.warn('Search input or button not found');
            return;
        }

        this.init();
    }

    init() {
        // Создаем dropdown элемент
        this.createDropdown();

        // Обработчики событий
        this.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        this.searchInput.addEventListener('focus', () => this.showDropdown());
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Закрытие dropdown при клике вне
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header__search')) {
                this.hideDropdown();
            }
        });
    }

    createDropdown() {
        const searchContainer = this.searchInput.parentElement;
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'search-dropdown';
        this.dropdown.style.display = 'none';
        searchContainer.appendChild(this.dropdown);
    }

    handleSearchInput(e) {
        const query = e.target.value.trim();

        // Очищаем старый таймер
        clearTimeout(this.debounceTimer);

        if (query.length < 2) {
            this.hideDropdown();
            return;
        }

        // Дебаунс поиска
        this.debounceTimer = setTimeout(() => {
            this.searchContent(query);
            this.showDropdown();
        }, 300);
    }

    searchContent(query) {
        const results = {
            articles: [],
            forumPosts: [],
            replies: []
        };

        // Получаем данные с текущей страницы
        const categoryData = this.getCategoryData();

        if (!categoryData) {
            this.renderResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Ищем в статьях
        if (categoryData.articles && Array.isArray(categoryData.articles)) {
            categoryData.articles.forEach(article => {
                if (
                    article.title.toLowerCase().includes(lowerQuery) ||
                    (article.description && article.description.toLowerCase().includes(lowerQuery))
                ) {
                    results.articles.push({
                        type: 'article',
                        title: article.title,
                        description: article.description,
                        link: `${this.currentCategory}.html#article-${article.id || Math.random()}`,
                        icon: '📄'
                    });
                }
            });
        }

        // Ищем в форум постах
        if (categoryData.forumPosts && Array.isArray(categoryData.forumPosts)) {
            categoryData.forumPosts.forEach(post => {
                if (
                    post.title.toLowerCase().includes(lowerQuery) ||
                    (post.message && post.message.toLowerCase().includes(lowerQuery))
                ) {
                    results.forumPosts.push({
                        type: 'forumPost',
                        title: post.title,
                        description: post.message ? post.message.substring(0, 100) + '...' : '',
                        link: `forum.html#post-${post.id || Math.random()}`,
                        icon: '💬'
                    });
                }
            });
        }

        // Ищем в ответах на форум
        if (categoryData.forumReplies && Array.isArray(categoryData.forumReplies)) {
            categoryData.forumReplies.forEach(reply => {
                if (reply.message && reply.message.toLowerCase().includes(lowerQuery)) {
                    results.replies.push({
                        type: 'forumReply',
                        title: `Ответ в теме "${reply.postTitle || 'Без названия'}"`,
                        description: reply.message.substring(0, 100) + '...',
                        link: `forum.html#reply-${reply.id || Math.random()}`,
                        icon: '↳'
                    });
                }
            });
        }

        // Объединяем результаты
        const allResults = [
            ...results.articles,
            ...results.forumPosts,
            ...results.replies
        ].slice(0, 8); // Максимум 8 результатов

        this.renderResults(allResults, query);
    }

    getCategoryData() {
        // Получаем данные с текущей страницы
        const category = this.currentCategory;

        if (category === 'forum') {
            return {
                forumPosts: this.getForumData(),
                forumReplies: this.getForumRepliesData()
            };
        } else {
            return {
                articles: this.getArticlesData()
            };
        }
    }

    getArticlesData() {
        // Пытаемся получить статьи с DOM или localStorage
        const articles = [];

        // Ищем статьи в DOM
        document.querySelectorAll('[data-article-id]').forEach(article => {
            articles.push({
                id: article.getAttribute('data-article-id'),
                title: article.querySelector('h3')?.textContent || 'Без названия',
                description: article.querySelector('p')?.textContent || ''
            });
        });

        // Если в DOM нет, пытаемся получить из localStorage
        if (articles.length === 0) {
            try {
                const stored = localStorage.getItem(`${this.currentCategory}_articles`);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Could not parse stored articles');
            }
        }

        return articles;
    }

    getForumData() {
        const posts = [];

        // Ищем посты в DOM
        document.querySelectorAll('[data-post-id]').forEach(post => {
            posts.push({
                id: post.getAttribute('data-post-id'),
                title: post.querySelector('h3')?.textContent || 'Без названия',
                message: post.querySelector('.forum-post__message')?.textContent || ''
            });
        });

        // Если в DOM нет, пытаемся получить из localStorage
        if (posts.length === 0) {
            try {
                const stored = localStorage.getItem('forum_posts');
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Could not parse stored forum posts');
            }
        }

        return posts;
    }

    getForumRepliesData() {
        const replies = [];

        document.querySelectorAll('[data-reply-id]').forEach(reply => {
            replies.push({
                id: reply.getAttribute('data-reply-id'),
                postTitle: reply.getAttribute('data-post-title') || 'Без названия',
                message: reply.querySelector('.forum-reply__message')?.textContent || ''
            });
        });

        return replies;
    }

    renderResults(results, query = '') {
        this.dropdown.innerHTML = '';

        if (results.length === 0) {
            this.dropdown.innerHTML = `
                <div class="search-dropdown__empty">
                    ${query ? `Результатов для "${query}" не найдено` : 'Начните печатать для поиска...'}
                </div>
            `;
            return;
        }

        const list = document.createElement('ul');
        list.className = 'search-dropdown__list';

        results.forEach(result => {
            const li = document.createElement('li');
            li.className = 'search-dropdown__item';
            li.innerHTML = `
                <a href="${result.link}" class="search-dropdown__link">
                    <span class="search-dropdown__icon">${result.icon}</span>
                    <div class="search-dropdown__content">
                        <div class="search-dropdown__title">${this.highlightQuery(result.title, query)}</div>
                        ${result.description ? `<div class="search-dropdown__description">${this.highlightQuery(result.description, query)}</div>` : ''}
                    </div>
                </a>
            `;
            list.appendChild(li);
        });

        this.dropdown.appendChild(list);
    }

    highlightQuery(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (query.length > 0) {
            this.searchContent(query);
            this.showDropdown();
        }
    }

    showDropdown() {
        if (this.dropdown && this.dropdown.innerHTML) {
            this.dropdown.style.display = 'block';
        }
    }

    hideDropdown() {
        if (this.dropdown) {
            this.dropdown.style.display = 'none';
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new SearchDropdown('.header__search-input', '.header__search-btn');
});
