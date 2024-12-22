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
                <td>${property.status}</td>
                <td><button class="edit-btn" data-id="${property.id}">Редактировать</button></td>
            `;
        tableBody.appendChild(row);
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
    window.location.href = "adminMenu.html";  // Возвращаемся в меню
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
    openModal("Добавить недвижимость");
});

window.addEventListener("beforeunload", () => {
    closeModal();
});

