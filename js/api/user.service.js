
import { request } from './apiClient.js';

export const userService = {
    getUsersByCentro: () => {
        const userString = localStorage.getItem('user');
        if (!userString) {
        return Promise.reject(new Error('Información de usuario no encontrada.'));
        }
        const user = JSON.parse(userString);
        const endpoint = `/users/get-by-centro?cod_centro=${user.cod_centro}`;
        
        // La lógica es mucho más simple ahora, solo llamamos a nuestro cliente central.
        return request(endpoint);
    },
    
    /**
     * Obtener un usuario por su ID.
     * @param {string | number} userId - El ID del usuario a buscar.
     * @returns {Promise<object>}
    */
    getUserById: (userId) => {
        // Construimos la URL con el parámetro ?id_usuario=
        const endpoint = `/users/get-by-id?id_usuario=${userId}`;
        return request(endpoint);
    },

    /**
     * Actualizar un usuario.
     * @param {string | number} userId - El ID del usuario a actualizar.
     * @param {object} userData - Los nuevos datos del usuario.
     * @returns {Promise<object>}
    */
    updateUser: (userId, userData) => {
        return request(`/users/update/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
        });
    },

    // Desactivar / Activar un usuario
    /**
     * Modifica el estado de un usuario (generalmente para desactivarlo).
     * @param {string | number} userId - El ID del usuario a modificar.
     * @returns {Promise<object>}
     */
    deleteUser: (userId) => {
        // Nuestro apiClient se encargará de añadir el token de autorización.
        return request(`/users/modify-status/${userId}`, {
        method: 'PUT',
        });
    },

    /**
     * Crear un usuario.
     * @param {object} userData - Los nuevos datos del usuario.
     * @returns {Promise<object>}
    */
    createUser: (userData) => {
        return request(`/users/create`, {
        method: 'POST',
        body: JSON.stringify(userData),
        });
    },
    // Aquí podrías añadir más servicios
};