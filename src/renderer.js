// Переключение на форму регистрации
document.getElementById('register-btn').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    // Очищаем поля регистрации
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('register-error').style.display = 'none';

    // Разблокируем поля
    document.getElementById('reg-username').disabled = false;
    document.getElementById('reg-password').disabled = false;
    document.getElementById('reg-email').disabled = false;
});

// Переключение обратно на форму логина
document.getElementById('back-to-login-btn').addEventListener('click', () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    // Очищаем поля логина
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';

    // Разблокируем поля
    document.getElementById('username').disabled = false;
    document.getElementById('password').disabled = false;
});

// Обработчик формы логина
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const usernameOrEmail = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Скрываем ошибку и разблокируем поля ввода перед отправкой запроса
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('username').disabled = false;
    document.getElementById('password').disabled = false;

    const response = await window.api.login(usernameOrEmail, password);

    if (response.success) {
        // Переход в меню в зависимости от роли
        openMenu(response.role);
    } else {
        // Отображаем ошибку, если логин не удался
        displayError('login-error', response.message);
    }
});

// Обработчик формы регистрации
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;

    const response = await window.api.register(username, password, email, phone);

    if (response.success) {
        alert("Регистрация прошла успешно. Можно входить.");
        window.location.reload();
    } else {
        displayError('register-error', response.message);
    }
});


// Функция для отображения ошибок
function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Функция для перехода в меню
function openMenu(role) {
    // В зависимости от роли показываем разные меню
    // Вместо перехода на другую страницу, будем показывать нужные элементы на текущей странице
    switch (role) {
        case 'super_admin':
            // Здесь можно скрыть или показать элементы, связанные с супер админом
            showSuperAdminMenu();
            break;
        case 'admin':
            // Аналогично для админа
            showAdminMenu();
            break;
        case 'user':
            // Для обычного пользователя
            showUserMenu();
            break;
        default:
            break;
    }
}

// Функции для показа меню в зависимости от роли
function showSuperAdminMenu() {
    document.getElementById('superadmin-menu').style.display = 'block';
    document.getElementById('admin-menu').style.display = 'none';
    document.getElementById('user-menu').style.display = 'none';
}

function showAdminMenu() {
    document.getElementById('superadmin-menu').style.display = 'none';
    document.getElementById('admin-menu').style.display = 'block';
    document.getElementById('user-menu').style.display = 'none';
}

function showUserMenu() {
    document.getElementById('superadmin-menu').style.display = 'none';
    document.getElementById('admin-menu').style.display = 'none';
    document.getElementById('user-menu').style.display = 'block';
}

// Получение всех пользователей
window.api.getAllUsers = async () => {
    return await ipcRenderer.invoke('getAllUsers');
};

// Обновление пользователя
window.api.updateUser = async (userData) => {
    return await ipcRenderer.invoke('updateUser', userData);
};

// Удаление пользователя
window.api.deleteUser = async (userId) => {
    return await ipcRenderer.invoke('deleteUser', userId);
};
async function handleRoleChange(event) {
    const userId = event.target.getAttribute("data-id");
    const newRole = event.target.value;

    try {
        const result = await window.api.updateUserRole(userId, newRole); // Вызываем IPC
        if (result.success) {
            alert("Роль успешно обновлена!");
        } else {
            alert(result.message || "Не удалось обновить роль.");
        }
    } catch (error) {
        console.error("Ошибка при обновлении роли:", error);
        alert("Не удалось обновить роль.");
    }
}
