// Заполнение таблицы свойств
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
            <td><button class="reserve-btn" data-id="${property.id}">Забронировать</button></td>
            <td><button class="reserve-btn2" data-id="${property.id}">Отменить</button></td>
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
                    location.reload();
                } else {
                    alert('Ошибка при бронировании недвижимости: ' + response.message);
                }
            } catch (error) {
                console.error("Ошибка при бронировании недвижимости:", error);
                alert('Что-то пошло не так, попробуйте позже.');
            }
        });
    });

    // Привязка обработчиков к кнопкам отмены бронирования
    document.querySelectorAll('.reserve-btn2').forEach(button => {
        button.addEventListener('click', async (event) => {
            const propertyId = event.target.dataset.id;

            // Переносим вызов получения userId в этот блок
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('Пожалуйста, войдите в систему, чтобы отменить бронирование.');
                return;
            }

            try {
                const response = await window.api.cancelReservation(propertyId, userId);
                if (response.success) {
                    alert('Бронирование успешно отменено!');
                    event.target.textContent = 'Отменено';
                    event.target.disabled = true; // Отключаем кнопку
                    // Обновляем статус недвижимости, например, в строке таблицы
                    const row = event.target.closest('tr');
                    const statusCell = row.querySelector('.status-cell');
                    if (statusCell) {
                        statusCell.textContent = 'Активен';  // Статус возвращается к "Активен"
                    }
                } else {
                    alert('Ошибка при отмене бронирования: ' + response.message);
                }
            } catch (error) {
                console.error("Ошибка при отмене бронирования:", error);
                alert('Что-то пошло не так, попробуйте позже.');
            }
        });
    });
}).catch(error => {
    console.error("Ошибка при получении данных о недвижимости:", error);
    alert('Не удалось загрузить список недвижимости.');
});
// Обработчик кнопки «Назад»
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = "userMenu.html";  // Возвращаемся в меню
});