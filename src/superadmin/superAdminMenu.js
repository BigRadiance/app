// Функция для обработки кнопок меню
document.getElementById('manage-users-btn').addEventListener('click', () => {
    window.location.href = "manageUsers.html";
});

document.getElementById("manage-properties-btn").addEventListener("click", () => { 
        window.location.href = "manageProperties.html";
    });

document.getElementById('settings-btn').addEventListener('click', () => {
    alert("Настройки пока не реализованы.");
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = "../index.html"; // Возвращаемся на страницу входа
});

