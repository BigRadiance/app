// Заполнение таблицы свойств
window.api.getProperties().then(properties => {
    const tableBody = document.querySelector("#properties-table tbody");

    // Добавляем проверку, если данных нет
    if (properties.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">Нет данных о недвижимости</td></tr>`;
        return;
    }

    properties.forEach(property => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${property.title}</td>
            <td>${property.description}</td>
            <td>${property.price}</td>
            <td>${property.address}</td>
            <td>${property.status}</td>
            <td><button class="reserve-btn" data-id="${property.id}">Забронировать</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Привязка обработчиков к кнопкам бронирования после добавления всех строк
    document.querySelectorAll('.reserve-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const propertyId = event.target.getAttribute('data-id');
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                alert('Пожалуйста, войдите в систему, чтобы забронировать недвижимость.');
                return;
            }

            try {
                const response = await window.api.reserveProperty(propertyId, userId);
                if (response.success) {
                    alert('Недвижимость успешно забронирована!');
                    event.target.textContent = 'Забронировано';
                    event.target.disabled = true; // Отключаем кнопку
                } else {
                    alert('Ошибка при бронировании недвижимости: ' + response.message);
                }
            } catch (error) {
                console.error("Ошибка при бронировании недвижимости:", error);
                alert('Что-то пошло не так, попробуйте позже.');
            }
        });
    });
}).catch(error => {
    console.error("Ошибка при получении данных о недвижимости:", error);
    alert('Не удалось загрузить список недвижимости.');
});

// Обработчик кнопки Назад
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = "userMenu.html"; // Возвращаемся на страницу меню пользователя
});
