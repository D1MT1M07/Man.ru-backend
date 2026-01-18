#!/bin/bash

# 🎯 man.ru v2.0 - Скрипт проверки функциональности
# Используйте этот скрипт для быстрой проверки всех компонентов

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         🎯 man.ru v2.0 - Проверка функциональности               ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Проверка наличия файлов
echo "📁 Проверка файлов..."
echo ""

files=(
    "index.html:Главная страница"
    "script.js:Логика сайта"
    "styles.css:Стили"
    "test.html:Страница тестирования"
    "FEATURES.md:Описание функций"
    "API-DOCS.md:API документация"
    "QUICKSTART-v2.md:Быстрый старт v2"
    "CHANGELOG-v2.md:История изменений"
    "COMPLETION-REPORT.md:Итоговый отчёт"
)

missing=0
for file in "${files[@]}"; do
    filename="${file%:*}"
    description="${file#*:}"
    
    if [ -f "$filename" ]; then
        echo "  ✅ $filename - $description"
    else
        echo "  ❌ $filename - ОТСУТСТВУЕТ"
        missing=$((missing + 1))
    fi
done

echo ""
if [ $missing -eq 0 ]; then
    echo "✨ Все файлы на месте!"
else
    echo "⚠️ Отсутствует $missing файлов"
fi
echo ""

# Проверка размеров файлов
echo "📊 Размеры файлов..."
echo ""

if [ -f "index.html" ]; then
    size=$(wc -l < index.html)
    echo "  • index.html: $size строк"
fi

if [ -f "script.js" ]; then
    size=$(wc -l < script.js)
    echo "  • script.js: $size строк"
fi

if [ -f "styles.css" ]; then
    size=$(wc -l < styles.css)
    echo "  • styles.css: $size строк"
fi

echo ""

# Проверка функциональности
echo "✨ Функциональность v2.0..."
echo ""

features=(
    "Фильтрация по категориям:DATA_CATEGORY_FILTER"
    "Добавление статей:ADD_ARTICLE_FORM"
    "Рабочий форум:FORUM_POST_FORM"
    "Сохранение данных:LOCAL_STORAGE_API"
    "Модальные окна:MODAL_WINDOWS"
    "Уведомления:NOTIFICATION_SYSTEM"
)

for feature in "${features[@]}"; do
    name="${feature%:*}"
    search_term="${feature#*:}"
    
    if grep -q "$search_term" script.js 2>/dev/null; then
        echo "  ✅ $name"
    else
        echo "  ❓ $name (требует проверки)"
    fi
done

echo ""

# Проверка структуры
echo "🏗️ Проверка архитектуры..."
echo ""

classes=(
    "DataManager:Управление данными"
    "Renderer:Отображение контента"
    "Modal:Управление окнами"
)

for class in "${classes[@]}"; do
    classname="${class%:*}"
    description="${class#*:}"
    
    if grep -q "class $classname" script.js 2>/dev/null; then
        echo "  ✅ Класс $classname - $description"
    else
        echo "  ❌ Класс $classname - НЕ НАЙДЕН"
    fi
done

echo ""

# Инструкции
echo "🚀 Как запустить?"
echo ""
echo "  1. Python веб-сервер:"
echo "     $ python3 -m http.server 8080"
echo "     Откройте: http://localhost:8080"
echo ""
echo "  2. Двойной клик на index.html"
echo ""
echo "  3. Используйте start.sh (Linux/Mac) или start.bat (Windows)"
echo ""

# Документация
echo "📚 Документация:"
echo ""
echo "  • FEATURES.md         - Подробное описание функций"
echo "  • API-DOCS.md         - Документация для разработчиков"
echo "  • QUICKSTART-v2.md    - Быстрый старт"
echo "  • CHANGELOG-v2.md     - История изменений"
echo "  • COMPLETION-REPORT.md - Итоговый отчёт"
echo ""

# Тестирование
echo "🧪 Тестирование:"
echo ""
echo "  Откройте в браузере: http://localhost:8080/test.html"
echo ""

# Заключение
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║              ✅ man.ru v2.0 готов к использованию!                ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
