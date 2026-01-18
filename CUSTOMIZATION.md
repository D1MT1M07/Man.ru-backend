<!-- 
  ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ И РАСШИРЕНИЯ
  man.ru Prototype - Usage Guide
-->

<!-- 
  =====================================================
  1. ДОБАВЛЕНИЕ НОВОЙ КАТЕГОРИИ В НАВИГАЦИЮ
  =====================================================

Шаг 1: Добавьте элемент в index.html (строка 30-35):

    <li class="navigation__item">
        <a href="#новая-категория" class="navigation__link">Новая Категория</a>
    </li>

Шаг 2: Обновите CSS для активного состояния (опционально)

Шаг 3: В JavaScript добавьте обработчик события (опционально)
-->

<!-- 
  =====================================================
  2. ДОБАВЛЕНИЕ НОВОЙ СТАТЬИ В СЕТКУ
  =====================================================

Скопируйте этот блок и вставьте перед закрытием .grid--3cols:

<article class="article-card">
    <div class="article-card__image"></div>
    <div class="article-card__content">
        <span class="article-card__category">Ваша категория</span>
        <h3 class="article-card__title">Заголовок вашей статьи</h3>
        <p class="article-card__description">Краткое описание статьи в 2-3 предложениях.</p>
        <div class="article-card__meta">
            <time datetime="2026-01-14">14 января</time>
        </div>
    </div>
</article>

Стили автоматически применятся благодаря BEM классам.
-->

<!-- 
  =====================================================
  3. КАСТОМИЗАЦИЯ ЦВЕТОВ
  =====================================================

В styles.css найдите эти цвета и измените их:

    /* Основные цвета */
    #1a1f36  → Тёмный синий (заголовок, футер)
    #2d3354  → Средний синий (фон второй слой)
    #4a9eff  → Небесный синий (кнопки, акценты) ⬅️ ГЛАВНЫЙ ЦВЕТ
    #f8f9fa  → Светло-серый (фон страницы)
    #2c2c2c  → Тёмно-серый (основной текст)

Пример: замените все #4a9eff на #ff6b35 для оранжевого акцента

/* До */
color: #4a9eff;

/* После */
color: #ff6b35;
-->

<!-- 
  =====================================================
  4. ДОБАВЛЕНИЕ СОЦИАЛЬНЫХ ССЫЛОК В HEADER
  =====================================================

Добавьте перед </header> (строка ~44):

<div class="header__social">
    <a href="#" class="social-link" title="Facebook">f</a>
    <a href="#" class="social-link" title="Instagram">📷</a>
    <a href="#" class="social-link" title="Twitter">𝕏</a>
</div>

И добавьте CSS в styles.css:

.header__social {
    display: flex;
    gap: 15px;
    margin-left: auto;
}

.social-link {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.social-link:hover {
    background-color: rgba(255,255,255,0.2);
}

@media (max-width: 768px) {
    .header__social {
        display: none;
    }
}
-->

<!-- 
  =====================================================
  5. СОЗДАНИЕ ВАРИАНТОВ КАРТОЧЕК
  =====================================================

Вариант 1: С большой проверкой рейтинга (звёзды)

<article class="article-card article-card--featured-rating">
    <div class="article-card__image-wrapper">
        <div class="article-card__image"></div>
        <div class="article-card__rating">⭐⭐⭐⭐⭐ 4.8</div>
    </div>
    ...
</article>

Вариант 2: С тегами

<article class="article-card">
    ...
    <div class="article-card__tags">
        <span class="tag">тренировка</span>
        <span class="tag">дома</span>
        <span class="tag">без оборудования</span>
    </div>
</article>

Вариант 3: С видеоэтикеткой

<article class="article-card article-card--video">
    <div class="article-card__image">
        <span class="video-badge">▶ VIDEO</span>
    </div>
    ...
</article>
-->

<!-- 
  =====================================================
  6. МОДИФИКАЦИЯ SIDEBAR-БЛОКОВ
  =====================================================

Переместить sidebar слева:

.layout {
    grid-template-columns: 320px 1fr;
}

Сделать sidebar во весь экран (на мобильных):

@media (max-width: 768px) {
    .layout {
        grid-template-columns: 1fr;
    }
    
    .sidebar {
        order: -1; /* Поместить перед основным контентом */
    }
}

Скрыть sidebar на экранах < 640px:

@media (max-width: 640px) {
    .sidebar {
        display: none;
    }
    
    .layout {
        grid-template-columns: 1fr;
    }
}
-->

<!-- 
  =====================================================
  7. ДОБАВЛЕНИЕ ПАГИНАЦИИ
  =====================================================

Добавьте перед </article-section>:

<nav class="pagination" aria-label="Pagination">
    <a href="#" class="pagination__link pagination__link--prev">← Назад</a>
    <span class="pagination__current">Страница 1 из 10</span>
    <a href="#" class="pagination__link pagination__link--next">Вперед →</a>
</nav>

CSS в styles.css:

.pagination {
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    margin-top: 40px;
    padding-top: 40px;
    border-top: 2px solid #e5e5e5;
}

.pagination__link {
    padding: 10px 20px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    color: #2c2c2c;
    transition: all 0.3s ease;
}

.pagination__link:hover {
    background-color: #4a9eff;
    color: white;
    border-color: #4a9eff;
}

.pagination__current {
    color: #666;
    font-weight: 600;
}
-->

<!-- 
  =====================================================
  8. ДОБАВЛЕНИЕ ФИЛЬТРОВ/ПОИСКА
  =====================================================

Добавьте в header перед </header__container>:

<div class="header__search">
    <input type="search" class="search-input" placeholder="Поиск статей..." />
    <button class="search-btn">🔍</button>
</div>

CSS:

.header__search {
    display: flex;
    gap: 8px;
    margin-left: 20px;
}

.search-input {
    padding: 8px 12px;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    background-color: rgba(255,255,255,0.1);
    color: white;
    font-size: 13px;
}

.search-input::placeholder {
    color: rgba(255,255,255,0.6);
}

.search-btn {
    padding: 8px 12px;
    background-color: #4a9eff;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.search-btn:hover {
    background-color: #2d7acc;
}

@media (max-width: 768px) {
    .header__search {
        width: 100%;
        order: 10;
        margin-left: 0;
        margin-top: 12px;
    }
}
-->

<!-- 
  =====================================================
  9. ИНТЕГРАЦИЯ С РЕАЛЬНЫМИ ИЗОБРАЖЕНИЯМИ
  =====================================================

Замените все .article-card__image на реальные img теги:

<!-- Было -->
<div class="article-card__image"></div>

<!-- Стало -->
<img src="/images/article-1.jpg" 
     alt="Как правильно восстанавливаться после тренировок" 
     class="article-card__image" 
     loading="lazy">

Добавьте обработку в script.js:

document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.loading = 'lazy';
});

Или используйте Intersection Observer для большего контроля:

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            imageObserver.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});
-->

<!-- 
  =====================================================
  10. ДОБАВЛЕНИЕ КОММЕНТАРИЕВ
  =====================================================

После основного контента добавьте:

<section class="comments-section">
    <h2 class="section-title">Комментарии (23)</h2>
    
    <form class="comment-form">
        <textarea class="comment-form__textarea" 
                  placeholder="Напишите ваш комментарий..." 
                  required></textarea>
        <button type="submit" class="comment-form__submit">Отправить</button>
    </form>
    
    <div class="comments-list">
        <article class="comment">
            <div class="comment__avatar"></div>
            <div class="comment__content">
                <h4 class="comment__author">Иван Петров</h4>
                <time class="comment__date">2 часа назад</time>
                <p class="comment__text">Отличная статья! Именно то, что нужно.</p>
                <button class="comment__reply">Ответить</button>
            </div>
        </article>
    </div>
</section>

CSS структура подобна forum-item.
-->

<!-- 
  =====================================================
  11. СОЗДАНИЕ МОБИЛЬНОЙ ВЕРСИИ МЕНЮ
  =====================================================

Уже реализовано в проекте, но вот детали:

JavaScript переключает класс .active:

.menu-toggle.active {
    /* X-образная иконка */
}

.navigation.active {
    /* Показывает меню на мобильных */
}

Для добавления иконок (Font Awesome или свои):

<button class="menu-toggle">
    <i class="icon-hamburger"></i>
</button>

Или используйте SVG:

<button class="menu-toggle">
    <svg>...</svg>
</button>
-->

<!-- 
  =====================================================
  12. ДОБАВЛЕНИЕ МОДАЛЬНОГО ОКНА
  =====================================================

HTML:

<div class="modal" id="newsletterModal">
    <div class="modal__content">
        <button class="modal__close">&times;</button>
        <h2>Подписка на рассылку</h2>
        <p>Получайте лучшие статьи каждую неделю</p>
        <form class="modal__form">
            <input type="email" placeholder="Email" required>
            <button type="submit">Подписаться</button>
        </form>
    </div>
    <div class="modal__overlay"></div>
</div>

CSS:

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
}

.modal.active {
    display: flex;
}

.modal__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal__content {
    position: relative;
    z-index: 1001;
    background: white;
    border-radius: 8px;
    padding: 30px;
    max-width: 500px;
    margin: auto;
}

JavaScript:

const modal = document.getElementById('newsletterModal');
const closeBtn = modal.querySelector('.modal__close');

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Открыть при клике на кнопку
document.querySelector('.newsletter-form__button').addEventListener('click', () => {
    modal.classList.add('active');
});
-->

<!-- 
  =====================================================
  13. THEME SWITCHER (DARK/LIGHT MODE)
  =====================================================

Добавьте кнопку в header:

<button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
    🌙 / ☀️
</button>

JavaScript:

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

html.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

CSS уже содержит @media (prefers-color-scheme: dark)
-->

<!-- 
  =====================================================
  14. ДОБАВЛЕНИЕ BREADCRUMBS
  =====================================================

HTML перед .layout:

<nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
        <li class="breadcrumbs__item">
            <a href="/" class="breadcrumbs__link">Главная</a>
        </li>
        <li class="breadcrumbs__item">
            <a href="#fitness" class="breadcrumbs__link">Фитнес</a>
        </li>
        <li class="breadcrumbs__item" aria-current="page">
            Упражнения для спины
        </li>
    </ol>
</nav>

CSS:

.breadcrumbs {
    margin-bottom: 20px;
}

.breadcrumbs__list {
    list-style: none;
    display: flex;
    gap: 8px;
    font-size: 13px;
}

.breadcrumbs__item::after {
    content: '/';
    margin-left: 8px;
    color: #ccc;
}

.breadcrumbs__item:last-child::after {
    content: '';
    margin-left: 0;
}

.breadcrumbs__link {
    color: #4a9eff;
}

.breadcrumbs__link:hover {
    color: #2d7acc;
}
-->

<!-- 
  =====================================================
  15. ОПТИМИЗАЦИЯ ДЛЯ PRODUCTION
  =====================================================

1. Минификация CSS:
   - Используйте cssnano или similar
   - Удалите комментарии
   
2. Минификация JavaScript:
   - Используйте terser или similar
   - Удалите console.log()
   
3. Сжатие изображений:
   - JPEG → webp
   - PNG → webp
   - Используйте <picture> с fallback
   
4. Кэширование:
   - Добавьте Service Worker
   - Кэшируйте статические файлы
   
5. CDN:
   - Используйте CloudFlare, AWS CloudFront
   - Распределяйте контент близко к пользователям
   
6. Monitoring:
   - Добавьте Sentry для ошибок
   - Google Analytics для отслеживания
   
7. SEO:
   - Добавьте sitemap.xml
   - robots.txt
   - Структурированные данные (JSON-LD)
-->

---

## БЫСТРЫЕ СПРАВОЧНИКИ

### CSS Классы (наиболее используемые)

| Класс | Назначение |
|-------|-----------|
| `.container` | Макет контейнера (max-width: 1200px) |
| `.layout` | Двухколоночный grid (1fr + 320px) |
| `.grid--3cols` | Сетка из 3 колонок |
| `.article-card` | Карточка статьи |
| `.article-card--featured` | Большая избранная карточка |
| `.sidebar-block` | Блок боковой панели |
| `.section-title` | Заголовок секции |
| `.navigation` | Навигационное меню |
| `.menu-toggle.active` | Активное мобильное меню |

### Главные точки для кастомизации

```css
/* Цвета */
#4a9eff        /* Основной акцент */
#1a1f36        /* Тёмный синий */
#f8f9fa        /* Фон */
#2c2c2c        /* Текст */

/* Размеры */
1200px         /* Max-width контейнера */
320px          /* Ширина sidebar */
768px          /* Мобильный breakpoint */

/* Шрифты */
16px base      /* Базовый размер шрифта */
-apple-system  /* Семейство шрифтов */
```

### JavaScript Events

```javascript
// Мобильное меню
menuToggle.addEventListener('click', ...)

// Форма подписки
newsletterForm.addEventListener('submit', ...)

// Плавный скролл
anchor.addEventListener('click', ...)

// Resize
window.addEventListener('resize', ...)

// Scroll
window.addEventListener('scroll', ...)
```

---

**Последнее обновление:** Январь 2026  
**Версия:** 1.0.0  
**Статус:** Production-ready prototype
