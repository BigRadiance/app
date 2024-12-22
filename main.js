const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db/db'); // Подключение базы данных

// Динамический импорт electron-is-dev
let isDev;
(async () => {
    isDev = (await import('electron-is-dev')).default;
})();

let mainWindow;

// Функция создания главного окна
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

// Функция создания супер админа
db.serialize(() => {
    db.get("SELECT * FROM users WHERE username = 'superadmin'", (err, row) => {
        if (!row) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)", ['superadmin', hashedPassword, 'admin@admin.com', 'super_admin']);
        }
    });
});

// Обработчики логина и регистрации
ipcMain.handle('login', async (event, { loginOrEmail, password }) => {
    try {
        // Получаем пользователя по имени или email
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ? OR email = ?", [loginOrEmail, loginOrEmail], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        // Если пользователь не найден
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // Проверка пароля
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return { success: false, message: "Incorrect password" };
        }

        // Сохраняем ID текущего пользователя в глобальную переменную
        global.currentUserId = user.id;

        // Страницы для различных ролей
        const rolePages = {
            super_admin: 'superadmin/superAdminMenu.html',
            admin: 'admin/adminMenu.html',
            user: 'user/userMenu.html',
        };

        // Загружаем соответствующую страницу в зависимости от роли пользователя
        if (rolePages[user.role]) {
            mainWindow.loadFile(path.join(__dirname, 'src', rolePages[user.role]));
        }

        // Возвращаем успешный ответ и роль пользователя
        return { success: true, role: user.role };
    } catch (error) {
        console.error('Ошибка при обработке логина:', error);
        return { success: false, message: 'Произошла ошибка при входе' };
    }
});


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
    const role = username === 'superadmin' ? 'super_admin' : username === 'admin' ? 'admin' : 'user';

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

// Управление пользователями
ipcMain.handle('updateUserRole', async (event, userId, newRole) => {
    try {
        const sql = 'UPDATE users SET role = ? WHERE id = ?';
        await new Promise((resolve, reject) => {
            db.run(sql, [newRole, userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        return { success: true };
    } catch (error) {
        return { success: false, message: "Failed to update role" };
    }
});

ipcMain.handle('getAllUsers', async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
});

// Управление недвижимостью
ipcMain.handle('getProperties', () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM properties', (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
});

ipcMain.handle('addProperty', async (_, { title, description, price, address }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO properties (title, description, price, status, address) VALUES (?, ?, ?, 'активен', ?)",
            [title, description, price, address],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            }
        );
    });
});

ipcMain.handle('editProperty', async (_, { id, title, description, price, address }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE properties SET title = ?, description = ?, price = ?, address = ? WHERE id = ?",
            [title, description, price, address, id],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});

ipcMain.handle('deleteProperty', (event, id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM properties WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
});

ipcMain.handle('updatePropertyStatus', async (_, { id, status }) => {
    return new Promise((resolve, reject) => {
        db.run("UPDATE properties SET status = ? WHERE id = ?", [status, id], function (err) {
            if (err) reject(err);
            else resolve({ success: true });
        });
    });
});

ipcMain.handle('getCurrentUserId', async (event) => {
    try {
        if (!global.currentUserId) {
            throw new Error('Текущий пользователь не определён');
        }
        console.log(`Возвращается текущий пользователь с ID: ${global.currentUserId}`);
        return global.currentUserId;
    } catch (error) {
        console.error('Ошибка при получении текущего пользователя:', error);
        throw error;
    }
});

//Бронирование
ipcMain.handle('reserveProperty', (event, propertyId, userId) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE properties SET booked_by = ?, status = 'забронирован' WHERE id = ? AND status = 'активен'",
            [userId, propertyId],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});

// Обработчик отмены бронирования
ipcMain.handle('cancelReservation', (event, { propertyId, userId }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE properties SET booked_by = NULL, status = 'активен' WHERE id = ? AND booked_by = ?",
            [propertyId, userId],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});

// Инициализация приложения
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
