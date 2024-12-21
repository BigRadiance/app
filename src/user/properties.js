document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = "userMenu.html"; // Переход к меню пользователя
    });

    // Получаем данные о недвижимости и заполняем таблицу
    window.api.getProperties().then(properties => {
        const tableBody = document.querySelector("#properties-table tbody");
        properties.forEach(property => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${property.title}</td>
                <td>${property.description}</td>
                <td>${property.price}</td>
                <td>${property.address}</td>
                <td>${property.status}</td>
                <td>
                    <button class="reserve-btn" data-id="${property.id}">Забронировать</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Добавляем обработчики для кнопок "Забронировать"
        document.querySelectorAll('.reserve-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
        const propertyId = event.target.getAttribute('data-id'); // Получаем ID недвижимости
        const username = await window.api.getCurrentUser(); // Получаем логин текущего пользователя

        try {
            const result = await window.api.reserveProperty({ propertyId, username });
            if (result.success) {
                alert('Недвижимость успешно забронирована!');
                location.reload(); // Перезагрузить страницу или обновить данные
            }
        } catch (error) {
            console.error('Ошибка бронирования:', error.message);
            alert('Не удалось забронировать недвижимость: ' + error.message);
        }
    });
});

    }).catch(error => {
        console.error("Ошибка при получении данных о недвижимости:", error);
    });
});
