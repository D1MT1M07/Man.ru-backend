@echo off
REM СКРИПТ ДЛЯ ЗАПУСКА man.ru ПРОТОТИПА (Windows)
REM man.ru Prototype - Start Script for Windows

setlocal enabledelayedexpansion

echo ========================================
echo     man.ru - Prototype Web Server
echo ========================================
echo.

REM Проверка наличия index.html
if not exist "index.html" (
    echo ERROR: index.html not found
    echo Make sure you're in the project directory
    pause
    exit /b 1
)

echo Project files found
echo.

REM Попытка запустить Python
where python >nul 2>nul
if !errorlevel! equ 0 (
    echo Starting HTTP Server (Python)...
    echo.
    echo Open in browser: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
    goto end
)

REM Попытка запустить PHP
where php >nul 2>nul
if !errorlevel! equ 0 (
    echo Starting HTTP Server (PHP)...
    echo.
    echo Open in browser: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    php -S localhost:8000
    goto end
)

REM Попытка запустить Node.js
where npx >nul 2>nul
if !errorlevel! equ 0 (
    echo Starting HTTP Server (Node.js - http-server)...
    echo.
    echo Open in browser: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    npx http-server -p 8000
    goto end
)

REM Если ничего не найдено
echo ERROR: No HTTP server found
echo.
echo Please install one of the following:
echo   - Python: https://www.python.org/downloads/
echo   - PHP: https://www.php.net/downloads.php
echo   - Node.js: https://nodejs.org/
echo.
echo Or open index.html directly in your browser
echo.
pause
exit /b 1

:end
pause
