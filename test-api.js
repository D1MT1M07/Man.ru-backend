#!/usr/bin/env node

/**
 * Простой тест для API
 * Запуск: node test-api.js
 */

import http from 'http';

function testAPI(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data.substring(0, 500) // Первые 500 символов
                });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Тестирование API...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣  Проверка health endpoint...');
        const health = await testAPI('GET', '/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Body: ${health.body}\n`);

        // Test 2: Registration
        console.log('2️⃣  Тест регистрации (ошибка)...');
        const reg = await testAPI('POST', '/api/auth/register', {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log(`   Status: ${reg.status}`);
        console.log(`   Body: ${reg.body}`);
        console.log(`   Content-Type: ${reg.headers['content-type']}\n`);

        // Test 3: Static file
        console.log('3️⃣  Запрос статического файла (index.html)...');
        const static = await testAPI('GET', '/index.html');
        console.log(`   Status: ${static.status}`);
        console.log(`   Body length: ${static.body.length}`);
        console.log(`   Body preview: ${static.body.substring(0, 100)}...\n`);

        console.log('✅ Тесты завершены!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        process.exit(1);
    }
}

// Wait for server to start
setTimeout(runTests, 2000);
