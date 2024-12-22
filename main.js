const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db/db');  // Подключаем базу данных

// Динамический импорт для модуля electron-is-dev
let isDev;
(async () => {
    isDev = (await import('electron-is-dev')).default;
})();

let mainWindow;
let currentUser = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Функция для регистрации супер админа, если его нет в базе
db.serialize(() => {
    db.get("SELECT * FROM users WHERE username = 'superadmin'", (err, row) => {
        if (!row) {
            // Создаем супер администратора, если его нет
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)", ['superadmin', hashedPassword, 'admin@admin.com', 'super_admin']);
        }
    });
});

// Обработчик для логина
ipcMain.handle('login', async (event, { loginOrEmail, password }) => {
    const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = ? OR email = ?", [loginOrEmail, loginOrEmail], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });

    if (!user) {
        return { success: false, message: "User not found" };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return { success: false, message: "Incorrect password" };
    }

    // Загружаем меню в зависимости от роли, если окно еще не открыто
    if (user.role === 'super_admin') {
        if (mainWindow.webContents.getURL() !== `file://${path.join(__dirname, 'src', 'superadmin', 'superAdminMenu.html')}`) {
            mainWindow.loadFile(path.join(__dirname, 'src', 'superadmin', 'superAdminMenu.html'));
        }
    } else if (user.role === 'admin') {
        if (mainWindow.webContents.getURL() !== `file://${path.join(__dirname, 'src', 'admin', 'adminMenu.html')}`) {
            mainWindow.loadFile(path.join(__dirname, 'src', 'admin', 'adminMenu.html'));
        }
    } else if (user.role === 'user') {
        if (mainWindow.webContents.getURL() !== `file://${path.join(__dirname, 'src', 'user', 'userMenu.html')}`) {
            mainWindow.loadFile(path.join(__dirname, 'src', 'user', 'userMenu.html'));
        }
    }

    return { success: true, role: user.role };
});

// Обработчик для регистрации нового пользователя
ipcMain.handle('register', async (event, { username, password, email, phone }) => {
    const existingUser = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });

    if (existingUser) {
        return { success: false, message: "Username already taken" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roles = ['super_admin', 'admin', 'user'];
    let role = 'user'; // Default role
    if (username === 'admin') {
        role = 'admin';
    } else if (username === 'superadmin') {
        role = 'super_admin';
    }

    await new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)",
            [username, hashedPassword, email, phone, role],
            (err) => {
                if (err) reject(err);
                resolve();
            }
        );
    });

    return { success: true };
});

// Запуск окна
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Закрытие приложения
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// Обработчик для обновления роли пользователя
ipcMain.handle('updateUserRole', async (event, userId, newRole) => {
    try {
        // Пример SQL запроса для обновления роли пользователя
        const sql = 'UPDATE users SET role = ? WHERE id = ?';
        await new Promise((resolve, reject) => {
            db.run(sql, [newRole, userId], (err) => {
                if (err) {
                    reject(err); // Ошибка в запросе
                } else {
                    resolve(); // Успешное выполнение
                }
            });
        });

        return { success: true }; // Если все прошло успешно
    } catch (error) {
        console.error("Ошибка при обновлении роли:", error);
        return { success: false, message: "Не удалось обновить роль" }; // Возвращаем ошибку
    }
});

ipcMain.handle('getAllUsers', async () => {
    try {
        const users = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM users", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        return users;
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        return [];
    }
});

ipcMain.handle('updateUser', async (event, { id, role }) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.run("UPDATE users SET role = ? WHERE id = ?", [role, id], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });

        return result > 0 ? { success: true } : { success: false };
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);
        return { success: false };
    }
});



ipcMain.handle('deleteUser', async (event, { id }) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });

        return result > 0 ? { success: true } : { success: false };
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        return { success: false };
    }
});
ipcMain.on('open-manage-properties', () => {
    createManagePropertiesWindow();
});
// Получение всех свойств
ipcMain.handle('getProperties', (event) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM properties', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

// Добавление недвижимости
ipcMain.handle("addProperty", async (_, { title, description, price, address }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO properties (title, description, price, status, address) VALUES (?, ?, ?, 'активен', ?)",  // добавляем ? для address
            [title, description, price, address],  // передаем address как параметр
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            }
        );
    });
});


// Редактирование недвижимости
ipcMain.handle("editProperty", async (_, { id, title, description, price, address }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE properties SET title = ?, description = ?, price = ?, address = ? WHERE id = ?",
            [title, description, price, address, id],  // передаем address как параметр
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});


// Удаление недвижимости
ipcMain.handle('deleteProperty', (event, id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM properties WHERE id = ?', [id], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

// Изменение статуса недвижимости
ipcMain.handle("updatePropertyStatus", async (_, { id, status }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE properties SET status = ? WHERE id = ?",
            [status, id],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});

// Обработчик для бронирования недвижимости
ipcMain.handle('reserveProperty', (event, propertyId, userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE properties 
            SET booked_by = ?, status = 'booked' 
            WHERE id = ? AND status = 'available'
        `;
        db.run(query, [userId, propertyId], function (err) {
            if (err) {
                console.error("Ошибка при бронировании недвижимости:", err.message);
                return resolve({ success: false, message: 'Ошибка при бронировании недвижимости' });
            }
            if (this.changes === 0) {
                console.log("Недвижимость уже забронирована или изменен статус");
                return resolve({ success: false, message: 'Недвижимость уже забронирована' });
            }
            console.log("Недвижимость забронирована", propertyId);
            resolve({ success: true });
        });
    });
});

// Обработка разрыва бронирования супер админом
ipcMain.handle('cancelReservation', (event, propertyId) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE properties SET status = "available", booked_by = NULL WHERE id = ?', [propertyId], function(err) {
            if (err) {
                return reject({ success: false, message: "Ошибка при отмене бронирования" });
            }
            resolve({ success: true });
        });
    });
});