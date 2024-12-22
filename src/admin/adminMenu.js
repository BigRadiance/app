// Функция для обработки кнопок меню
document.getElementById('manage-users-btn').addEventListener('click', () => {
    window.location.href = "AmanageUsers.html";
});

document.getElementById("manage-properties-btn").addEventListener("click", () => { 
        window.location.href = "AmanageProperties.html";
    });



document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = "../index.html"; // Возвращаемся на страницу входа
});

