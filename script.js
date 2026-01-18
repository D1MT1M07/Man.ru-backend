/**
 * man.ru - Advanced Interactive Portal
 * Управление статьями, форумом, фильтрацией и хранилищем
 */

// ============================================
// СИСТЕМА УПРАВЛЕНИЯ ДАННЫМИ (localStorage)
// ============================================

class DataManager {
    constructor() {
        this.articlesKey = 'man_ru_articles';
        this.forumPostsKey = 'man_ru_forum_posts';
        this.initializeData();
    }

    initializeData() {
        // Инициализация пользователей по умолчанию
        if (!localStorage.getItem('man_ru_users')) {
            const defaultUsers = [
                {
                    id: '1',
                    name: 'Игорь',
                    email: 'igor@example.com',
                    password: 'password123',
                    avatar: '👤',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '2',
                    name: 'Виктор',
                    email: 'viktor@example.com',
                    password: 'password123',
                    avatar: '💪',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '3',
                    name: 'Павел',
                    email: 'pavel@example.com',
                    password: 'password123',
                    avatar: '👨',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '4',
                    name: 'Максим',
                    email: 'maxim@example.com',
                    password: 'password123',
                    avatar: '😊',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '5',
                    name: 'Андрей',
                    email: 'andrey@example.com',
                    password: 'password123',
                    avatar: '🎯',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '6',
                    name: 'Антон',
                    email: 'anton@example.com',
                    password: 'password123',
                    avatar: '⚡',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '7',
                    name: 'Денис',
                    email: 'denis@example.com',
                    password: 'password123',
                    avatar: '🚀',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                },
                {
                    id: '8',
                    name: 'Юрий',
                    email: 'yuri@example.com',
                    password: 'password123',
                    avatar: '🏆',
                    registrationDate: new Date().toLocaleDateString('ru-RU'),
                    articles: [],
                    forumPosts: []
                }
            ];
            localStorage.setItem('man_ru_users', JSON.stringify(defaultUsers));
        }
        
        // Инициализация статей по умолчанию
        if (!localStorage.getItem(this.articlesKey)) {
            const defaultArticles = [
                {
                    id: 1,
                    title: 'Сын связался с неправильной компанией. Как вернуть его на правильный путь?',
                    category: 'relations',
                    description: 'Моему сыну 16 лет. Недавно узнал, что он ходит с ребятами, которые употребляют. Не знаю, как с ним говорить, боюсь еще больше отдалить...',
                    author: 'Игорь',
                    authorEmail: 'igor@example.com',
                    date: '14 января',
                    views: '2.4K',
                    content: 'У меня сын, ему 16 лет. Буквально месяц назад начал ходить с компанией, которая мне вообще не нравится. Несколько раз слышал запах табака, недавно узнал о наркотиках. Сын закрывается, не хочет общаться. Чего я боюсь больше всего - это сделать еще хуже своей строгостью. Как вообще разговаривать с подростком в такой ситуации? Муж говорит, что нужно дать ему свободу, но мне кажется это неправильно...'
                },
                {
                    id: 2,
                    title: 'Жена требует развод, потому что я слишком работаю. Как найти баланс?',
                    category: 'relations',
                    description: 'Зарабатываю хорошо, но жена говорит, что теряет смысл в браке. Устал выбирать между семьей и карьерой...',
                    author: 'Виктор',
                    authorEmail: 'viktor@example.com',
                    date: '13 января',
                    views: '1.8K',
                    content: 'Работаю в крупной компании, у меня хорошая зарплата. Но жена уже полгода говорит, что я ее игнорирую. Я ему даю деньги на все, что нужно, но ей нужно время и внимание. Вчера сказала, что подумывает о разводе. Я люблю свою работу, люблю свою семью, но не могу быть везде одновременно. Может, я что-то не понимаю? Как другие мужчины решают эту проблему?'
                },
                {
                    id: 3,
                    title: 'Развод и дети - как правильно все сделать?',
                    category: 'relations',
                    description: 'Три года брака, двое детей. Решили с женой что-то не получается и нужно расставаться. Но как это сделать без вреда детям?',
                    author: 'Павел',
                    authorEmail: 'pavel@example.com',
                    date: '12 января',
                    views: '3.2K',
                    content: 'С женой мы не сходимся по характеру, частые скандалы. Трое лет брака, двое детей (5 и 8 лет). Оба понимаем, что дальше так не может быть, но боимся, что развод испортит детям жизнь. Как вообще рассказать им? Какой минимум нужно сделать, чтобы они не чувствовали себя виноватыми? Кто-нибудь проходил через это?'
                },
                {
                    id: 4,
                    title: 'Парень моего сына. Как понять, что происходит?',
                    category: 'relations',
                    description: 'Сын 17 лет сказал, что у него есть парень. Сказал это нормально, как про дружбу. Я в шоке. Как мне к этому относиться?',
                    author: 'Максим',
                    authorEmail: 'maxim@example.com',
                    date: '11 января',
                    views: '2.1K',
                    content: 'Мой сын в 17 лет сказал мне и жене, что у него есть парень. Сказал спокойно, как про обычную дружбу. Я честно не знаю, как реагировать. Я его люблю независимо от всего, но... я растерян. Жена поддерживает его, говорит, что это нормально. Я тоже хочу быть нормальным отцом, но голова пока не переваривает всю информацию. Может, кто-нибудь пройти через подобное?'
                },
                {
                    id: 5,
                    title: 'Переезд после развода - как найти силы начать заново?',
                    category: 'health',
                    description: 'Развелся, потеряется квартира. Начинаю с нуля в 45 лет. Как найти мотивацию и не впасть в депрессию?',
                    author: 'Андрей',
                    authorEmail: 'andrey@example.com',
                    date: '10 января',
                    views: '4.5K',
                    content: 'Развелся два месяца назад после 20 лет брака. Квартира отошла жене, я переехал в квартиру поменьше. Иногда приходит ощущение, что вся жизнь прошла зря. Мне 45, я в порядке физически, но морально... очень тяжело. Ловлю себя на том, что даже работа не приносит удовольствие. Как другие мужчины выходят из такого кризиса? Может нужен психолог?'
                },
                {
                    id: 6,
                    title: 'Заикание у сына. Как помочь ему в школе?',
                    category: 'health',
                    description: 'Сын 9 лет начал заикаться полгода назад. Психолог говорит, это на нервной почве. В школе начинает смеяться над ним...',
                    author: 'Антон',
                    authorEmail: 'anton@example.com',
                    date: '9 января',
                    views: '3.9K',
                    content: 'Мой сын в третьем классе начал заикаться примерно полгода назад. Мы водили его к логопеду, к психологу. Психолог говорит, что это нервное. Но в школе дети начали над ним смеяться. Мой сын теперь боится отвечать на уроках, замыкается. Я чувствую себя беспомощным отцом. Как мне помочь ему справиться с этим?'
                },
                {
                    id: 7,
                    title: '10 лучших упражнений для дома',
                    category: 'fitness',
                    description: 'Не нужно ходить в тренажерный зал. Вот мои 10 любимых упражнений для дома которые реально работают...',
                    author: 'Максим',
                    authorEmail: 'maxim@example.com',
                    date: '8 января',
                    views: '5.2K',
                    content: 'Много лет занимаюсь в зале, но переехал в городскую квартиру. Начал заниматься дома и понял, что результаты даже лучше. Вот мои 10 упражнений которые я делаю каждый день: приседания, отжимания, планка, выпады, отжимания на брусьях...'
                },
                {
                    id: 8,
                    title: 'Как избежать травм при тренировках?',
                    category: 'fitness',
                    description: 'Получил травму спины на тренировке. Теперь очень боюсь возвращаться к занятиям. Как правильно тренироваться чтобы не навредить здоровью?',
                    author: 'Андрей',
                    authorEmail: 'andrey@example.com',
                    date: '7 января',
                    views: '3.1K',
                    content: 'Я молодой парень, 28 лет, занимаюсь уже 5 лет. Месяц назад поднял тяжелый вес с неправильной техникой и потянул спину. Было больно около недели. Теперь я боюсь возвращаться. Как правильно восстанавливаться? Какие упражнения безопасны?'
                },
                {
                    id: 9,
                    title: 'Как подготовиться к собеседованию в крупной компании?',
                    category: 'career',
                    description: 'Пригласили на собеседование в мечтную компанию. Как правильно подготовиться и не провалить интервью?',
                    author: 'Павел',
                    authorEmail: 'pavel@example.com',
                    date: '6 января',
                    views: '4.0K',
                    content: 'Вот уже месяц ищу новую работу. Наконец приглашение на собеседование в компанию, где я всегда хотел работать. Но я нервничаю. Как мне подготовиться? Что они могут спросить? Как выглядеть уверенно?'
                },
                {
                    id: 10,
                    title: 'Повышение по карьере - как просить зарплату?',
                    category: 'career',
                    description: 'Работаю 3 года на текущей должности. Пора просить повышение или новую должность. Как правильно это сделать?',
                    author: 'Денис',
                    authorEmail: 'denis@example.com',
                    date: '5 января',
                    views: '3.7K',
                    content: 'Я 3 года на должности веб-разработчика. Делаю свою работу хорошо, но зарплата не меняется. Мои коллеги уходят в другие компании и зарабатывают больше. Как мне правильно попросить повышение?'
                },
                {
                    id: 11,
                    title: 'Лучшие смартфоны 2026 года - какой выбрать?',
                    category: 'tech',
                    description: 'Хочу обновить телефон. Какие модели рекомендуете? Что выбрать между флагманами?',
                    author: 'Антон',
                    authorEmail: 'anton@example.com',
                    date: '4 января',
                    views: '6.1K',
                    content: 'Телефон старый, пора обновляться. Смотрю новые модели 2026 года. Очень много вариантов. Кто-нибудь может дать рекомендацию? Нужен хороший смартфон, желательно с хорошей камерой.'
                },
                {
                    id: 12,
                    title: 'Выбираем ноутбук для работы и учебы',
                    category: 'tech',
                    description: 'Нужен ноутбук для программирования. Что лучше выбрать: Mac, Windows или Linux?',
                    author: 'Игорь',
                    authorEmail: 'igor@example.com',
                    date: '3 января',
                    views: '2.9K',
                    content: 'Заканчиваю курсы программирования и нужен ноутбук. У меня бюджет примерно 1000 долларов. Что мне выбрать? Слышал что на Mac лучше программировать, но Windows тоже хороший.'
                },
                {
                    id: 13,
                    title: 'Мужской гардероб: базовые вещи которые должны быть',
                    category: 'style',
                    description: 'Хочу обновить гардероб. Какие базовые вещи должны быть у каждого мужчины?',
                    author: 'Денис',
                    authorEmail: 'denis@example.com',
                    date: '2 января',
                    views: '4.3K',
                    content: 'Мне 30 лет и я понял что мой гардероб хаотичен. Есть кучу вещей но ничего не подходит. Какие базовые вещи должны быть у каждого мужчины? С чего начать?'
                },
                {
                    id: 14,
                    title: 'Как выбрать правильный размер одежды?',
                    category: 'style',
                    description: 'Часто покупаю в интернете и вещи не подходят по размеру. Как правильно измерить себя и выбрать размер?',
                    author: 'Юрий',
                    authorEmail: 'yuri@example.com',
                    date: '1 января',
                    views: '2.5K',
                    content: 'Покупаю часто одежду в интернете и часто неправильно подбираю размер. То маловато, то великовато. Как мне правильно измерить себя? Какие мерки нужны?'
                }
            ];
            localStorage.setItem(this.articlesKey, JSON.stringify(defaultArticles));
        }

        // Инициализация форум-постов по умолчанию
        if (!localStorage.getItem(this.forumPostsKey)) {
            const defaultPosts = [
                {
                    id: 1,
                    title: 'Как избежать выгорания на работе?',
                    category: 'career',
                    message: 'Работаю уже 8 лет в одной компании. Последние два года чувствую, что теряю интерес к работе. Каждый день как под гору. Как вам удается оставаться мотивированным? Может нужно менять работу?',
                    author: 'Игорь',
                    authorEmail: 'igor@example.com',
                    date: new Date().toLocaleString('ru-RU'),
                    views: 0,
                    comments: 73
                },
                {
                    id: 2,
                    title: 'Лучшие домашние тренировки без оборудования',
                    category: 'fitness',
                    message: 'Какие упражнения наиболее эффективны для дома? Поделитесь комплексом.',
                    author: 'Виктор',
                    authorEmail: 'viktor@example.com',
                    date: new Date().toLocaleString('ru-RU'),
                    views: 0,
                    comments: 156
                },
                {
                    id: 3,
                    title: 'Советы по выбору спутника жизни',
                    category: 'relations',
                    message: 'На что обратить внимание при поиске серьёзных отношений?',
                    author: 'Павел',
                    authorEmail: 'pavel@example.com',
                    date: new Date().toLocaleString('ru-RU'),
                    views: 0,
                    comments: 42
                }
            ];
            localStorage.setItem(this.forumPostsKey, JSON.stringify(defaultPosts));
        }
    }

    // Статьи
    getArticles() {
        return JSON.parse(localStorage.getItem(this.articlesKey)) || [];
    }

    addArticle(article) {
        const articles = this.getArticles();
        article.id = Math.max(...articles.map(a => a.id || 0)) + 1;
        article.date = new Date().toLocaleDateString('ru-RU');
        article.views = '0';
        articles.push(article);
        localStorage.setItem(this.articlesKey, JSON.stringify(articles));
        
        // Обновляем статистику на главной странице
        if (window.indexPageManager) {
            window.indexPageManager.updateSiteStats();
        }
        
        return article;
    }

    getArticlesByCategory(category) {
        return this.getArticles().filter(article => article.category === category);
    }

    getArticlesByFilter(keyword) {
        const articles = this.getArticles();
        if (!keyword) return articles;
        return articles.filter(article =>
            article.title.toLowerCase().includes(keyword.toLowerCase()) ||
            article.description.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Форум-посты
    getForumPosts() {
        return JSON.parse(localStorage.getItem(this.forumPostsKey)) || [];
    }

    addForumPost(post) {
        const posts = this.getForumPosts();
        post.id = Math.max(...posts.map(p => p.id || 0)) + 1;
        post.date = new Date().toLocaleString('ru-RU');
        post.comments = 0;
        post.views = 0;
        posts.push(post);
        localStorage.setItem(this.forumPostsKey, JSON.stringify(posts));
        return post;
    }

    deleteForumPost(id) {
        let posts = this.getForumPosts();
        posts = posts.filter(post => post.id !== id);
        localStorage.setItem(this.forumPostsKey, JSON.stringify(posts));
    }

    getForumPostsByCategory(category) {
        return this.getForumPosts().filter(post => post.category === category);
    }

    getAllForumPosts() {
        return this.getForumPosts().sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// ============================================
// СИСТЕМА РЕНДЕРИНГА
// ============================================

class Renderer {
    static renderArticles(articles) {
        const container = document.querySelector('.grid--3cols');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #999; font-size: 16px;">📭 Статей не найдено</p>
                </div>
            `;
            return;
        }

        container.innerHTML = articles.map(article => `
            <article class="article-card">
                <div class="article-card__image"></div>
                <div class="article-card__content">
                    <span class="article-card__category">${this.getCategoryName(article.category)}</span>
                    <h3 class="article-card__title">${article.title}</h3>
                    <p class="article-card__description">${article.description}</p>
                    <div class="article-card__meta">
                        <time datetime="${article.date}">${article.date}</time>
                        <span class="article-card__views">${article.views} просмотров</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    static renderForumPosts(posts) {
        const container = document.getElementById('forumPostsList');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">💭</div>
                    <div class="empty-state__text">Обсуждений пока нет</div>
                    <div class="empty-state__subtext">Будьте первым, кто создаст новую тему!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="forum-post">
                <div class="forum-post__header">
                    <div>
                        <h4 class="forum-post__title">${post.title}</h4>
                        <span class="forum-post__category">${this.getCategoryName(post.category)}</span>
                    </div>
                </div>
                <div class="forum-post__author">👤 ${post.author || 'Аноним'}</div>
                <p class="forum-post__message">${post.message}</p>
                <div class="forum-post__meta">
                    <span class="forum-post__date">🕐 ${post.date}</span>
                    <div class="forum-post__actions">
                        <span>💬 ${post.comments || 0} комментариев</span>
                        <button class="forum-post__delete" data-id="${post.id}">Удалить</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Добавить обработчики удаления
        document.querySelectorAll('.forum-post__delete').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Удалить это обсуждение?')) {
                    dataManager.deleteForumPost(parseInt(this.dataset.id));
                    Renderer.renderForumPosts(dataManager.getAllForumPosts());
                }
            });
        });
    }

    static getCategoryName(category) {
        const names = {
            'health': 'Здоровье',
            'fitness': 'Фитнес',
            'career': 'Карьера',
            'tech': 'Технологии',
            'style': 'Стиль',
            'relations': 'Отношения'
        };
        return names[category] || category;
    }
}

// ============================================
// МОДАЛЬНЫЕ ОКНА И ФОРМЫ
// ============================================

class Modal {
    static open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    static close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    static setupCloseHandlers() {
        // Закрытие при клике на overlay
        document.querySelectorAll('.modal__overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Закрытие при клике на кнопку close
        document.querySelectorAll('.modal__close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Prevent modal close when clicking on modal content
        document.querySelectorAll('.modal__content').forEach(content => {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Закрытие при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });
            }
        });
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

let dataManager;
let currentFilter = null;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация системы управления данными
    dataManager = new DataManager();

    // Инициализация модальных окон
    Modal.setupCloseHandlers();

    // ============================================
    // ОБРАБОТЧИК: Мобильное меню
    // ============================================

    const menuToggle = document.getElementById('menuToggle');
    const navigation = document.getElementById('navigation');

    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navigation.classList.toggle('active');
        });

        const navLinks = navigation.querySelectorAll('.navigation__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navigation.classList.remove('active');
            });
        });
    }

    // ============================================
    // ОБРАБОТЧИК: Добавление статьи
    // ============================================

    const addArticleLink = document.getElementById('addArticleLink');
    const addArticleModal = document.getElementById('addArticleModal');
    const closeAddArticle = document.getElementById('closeAddArticle');
    const addArticleForm = document.getElementById('addArticleForm');

    if (addArticleLink) {
        addArticleLink.addEventListener('click', (e) => {
            e.preventDefault();
            Modal.open('addArticleModal');
        });
    }

    if (addArticleForm) {
        addArticleForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const article = {
                title: document.getElementById('articleTitle').value,
                category: document.getElementById('articleCategory').value,
                description: document.getElementById('articleDescription').value,
                author: document.getElementById('articleAuthor').value || 'Аноним'
            };

            dataManager.addArticle(article);

            // Очистить форму
            addArticleForm.reset();
            Modal.close('addArticleModal');

            // Показать успешное сообщение
            showNotification('✅ Статья успешно добавлена!');

            // Обновить отображение
            currentFilter = null;
            Renderer.renderArticles(dataManager.getArticles());
        });
    }

    // ============================================
    // ОБРАБОТЧИК: Форум
    // ============================================

    const forumLink = document.getElementById('forumLink');
    const forumModal = document.getElementById('forumModal');
    const closeForumModal = document.getElementById('closeForumModal');
    const addForumPostForm = document.getElementById('addForumPostForm');

    if (forumLink) {
        forumLink.addEventListener('click', (e) => {
            e.preventDefault();
            Modal.open('forumModal');
            Renderer.renderForumPosts(dataManager.getAllForumPosts());
        });
    }

    if (addForumPostForm) {
        addForumPostForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const post = {
                title: document.getElementById('forumTitle').value,
                category: document.getElementById('forumCategory').value,
                message: document.getElementById('forumMessage').value,
                author: document.getElementById('forumAuthor').value || 'Аноним'
            };

            dataManager.addForumPost(post);

            // Очистить форму
            addForumPostForm.reset();

            // Показать успешное сообщение
            showNotification('✅ Тема успешно создана!');

            // Обновить список постов
            Renderer.renderForumPosts(dataManager.getAllForumPosts());
        });
    }

    // ============================================
    // ОБРАБОТЧИК: Фильтрация по категориям
    // ============================================

    const categoryFilters = document.querySelectorAll('.category-filter');

    categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();

            const category = e.target.dataset.category;

            // Переключить активный фильтр
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            // Применить фильтр
            currentFilter = category;
            const filtered = dataManager.getArticlesByCategory(category);
            Renderer.renderArticles(filtered);

            // Показать статус фильтра
            const categoryName = Renderer.getCategoryName(category);
            showNotification(`🔍 Фильтр: ${categoryName}`);
        });
    });

    // Обработчик для показа всех статей (очистка фильтра)
    const logoText = document.querySelector('.logo__text');
    if (logoText) {
        logoText.addEventListener('click', () => {
            categoryFilters.forEach(f => f.classList.remove('active'));
            currentFilter = null;
            Renderer.renderArticles(dataManager.getArticles());
            showNotification('✅ Фильтр очищен. Все статьи показаны.');
        });
    }

    // ============================================
    // ОБРАБОТЧИК: Форма рассылки
    // ============================================

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]');
            if (email && email.value) {
                email.value = '';
                showNotification('✅ Спасибо! Вы подписаны на рассылку.');
            }
        });
    }

    // ============================================
    // ИНИЦИАЛЬНАЯ ЗАГРУЗКА
    // ============================================

    // Показать все статьи при загрузке
    Renderer.renderArticles(dataManager.getArticles());
});

// ============================================
// СИСТЕМА УВЕДОМЛЕНИЙ
// ============================================

function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a9eff;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
        font-size: 14px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

    // ============================================
    // Newsletter Form Submission
    // ============================================

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.newsletter-form__input');
            const submitButton = this.querySelector('.newsletter-form__button');
            const originalText = submitButton.textContent;

            // Show success message
            submitButton.textContent = 'Спасибо! ✓';
            submitButton.style.backgroundColor = '#2d7acc';
            
            // Clear input
            emailInput.value = '';

            // Reset after 3 seconds
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.style.backgroundColor = '';
            }, 3000);
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // Image Lazy Loading (for future real images)
    // ============================================

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // In production, load actual images here
                    entry.target.classList.add('loaded');
                    imageObserver.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.article-card__image').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ============================================
    // Article Card Click Handler
    // ============================================

    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking certain elements
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            // In production, navigate to article detail page
            console.log('Navigate to article detail');
        });

        card.style.cursor = 'pointer';
    });

    // ============================================
    // Trending Item Click
    // ============================================

    document.querySelectorAll('.trending-item__link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Placeholder for navigation
            console.log('Navigate to:', this.textContent);
        });
    });

    // ============================================
    // Forum Item Click
    // ============================================

    document.querySelectorAll('.forum-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('a')) {
                return;
            }
            // Placeholder for navigation to forum
            console.log('Navigate to forum thread');
        });
        item.style.cursor = 'pointer';
    });

    // ============================================
    // Close Mobile Menu on Resize
    // ============================================

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            navigation.classList.remove('active');
        }
    });

    // ============================================
    // Simple Analytics Placeholder
    // ============================================

    // Track article views (placeholder)
    function trackArticleView(articleTitle) {
        // In production, send to analytics service
        console.log('Tracked article view:', articleTitle);
    }

    // ============================================
    // Active Navigation Link Update
    // ============================================

    window.addEventListener('scroll', function() {
        // Update active navigation item based on scroll position
        // This is a placeholder - in production, would track actual content sections
    });

    // ============================================
    // Utility: Element Visibility Check
    // ============================================

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ============================================
    // Print Friendly Styling
    // ============================================

    if (window.matchMedia) {
        const mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                // Hide navigation when printing
                document.querySelector('header').style.display = 'none';
                document.querySelector('.sidebar').style.display = 'none';
            }
        });
    }

    // ============================================
    // Keyboard Navigation Support
    // ============================================

    document.addEventListener('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            menuToggle.classList.remove('active');
            navigation.classList.remove('active');
        }

        // Tab key for keyboard navigation
        if (e.key === 'Tab') {
            // Focus management is handled by browser by default
        }
    });

    // ============================================
    // Theme Toggle (Optional - Future Feature)
    // ============================================

    function initializeThemePreference() {
        // Check if user has theme preference saved
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    initializeThemePreference();

    // ============================================
    // Performance: Debounce Resize Events
    // ============================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedResize = debounce(function() {
        // Handle resize events
        console.log('Window resized');
    }, 250);

    window.addEventListener('resize', debouncedResize);

    // ============================================
    // Console Log for Development
    // ============================================

    console.log(
        '%cman.ru Prototype',
        'font-size: 20px; font-weight: bold; color: #4a9eff;'
    );
    console.log('Mobile Menu Toggle: Click the hamburger icon (on mobile)');
    console.log('Newsletter Form: Enter email to test submission');
    console.log('All navigation links are interactive placeholders');
});

/**
 * Service Worker Registration (Optional - for future PWA features)
 * Commented out for now, can be enabled for offline support
 */

/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
*/

/**
 * Performance Monitoring (Optional)
 */

if (window.PerformanceObserver) {
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('Performance entry:', entry);
            }
        });
        observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (e) {
        // Performance API might not be fully supported
    }
}

/**
 * ПОИСК ПО СТРАНИЦЕ
 */
class PageSearch {
    constructor() {
        this.searchInput = document.querySelector('.header__search-input');
        this.searchBtn = document.querySelector('.header__search-btn');
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('keyup', (e) => this.handleSearch(e));
        this.searchBtn.addEventListener('click', () => this.handleSearch());
    }

    handleSearch(e) {
        if (e && e.key !== 'Enter') return;
        
        const query = this.searchInput.value.toLowerCase().trim();
        if (!query) {
            this.clearSearch();
            return;
        }

        // Поиск в статьях
        const articleCards = document.querySelectorAll('.article-card');
        const articlesGrid = document.querySelector('.articles-grid');
        
        if (!articlesGrid) return;

        let foundCount = 0;
        articleCards.forEach(card => {
            const title = card.querySelector('.article-card__title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.article-card__description')?.textContent.toLowerCase() || '';
            
            if (title.includes(query) || description.includes(query)) {
                card.style.display = 'flex';
                foundCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Если ничего не найдено
        if (foundCount === 0) {
            articlesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d;">
                    <p style="font-size: 16px; margin-bottom: 10px;">📭</p>
                    <p>Ничего не найдено по запросу: <strong>"${this.searchInput.value}"</strong></p>
                </div>
            `;
        }
    }

    clearSearch() {
        const articleCards = document.querySelectorAll('.article-card');
        articleCards.forEach(card => {
            card.style.display = 'flex';
        });
    }
}

/**
 * СИСТЕМА КОММЕНТАРИЕВ
 */
class CommentsSystem {
    constructor() {
        this.commentsKey = 'man_ru_comments';
        this.initializeComments();
        this.attachCommentListeners();
    }

    initializeComments() {
        if (!localStorage.getItem(this.commentsKey)) {
            const defaultComments = {
                1: [
                    {
                        id: 1,
                        author: 'Петр',
                        text: 'Я тоже прошел через это. Главное - слушай сына, не осуждай. Со временем отношения станут лучше.',
                        date: '14 января, 10:30',
                        likes: 12
                    }
                ],
                2: [
                    {
                        id: 1,
                        author: 'Марин',
                        text: 'Выходные только для семьи. Отключу телефон, уберу все рабочие мысли.',
                        date: '13 января, 14:15',
                        likes: 5
                    }
                ]
            };
            localStorage.setItem(this.commentsKey, JSON.stringify(defaultComments));
        }
    }

    attachCommentListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('article-card')) {
                const articleCard = e.target.closest('.article-card');
                if (articleCard) {
                    this.showArticleModal(articleCard);
                }
            }
        });
    }

    showArticleModal(articleCard) {
        const title = articleCard.querySelector('.article-card__title')?.textContent || 'Статья';
        const description = articleCard.querySelector('.article-card__description')?.textContent || '';
        const articleId = articleCard.getAttribute('data-article-id') || '1';
        
        const modal = `
            <div class="modal active" id="articleModal">
                <div class="modal__overlay" onclick="this.closest('.modal').remove()"></div>
                <div class="modal__content">
                    <div class="modal__header">
                        <h2 style="margin: 0; font-size: 16px;">${title}</h2>
                        <button class="modal__close" onclick="this.closest('.modal').remove()">✕</button>
                    </div>
                    <div class="modal__body">
                        <p style="margin-bottom: 15px; line-height: 1.6;">${description}</p>
                        
                        <div style="border-top: 1px solid #bdc3c7; padding-top: 15px; margin-top: 15px;">
                            <h4 style="margin-bottom: 10px;">Комментарии</h4>
                            <div id="commentsList" style="margin-bottom: 15px;">
                                <!-- Комментарии будут загружены здесь -->
                            </div>
                            
                            <div style="border-top: 1px solid #bdc3c7; padding-top: 15px;">
                                <textarea id="newComment" placeholder="Напишите ваш комментарий..." style="width: 100%; padding: 8px; border: 1px solid #bdc3c7; border-radius: 2px; font-family: Verdana, Arial, sans-serif; font-size: 12px; resize: vertical; min-height: 80px;"></textarea>
                                <button id="submitComment" style="background: #3498db; color: white; border: none; padding: 8px 12px; margin-top: 8px; cursor: pointer; font-weight: bold; border-radius: 2px;" onclick="window.commentsSystem.addComment('${articleId}')">Отправить</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
        this.loadComments(articleId);
    }

    loadComments(articleId) {
        const comments = JSON.parse(localStorage.getItem(this.commentsKey)) || {};
        const commentsList = document.getElementById('commentsList');
        
        if (!commentsList) return;
        
        const articleComments = comments[articleId] || [];
        
        if (articleComments.length === 0) {
            commentsList.innerHTML = '<p style="color: #7f8c8d; font-size: 12px;">Нет комментариев. Будьте первым!</p>';
            return;
        }
        
        commentsList.innerHTML = articleComments.map(comment => `
            <div style="border-left: 3px solid #3498db; padding: 10px; margin-bottom: 10px; background: #f8f9fa;">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">${comment.author}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${comment.text}</div>
                <div style="font-size: 11px; color: #95a5a6; display: flex; justify-content: space-between;">
                    <span>${comment.date}</span>
                    <span>👍 ${comment.likes}</span>
                </div>
            </div>
        `).join('');
    }

    addComment(articleId) {
        const textarea = document.getElementById('newComment');
        if (!textarea || !textarea.value.trim()) {
            alert('Напишите комментарий!');
            return;
        }

        const commentText = textarea.value.trim();
        if (commentText.length < 5) {
            alert('Комментарий должен быть минимум 5 символов');
            return;
        }

        if (commentText.length > 500) {
            alert('Комментарий не должен быть длиннее 500 символов');
            return;
        }

        const comments = JSON.parse(localStorage.getItem(this.commentsKey)) || {};
        if (!comments[articleId]) {
            comments[articleId] = [];
        }
        
        const newComment = {
            id: Date.now(),
            author: 'Вы',
            text: commentText,
            date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            likes: 0
        };
        
        comments[articleId].push(newComment);
        localStorage.setItem(this.commentsKey, JSON.stringify(comments));
        
        textarea.value = '';
        this.loadComments(articleId);
        
        // Показываем уведомление
        const btn = document.getElementById('submitComment');
        const oldText = btn.textContent;
        btn.textContent = '✓ Комментарий добавлен!';
        btn.style.background = '#2ecc71';
        setTimeout(() => {
            btn.textContent = oldText;
            btn.style.background = '#3498db';
        }, 2000);
    }
}

// ============================================
// УЛУЧШЕННАЯ СИСТЕМА ПОИСКА
// ============================================

class AdvancedSearch {
    constructor() {
        this.dataManager = new DataManager();
        this.searchInput = document.querySelector('.header__search-input');
        this.searchBtn = document.querySelector('.header__search-btn');
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchInput.addEventListener('focus', () => this.showSearchResults());
        this.searchInput.addEventListener('blur', () => setTimeout(() => this.hideSearchResults(), 200));
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchContent(query);
        this.displaySearchResults(results);
    }

    searchContent(query) {
        const results = [];
        const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
        const forumPosts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        
        // Поиск в статьях
        articles.forEach(article => {
            const titleMatch = article.title.toLowerCase().includes(query);
            const contentMatch = (article.content || '').toLowerCase().includes(query);
            const descriptionMatch = (article.description || '').toLowerCase().includes(query);
            
            if (titleMatch || contentMatch || descriptionMatch) {
                results.push({
                    type: 'article',
                    id: article.id,
                    title: article.title,
                    category: article.category || 'other',
                    description: article.description,
                    content: article.content,
                    author: article.author,
                    date: article.date
                });
            }
        });

        // Поиск в форуме
        forumPosts.forEach(post => {
            const titleMatch = post.title.toLowerCase().includes(query);
            const contentMatch = (post.content || '').toLowerCase().includes(query);
            
            if (titleMatch || contentMatch) {
                results.push({
                    type: 'forum',
                    id: post.id,
                    title: post.title,
                    category: 'forum',
                    description: post.description,
                    content: post.content,
                    author: post.author,
                    date: post.date
                });
            }
        });

        return results;
    }

    displaySearchResults(results) {
        let container = document.querySelector('.search-results');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-results';
            document.body.appendChild(container);
        }

        if (results.length === 0) {
            container.innerHTML = '<div style="padding: 15px; text-align: center; color: #999;">Ничего не найдено</div>';
            container.classList.add('active');
            return;
        }

        container.innerHTML = results.slice(0, 10).map(result => `
            <div class="search-result-item" data-type="${result.type}" data-id="${result.id}">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-category">${result.type === 'forum' ? '💬 Форум' : `📰 ${result.category}`}</div>
            </div>
        `).join('');

        container.classList.add('active');

        // Обработчики клика
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type');
                const id = item.getAttribute('data-id');
                
                if (type === 'article') {
                    this.openArticle(id);
                } else if (type === 'forum') {
                    this.openForumPost(id);
                }
                
                this.hideSearchResults();
            });
        });
    }

    openArticle(articleId) {
        const articles = JSON.parse(localStorage.getItem('man_ru_articles')) || [];
        const article = articles.find(a => a.id == articleId);
        
        if (article) {
            this.showArticleModal(article);
        }
    }

    openForumPost(postId) {
        const posts = JSON.parse(localStorage.getItem('man_ru_forum_posts')) || [];
        const post = posts.find(p => p.id == postId);
        
        if (post) {
            this.showForumModal(post);
        }
    }

    showArticleModal(article) {
        const modalId = 'modal-' + article.id;
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${article.title}</h2>
                    <span class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</span>
                </div>
                <div class="modal-meta">
                    Автор: ${article.author} | Дата: ${article.date} | Просмотров: ${article.views || '0'}
                </div>
                <div class="modal-body">
                    ${article.content || article.description}
                </div>
                <div class="modal-comments">
                    <div class="comments-title">Комментарии</div>
                    <div class="comments-list" id="comments-${article.id}">
                        <!-- Комментарии загружаются здесь -->
                    </div>
                    <div class="comment-form">
                        <textarea id="comment-input-${article.id}" placeholder="Напишите ваш комментарий..."></textarea>
                        <button onclick="window.advancedSearch.submitComment(${article.id})">Отправить комментарий</button>
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

    showForumModal(post) {
        const modalId = 'forum-modal-' + post.id;
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💬 ${post.title}</h2>
                    <span class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</span>
                </div>
                <div class="modal-meta">
                    Автор: ${post.author} | Дата: ${post.date} | Ответов: ${post.replies || '0'}
                </div>
                <div class="modal-body">
                    ${post.content || post.description}
                </div>
                <div class="modal-comments">
                    <div class="comments-title">Обсуждение</div>
                    <div class="comments-list" id="forum-${post.id}">
                        <!-- Обсуждение загружаются здесь -->
                    </div>
                    <div class="comment-form">
                        <textarea id="forum-input-${post.id}" placeholder="Ваш ответ в обсуждение..."></textarea>
                        <button onclick="window.advancedSearch.submitForumReply(${post.id})">Ответить</button>
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
                <div class="comment-author">${c.author}</div>
                <div class="comment-time">${c.date}</div>
                <div class="comment-text">${c.text}</div>
            </div>
        `).join('');
    }

    loadForumReplies(postId) {
        const repliesList = document.getElementById(`forum-${postId}`);
        if (!repliesList) return;

        const allReplies = JSON.parse(localStorage.getItem('man_ru_forum_replies')) || {};
        const replies = allReplies[postId] || [];

        if (replies.length === 0) {
            repliesList.innerHTML = '<p style="color: #999; font-size: 12px;">Нет ответов. Начните обсуждение!</p>';
            return;
        }

        repliesList.innerHTML = replies.map(r => `
            <div class="comment-item">
                <div class="comment-author">${r.author}</div>
                <div class="comment-time">${r.date}</div>
                <div class="comment-text">${r.text}</div>
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

        const allComments = JSON.parse(localStorage.getItem('man_ru_article_comments')) || {};
        if (!allComments[articleId]) allComments[articleId] = [];

        allComments[articleId].push({
            author: 'Вы',
            text: text,
            date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem('man_ru_article_comments', JSON.stringify(allComments));
        input.value = '';
        this.loadArticleComments(articleId);
    }

    submitForumReply(postId) {
        const input = document.getElementById(`forum-input-${postId}`);
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

        allReplies[postId].push({
            author: 'Вы',
            text: text,
            date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem('man_ru_forum_replies', JSON.stringify(allReplies));
        input.value = '';
        this.loadForumReplies(postId);
    }

    hideSearchResults() {
        const container = document.querySelector('.search-results');
        if (container) {
            container.classList.remove('active');
        }
    }

    showSearchResults() {
        const query = this.searchInput.value.toLowerCase().trim();
        if (query) {
            const container = document.querySelector('.search-results');
            if (container) {
                container.classList.add('active');
            }
        }
    }
}

// Инициализация систем
document.addEventListener('DOMContentLoaded', () => {
    window.commentsSystem = new CommentsSystem();
    window.advancedSearch = new AdvancedSearch();
    new PageSearch();
});


