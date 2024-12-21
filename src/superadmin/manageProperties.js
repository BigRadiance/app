// Получаем данные о недвижимости при загрузке страницы
window.api.getProperties().then(properties => {
    const tableBody = document.querySelector("#properties-table tbody");
    properties.forEach(property => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${property.id}</td>
                <td>${property.title}</td>
                <td>${property.description}</td>
                <td>${property.price}</td>
                <td>${property.address}</td> 
                <td>
                    <select class="status-select" data-id="${property.id}">
                        <option value="активен" ${property.status === "активен" ? "selected" : ""}>Активен</option>
                        <option value="продан" ${property.status === "продан" ? "selected" : ""}>Продан</option>
                        <option value="арендован" ${property.status === "арендован" ? "selected" : ""}>Арендован</option>
                        <option value="забронирован" ${property.status === "забронирован" ? "selected" : ""}>Забронирован</option>
                    </select>
                </td>
                <td><button class="edit-btn" data-id="${property.id}">Редактировать</button></td>
                <td><button class="delete-btn" data-id="${property.id}">Удалить</button></td>
            `;
        tableBody.appendChild(row);
    });
    // Обработчик изменения статуса
        document.querySelectorAll(".status-select").forEach((select) => {
            select.addEventListener("change", async (event) => {
                const propertyId = event.target.getAttribute("data-id");
                const newStatus = event.target.value;

                try {
                    await window.api.updatePropertyStatus(propertyId, newStatus);
                    alert("Статус успешно обновлен!");
                } catch (error) {
                    console.error("Ошибка обновления статуса:", error);
                    alert("Не удалось обновить статус.");
                }
            });
        });

    // Обработчик для кнопки удаления
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const propertyId = event.target.getAttribute("data-id");
            await window.api.deleteProperty(propertyId);
            setTimeout(() => {
    window.location.reload();
}, 100);  // Небольшая задержка перед перезагрузкой страницы

        });
    });

    // Обработчик для кнопки редактирования
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", event => {
            const propertyId = event.target.getAttribute("data-id");
            const property = properties.find(p => p.id === parseInt(propertyId));
            openModal("Редактировать недвижимость", property);

        });
    });
}).catch(error => {
    console.error("Ошибка при получении данных о недвижимости:", error);
});

// Обработчик кнопки «Назад»
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = "superAdminMenu.html";  // Возвращаемся в меню
});

// Модальное окно для редактирования и добавления недвижимости
const modal = document.getElementById("property-modal");
const modalTitle = document.getElementById("modal-title");
const titleInput = document.getElementById("property-title");
const descriptionInput = document.getElementById("property-description");
const priceInput = document.getElementById("property-price");
const saveButton = document.getElementById("save-property-btn");
const closeModalButton = document.getElementById("close-modal-btn");
const addressInput = document.getElementById("property-address");


let editPropertyId = null; // Для отслеживания, редактируем или добавляем

// Открыть модальное окно
function openModal(title, property = {}) {
    modal.style.display = "flex";
    modalTitle.textContent = title;

    // Если редактируем, заполняем поля
    titleInput.value = property.title || "";
    descriptionInput.value = property.description || "";
    addressInput.value = property.address || "";
    priceInput.value = property.price || "";

    editPropertyId = property.id || null;
}

// Закрыть модальное окно
function closeModal() {
    modal.style.display = "none";
    titleInput.value = "";
    descriptionInput.value = "";
    addressInput.value = "";
    priceInput.value = "";
    editPropertyId = null;
}

// Сохранить изменения
saveButton.addEventListener("click", async () => {
    const title = titleInput.value;
    const description = descriptionInput.value;
    const address = addressInput.value;
    const price = priceInput.value;


    if (title && description && price && address) {
        try {
            if (editPropertyId) {
                // Редактирование недвижимости
                await window.api.editProperty(editPropertyId, { title, description, price, address });
                alert("Недвижимость успешно обновлена!");
            } else {
                // Добавление новой недвижимости
                await window.api.addProperty({ title, description, price, address });
                alert("Недвижимость успешно добавлена!");
            }
            setTimeout(() => {
    window.location.reload();
}, 100);  // Небольшая задержка перед перезагрузкой страницы

        } catch (error) {
            console.error("Ошибка сохранения недвижимости:", error);
            alert("Не удалось сохранить данные.");
        }
    } else {
        alert("Пожалуйста, заполните все поля.");
    }
});
// Закрыть модальное окно при клике на кнопку
closeModalButton.addEventListener("click", closeModal);

// Обработчик для кнопки добавления
document.getElementById("add-property-btn").addEventListener("click", () => {
    openModal("Добавить Недвижимость");
});

window.addEventListener("beforeunload", () => {
    closeModal();
});
