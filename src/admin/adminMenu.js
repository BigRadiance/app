// Функция для обработки кнопок меню
document.getElementById('manage-users-btn').addEventListener('click', () => {
    window.location.href = "AmanageUsers.html";
});

document.getElementById("manage-properties-btn").addEventListener("click", () => { 
        window.location.href = "AmanageProperties.html";
    });



document.getElementById('logout-btn').addEventListener('click', () => {
    // Логика выхода из системы, если нужно
    window.location.href = "../index.html";  // Вернуться на страницу логина
});
