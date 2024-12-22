
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
console.log("Настройка обработчика submit");
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    console.log('Submit event triggered');
    event.preventDefault();
    
    const usernameOrEmail = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    document.getElementById('login-error').style.display = 'none';

    const response = await window.api.login(usernameOrEmail, password);
    console.log('Login Response:', response);

    if (response.success) {
        // Сохраняем userId в localStorage после успешного входа
        localStorage.setItem('userId', response.userId);

        // Открываем соответствующее меню в зависимости от роли
        openMenu(response.role);

        console.log('User ID stored in localStorage:', response.userId);
    } else {
      console.error('Форма loginForm не найдена');
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
        alert('Регистрация прошла успешно. Теперь вы можете войти.');
        window.location.reload();
    } else {
        displayError('register-error', response.message);
    }
});

// Функция отображения ошибок
function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Функция перехода в меню в зависимости от роли
function openMenu(role) {
    switch (role) {
        case 'super_admin':
            showSuperAdminMenu();
            break;
        case 'admin':
            showAdminMenu();
            break;
        case 'user':
            showUserMenu();
            break;
        default:
            console.error('Неизвестная роль:', role);
    }
}

// Функции для отображения меню
function showSuperAdminMenu() {
    window.location.href = 'superadmin/superAdminMenu.html';
}

function showAdminMenu() {
    window.location.href = 'admin/adminMenu.html';
}

function showUserMenu() {
    window.location.href = 'user/userMenu.html';
}

// Получение всех пользователей
window.api.getAllUsers = async () => await ipcRenderer.invoke('getAllUsers');

// Обновление пользователя
window.api.updateUser = async (userData) => await ipcRenderer.invoke('updateUser', userData);

// Удаление пользователя
window.api.deleteUser = async (userId) => await ipcRenderer.invoke('deleteUser', userId);

// Обработчик смены роли пользователя
async function handleRoleChange(event) {
    const userId = event.target.getAttribute('data-id');
    const newRole = event.target.value;

    try {
        const result = await window.api.updateUserRole(userId, newRole);
        if (result.success) {
            alert('Роль успешно обновлена!');
        } else {
            alert(result.message || 'Не удалось обновить роль.');
        }
    } catch (error) {
        console.error('Ошибка при обновлении роли:', error);
        alert('Не удалось обновить роль.');
    }
}
