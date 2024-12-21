document.addEventListener("DOMContentLoaded", async () => {
    try {
        const users = await window.api.getAllUsers();
        console.log("Полученные пользователи:", users);

        const userTableBody = document.getElementById("user-table-body");

        // Проверяем наличие таблицы
        if (!userTableBody) {
            console.error("Ошибка: Элемент с id 'user-table-body' не найден.");
            return;
        }

        userTableBody.innerHTML = ""; // Очищаем таблицу

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                    <select class="role-select" data-id="${user.id}">
                        <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                        <option value="super_admin" ${user.role === "super_admin" ? "selected" : ""}>Super Admin</option>
                    </select>
                </td>
                <td>
                    <button class="delete-user-btn" data-id="${user.id}">Удалить</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Добавляем обработчики событий
        initializeEventHandlers();
    } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
    }

    // Добавляем обработчик для кнопки "Назад"
    const backButton = document.getElementById("back-btn");
    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "../superadmin/superAdminMenu.html";
        });
    } else {
        console.error("Ошибка: Кнопка 'Назад' не найдена.");
    }
});

function initializeEventHandlers() {
    // Обработчик изменения роли
    document.querySelectorAll(".role-select").forEach(select => {
        select.addEventListener("change", async (event) => {
            const userId = event.target.getAttribute("data-id");
            const newRole = event.target.value;

            try {
                await window.api.updateUserRole(userId, newRole);
                alert("Роль успешно обновлена!");
            } catch (error) {
                console.error("Ошибка при обновлении роли:", error);
                alert("Не удалось обновить роль.");
            }
        });
    });

    // Обработчик удаления пользователя
    document.querySelectorAll(".delete-user-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const userId = event.target.getAttribute("data-id");

            if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
                try {
                    await window.api.deleteUser(userId);
                    alert("Пользователь успешно удалён!");
                    // Перезагружаем данные пользователей
                    location.reload();
                } catch (error) {
                    console.error("Ошибка при удалении пользователя:", error);
                    alert("Не удалось удалить пользователя.");
                }
            }
        });
    });
}
