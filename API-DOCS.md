# 🧑‍💻 API документация для разработчиков

## Оглавление

1. [DataManager API](#datamanager-api)
2. [Renderer API](#renderer-api)
3. [Modal API](#modal-api)
4. [События](#события)
5. [Примеры кода](#примеры-кода)
6. [localStorage структура](#localstorage-структура)

---

## DataManager API

### Описание
`DataManager` - класс для управления всеми данными приложения (статьи и форум-посты).

### Инициализация
```javascript
const dm = new DataManager();
```

### Методы работы со статьями

#### `getArticles()`
Получить все статьи.
```javascript
const allArticles = dm.getArticles();
// Возвращает: Array<Article>
```

#### `addArticle(article)`
Добавить новую статью в хранилище.
```javascript
const newArticle = dm.addArticle({
    title: "Заголовок",
    category: "fitness",
    description: "Описание",
    author: "Автор"
});
// Возвращает: Article (с автоматически добавленными id, date, views)
```

**Параметры:**
- `title` (string, обязательно) - заголовок статьи
- `category` (string, обязательно) - одна из: health, fitness, career, tech, style, relations
- `description` (string, обязательно) - описание статьи
- `author` (string) - имя автора

**Возвращаемые поля:**
```javascript
{
    id: number,              // Автоматический ID
    title: string,
    category: string,
    description: string,
    author: string,
    date: string,            // Автоматическая дата
    views: string            // По умолчанию "0"
}
```

#### `getArticlesByCategory(category)`
Получить статьи конкретной категории.
```javascript
const fitnessArticles = dm.getArticlesByCategory('fitness');
// Возвращает: Array<Article>
```

#### `getArticlesByFilter(keyword)`
Поиск статей по ключевому слову (в названии или описании).
```javascript
const results = dm.getArticlesByFilter('тренировка');
// Возвращает: Array<Article>

// Пустая строка возвращает все статьи
const all = dm.getArticlesByFilter('');
```

### Методы работы с форумом

#### `getForumPosts()`
Получить все форум-посты.
```javascript
const posts = dm.getForumPosts();
// Возвращает: Array<ForumPost>
```

#### `addForumPost(post)`
Добавить новый форум-пост.
```javascript
const newPost = dm.addForumPost({
    title: "Название темы",
    category: "career",
    message: "Сообщение",
    author: "Автор"
});
// Возвращает: ForumPost (с автоматическими id, date, comments)
```

**Параметры:**
- `title` (string, обязательно) - название темы
- `category` (string, обязательно) - одна из: health, fitness, career, tech, style, relations
- `message` (string, обязательно) - текст сообщения
- `author` (string) - имя автора

**Возвращаемые поля:**
```javascript
{
    id: number,              // Автоматический ID
    title: string,
    category: string,
    message: string,
    author: string,
    date: string,            // Автоматическая дата и время
    comments: number         // По умолчанию 0
}
```

#### `deleteForumPost(id)`
Удалить форум-пост по ID.
```javascript
dm.deleteForumPost(1);
// Возвращает: undefined
```

#### `getForumPostsByCategory(category)`
Получить форум-посты конкретной категории.
```javascript
const careerPosts = dm.getForumPostsByCategory('career');
// Возвращает: Array<ForumPost>
```

#### `getAllForumPosts()`
Получить все форум-посты, отсортированные по времени (новые выше).
```javascript
const sortedPosts = dm.getAllForumPosts();
// Возвращает: Array<ForumPost> (отсортированный)
```

---

## Renderer API

### Описание
`Renderer` - класс для динамического отображения содержимого на странице.

### Методы

#### `renderArticles(articles)`
Отобразить статьи в сетке.
```javascript
const articles = dm.getArticles();
Renderer.renderArticles(articles);
```

**Что происходит:**
- Очищает контейнер `.grid--3cols`
- Заполняет её HTML для каждой статьи
- Если нет статей, показывает пустое сообщение

#### `renderForumPosts(posts)`
Отобразить форум-посты в списке.
```javascript
const posts = dm.getAllForumPosts();
Renderer.renderForumPosts(posts);
```

**Что происходит:**
- Заполняет контейнер `#forumPostsList`
- Добавляет кнопки удаления для каждого поста
- Автоматически привязывает обработчики удаления
- Если нет постов, показывает пустое сообщение

#### `getCategoryName(category)`
Преобразовать код категории в русское название.
```javascript
const name = Renderer.getCategoryName('fitness');
// Возвращает: "Фитнес"
```

**Маппинг:**
```javascript
{
    'health': 'Здоровье',
    'fitness': 'Фитнес',
    'career': 'Карьера',
    'tech': 'Технологии',
    'style': 'Стиль',
    'relations': 'Отношения'
}
```

---

## Modal API

### Описание
`Modal` - класс для управления модальными окнами.

### Методы

#### `open(modalId)`
Открыть модальное окно.
```javascript
Modal.open('addArticleModal');
```

**Что происходит:**
- Добавляет класс `active` к модалю
- Скрывает прокрутку страницы (overflow: hidden)
- Показывает модальное окно с анимацией

#### `close(modalId)`
Закрыть модальное окно.
```javascript
Modal.close('addArticleModal');
```

**Что происходит:**
- Удаляет класс `active` от модаля
- Восстанавливает прокрутку страницы
- Скрывает модальное окно с анимацией

#### `setupCloseHandlers()`
Установить обработчики для закрытия всех модальных окон.
```javascript
Modal.setupCloseHandlers();
```

**Закрытие срабатывает на:**
- Клик на overlay (фон за окном)
- Клик на кнопку close (×)
- Нажатие клавиши Escape

---

## События

### Встроенные события

Все события обрабатываются в скрипте автоматически:

#### 1. Клик на фильтр категории
```javascript
// Автоматически срабатывает при клике на любую категорию
document.querySelector('.category-filter').click();
```

**Что происходит:**
- Активизируется кнопка (подсвечивается)
- Статьи фильтруются по категории
- Показывается уведомление

#### 2. Отправка формы добавления статьи
```javascript
document.getElementById('addArticleForm').submit();
```

**Что происходит:**
- Статья добавляется в DataManager
- Модаль закрывается
- Показывается уведомление об успехе
- Статьи перерисовываются

#### 3. Отправка формы добавления форум-поста
```javascript
document.getElementById('addForumPostForm').submit();
```

**Что происходит:**
- Пост добавляется в DataManager
- Форма очищается
- Показывается уведомление об успехе
- Список постов обновляется

#### 4. Клик на удаление форум-поста
```javascript
document.querySelector('.forum-post__delete').click();
```

**Что происходит:**
- Показывается подтверждение
- Пост удаляется из DataManager
- Список постов обновляется

---

## Примеры кода

### Пример 1: Показать только одну категорию
```javascript
const category = 'fitness';
const articles = dataManager.getArticlesByCategory(category);
Renderer.renderArticles(articles);
showNotification(`Показаны только статьи: ${Renderer.getCategoryName(category)}`);
```

### Пример 2: Добавить статью программно
```javascript
const article = dataManager.addArticle({
    title: 'Как начать бегать',
    category: 'fitness',
    description: 'Для новичков: 10 советов по началу занятий бегом',
    author: 'Иван Смирнов'
});

console.log('Новая статья добавлена с ID:', article.id);
```

### Пример 3: Создать форум-тему через код
```javascript
for (let i = 1; i <= 3; i++) {
    dataManager.addForumPost({
        title: `Обсуждение #${i}`,
        category: ['health', 'fitness', 'career'][i - 1],
        message: `Это автоматическое сообщение #${i}`,
        author: 'Bot'
    });
}

// Обновить отображение
Renderer.renderForumPosts(dataManager.getAllForumPosts());
showNotification('✅ 3 темы добавлены');
```

### Пример 4: Экспортировать все данные
```javascript
const data = {
    articles: dataManager.getArticles(),
    forumPosts: dataManager.getForumPosts(),
    exportedAt: new Date().toLocaleString('ru-RU')
};

console.log(JSON.stringify(data, null, 2));

// Или сохранить в файл
const link = document.createElement('a');
link.href = 'data:text/json,' + encodeURIComponent(JSON.stringify(data));
link.download = 'man-ru-backup.json';
link.click();
```

### Пример 5: Импортировать данные
```javascript
const importData = {
    articles: [
        {
            title: "Импортированная статья",
            category: "tech",
            description: "Описание",
            author: "Источник"
        }
    ],
    forumPosts: []
};

// Добавить каждую статью
importData.articles.forEach(article => {
    dataManager.addArticle(article);
});

// Обновить отображение
Renderer.renderArticles(dataManager.getArticles());
showNotification(`✅ Импортировано ${importData.articles.length} статей`);
```

### Пример 6: Поиск и фильтрация
```javascript
// Функция для поиска
function searchArticles(keyword) {
    const results = dataManager.getArticlesByFilter(keyword);
    Renderer.renderArticles(results);
    return results;
}

// Использование
const results = searchArticles('тренировка');
console.log(`Найдено ${results.length} результатов`);
```

### Пример 7: Получить статистику
```javascript
const stats = {
    totalArticles: dataManager.getArticles().length,
    totalPosts: dataManager.getForumPosts().length,
    byCategory: {}
};

// Подсчитать по категориям
['health', 'fitness', 'career', 'tech', 'style', 'relations'].forEach(cat => {
    stats.byCategory[cat] = {
        articles: dataManager.getArticlesByCategory(cat).length,
        posts: dataManager.getForumPostsByCategory(cat).length
    };
});

console.table(stats);
```

### Пример 8: Открыть форум программно
```javascript
Modal.open('forumModal');
Renderer.renderForumPosts(dataManager.getAllForumPosts());
```

### Пример 9: Массовое удаление постов категории
```javascript
function deletePostsByCategory(category) {
    const posts = dataManager.getForumPostsByCategory(category);
    posts.forEach(post => {
        dataManager.deleteForumPost(post.id);
    });
    showNotification(`✅ Удалено ${posts.length} постов из ${Renderer.getCategoryName(category)}`);
}

// Использование
deletePostsByCategory('fitness');
```

### Пример 10: Создать резервную копию
```javascript
function createBackup() {
    const backup = {
        version: 2,
        createdAt: new Date().toISOString(),
        articles: dataManager.getArticles(),
        forumPosts: dataManager.getForumPosts()
    };
    
    localStorage.setItem('man_ru_backup_' + Date.now(), JSON.stringify(backup));
    showNotification('✅ Резервная копия создана');
    return backup;
}

// Использование
createBackup();
```

---

## localStorage структура

### Ключи хранилища

#### `man_ru_articles`
JSON-массив объектов статей:
```json
[
    {
        "id": 1,
        "title": "Заголовок",
        "category": "fitness",
        "description": "Описание",
        "author": "Автор",
        "date": "14 января",
        "views": "2.4K"
    }
]
```

#### `man_ru_forum_posts`
JSON-массив объектов форум-постов:
```json
[
    {
        "id": 1,
        "title": "Название темы",
        "category": "career",
        "message": "Текст сообщения",
        "author": "Автор",
        "date": "2024-01-14 14:30:45",
        "comments": 73
    }
]
```

### Доступ к localStorage

```javascript
// Получить сырые данные
const articlesJSON = localStorage.getItem('man_ru_articles');
const articles = JSON.parse(articlesJSON);

// Установить новые данные
const newData = [/* массив статей */];
localStorage.setItem('man_ru_articles', JSON.stringify(newData));

// Удалить конкретный ключ
localStorage.removeItem('man_ru_articles');

// Очистить всё
localStorage.clear();

// Размер хранилища
console.log('Объём данных:', JSON.stringify(localStorage).length, 'байт');
```

---

## Интеграция с другими системами

### С внешним API
```javascript
// Загрузить статьи с сервера
async function loadArticlesFromServer(url) {
    const response = await fetch(url);
    const articles = await response.json();
    
    // Добавить в локальное хранилище
    articles.forEach(article => {
        dataManager.addArticle(article);
    });
    
    Renderer.renderArticles(dataManager.getArticles());
}
```

### С другой библиотекой данных
```javascript
// Синхронизировать с Firebase, например
function syncWithFirebase(userId) {
    const data = {
        articles: dataManager.getArticles(),
        posts: dataManager.getForumPosts()
    };
    
    // Отправить на сервер
    fetch(`/api/users/${userId}/data`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
}
```

---

**Вопросы? Смотрите примеры в файле test.html или создавайте собственные расширения!**
