document.getElementById('view-properties-btn').addEventListener('click', () => {
    // Переход на страницу с отображением недвижимости
    window.location.href = 'properties.html';  // Здесь предполагается, что страница с недвижимостью называется properties.html
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userId');
    window.location.href = "../index.html"; // Возвращаемся на страницу входа
});

