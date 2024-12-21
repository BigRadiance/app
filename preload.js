const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Управление недвижимостью
    getProperties: () => ipcRenderer.invoke('getProperties'),
    deleteProperty: (id) => ipcRenderer.invoke('deleteProperty', id),
    addProperty: (property) => ipcRenderer.invoke('addProperty', property),
    editProperty: (id, property) => ipcRenderer.invoke('editProperty', { id, ...property }),
    updatePropertyStatus: (id, status) => ipcRenderer.invoke("updatePropertyStatus", { id, status }),

    // Управление пользователями
    login: (loginOrEmail, password) => ipcRenderer.invoke('login', { loginOrEmail, password }),
    register: (username, password, email, phone) => ipcRenderer.invoke('register', { username, password, email, phone }),
    getAllUsers: () => ipcRenderer.invoke("getAllUsers"),
    updateUserRole: (id, role) => ipcRenderer.invoke("updateUserRole", id, role),
    deleteUser: (id) => ipcRenderer.invoke("deleteUser", { id }),

    // Управление бронированиями
    getCurrentUser: () => ipcRenderer.invoke('getCurrentUser'),
    reserveProperty: ({ propertyId, username }) =>
    ipcRenderer.invoke('reserveProperty', { propertyId, username }),

    removeReservation: (propertyId, userId, isSuperAdmin) => ipcRenderer.invoke('api:removeReservation', propertyId, userId, isSuperAdmin),

    // Дополнительные функции (для нужд приложения)
    getUserRole: () => ipcRenderer.invoke('getUserRole') // Например, для получения текущей роли пользователя
});
