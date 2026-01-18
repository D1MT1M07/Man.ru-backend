#!/bin/bash

# Запуск server в фоне и тестирование

echo "🚀 Запускаем server..."
npm start &
SERVER_PID=$!

echo "⏳ Ждём запуска сервера..."
sleep 5

echo ""
echo "🧪 Запускаем тесты..."
node test-api.js
TEST_RESULT=$?

echo ""
echo "🛑 Останавливаем server..."
kill $SERVER_PID 2>/dev/null

exit $TEST_RESULT
