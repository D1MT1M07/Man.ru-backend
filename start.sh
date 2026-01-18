#!/bin/bash
# СКРИПТ ДЛЯ ЗАПУСКА man.ru ПРОТОТИПА
# man.ru Prototype - Start Script

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     man.ru - Prototype Web Server${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Проверка наличия файлов
if [ ! -f "index.html" ]; then
    echo -e "${RED}✗ Ошибка: index.html не найден${NC}"
    echo -e "${YELLOW}Убедитесь, что вы находитесь в директории с проектом${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Файлы проекта найдены${NC}"
echo ""

# Определение операционной системы
OS="$(uname)"

# Попытка запустить Python сервер (предпочтительно)
if command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Запуск HTTP сервера (Python 3)...${NC}"
    echo ""
    echo -e "${BLUE}Откройте в браузере:${NC}"
    echo -e "${GREEN}http://localhost:8000${NC}"
    echo ""
    echo -e "${YELLOW}Нажмите Ctrl+C для остановки сервера${NC}"
    echo ""
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo -e "${YELLOW}Запуск HTTP сервера (Python 2)...${NC}"
    echo ""
    echo -e "${BLUE}Откройте в браузере:${NC}"
    echo -e "${GREEN}http://localhost:8000${NC}"
    echo ""
    echo -e "${YELLOW}Нажмите Ctrl+C для остановки сервера${NC}"
    echo ""
    python -m SimpleHTTPServer 8000
    
elif command -v php &> /dev/null; then
    echo -e "${YELLOW}Запуск HTTP сервера (PHP)...${NC}"
    echo ""
    echo -e "${BLUE}Откройте в браузере:${NC}"
    echo -e "${GREEN}http://localhost:8000${NC}"
    echo ""
    echo -e "${YELLOW}Нажмите Ctrl+C для остановки сервера${NC}"
    echo ""
    php -S localhost:8000
    
elif command -v npx &> /dev/null; then
    echo -e "${YELLOW}Запуск HTTP сервера (Node.js - http-server)...${NC}"
    echo ""
    npx http-server -p 8000
    
else
    echo -e "${RED}✗ Ошибка: Не найден ни один HTTP сервер${NC}"
    echo ""
    echo -e "${YELLOW}Установите одно из следующего:${NC}"
    echo "  • Python 3: sudo apt install python3"
    echo "  • PHP: sudo apt install php-cli"
    echo "  • Node.js: sudo apt install nodejs"
    echo ""
    echo -e "${YELLOW}Или откройте index.html напрямую в браузере${NC}"
    exit 1
fi
