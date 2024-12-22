const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, '..', 'electron_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite');
    }
});

// Создание таблицы пользователей, если она не существует
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE
        );
    `, (err) => {
        if (err) {
            console.error("Ошибка при создании или изменении таблицы пользователей:", err.message);
        }
    });
});

// Обновленная структура таблицы недвижимости
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            price REAL,
            status TEXT DEFAULT 'активен',  -- Статус по умолчанию
            address TEXT,
            reserved_by INTEGER,
            booked_by INTEGER,
            FOREIGN KEY (reserved_by) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (booked_by) REFERENCES users(id) ON DELETE SET NULL
        );
    `, (err) => {
        if (err) {
            console.error("Ошибка при создании или изменении таблицы недвижимости:", err.message);
        }
    });
});

module.exports = db;
