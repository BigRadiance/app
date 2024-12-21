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

// Создание таблицы недвижимости, если она не существует
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            address TEXT,
            price REAL,
            status TEXT DEFAULT 'available',
            booked_by INTEGER,
            FOREIGN KEY (booked_by) REFERENCES users(id) ON DELETE SET NULL
        );
    `, (err) => {
        if (err) {
            console.error("Ошибка при создании таблицы недвижимости:", err.message);
        }
    });
});

module.exports = db;
