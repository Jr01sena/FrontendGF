// Servicio para manejar operaciones de grupos de formación
import { request } from './apiClient.js';

export const gruposService = {
    /**
     * DATO_GRUPO - Solo consulta
     * Obtiene los datos del grupo por código de ficha
     * @param {string} codFicha - Código de ficha
     * @returns {Promise<Object>} Datos del grupo
     */
    getDatosGrupoByCodFicha: async (codFicha) => {
        try {
            const response = await request(`/datos-grupo/get-by-cod-ficha/${codFicha}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * GRUPO - Consultar grupo por código de ficha
     * @param {string} codFicha - Código de ficha
     * @returns {Promise<Object>} Grupo (objeto único, no array)
     */
    getGruposByCodFicha: async (codFicha) => {
        try {
            const response = await request(`/grupo/get-by-cod-ficha/${codFicha}`);
            
            // El backend retorna un objeto único, pero lo convertimos a array para compatibilidad
            return response ? [response] : [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * GRUPO - Editar campos específicos del grupo (hora_inicio, hora_fin, id_ambiente)
     * @param {string} codFicha - Código de ficha del grupo
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    updateGrupo: async (codFicha, updateData) => {
        try {
            const response = await request(`/grupo/update/${codFicha}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * GRUPO_INSTRUCTOR - Obtener instructores asignados por ficha
     * @param {string} codFicha - Código de ficha
     * @returns {Promise<Array>} Lista de instructores asignados
     */
    getInstructoresByFicha: async (codFicha) => {
        try {
            const response = await request(`/grupo-instructor/get-by-ficha?cod_ficha=${codFicha}`);
            return response || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * GRUPO_INSTRUCTOR - Asignar instructor a grupo
     * @param {Object} asignacionData - Datos de la asignación
     * @returns {Promise<Object>} Respuesta del servidor
     */
    createAsignacionInstructor: async (asignacionData) => {
        try {
            const response = await request('/grupo-instructor/create', {
                method: 'POST',
                body: JSON.stringify(asignacionData)
            });
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * GRUPO_INSTRUCTOR - Actualizar asignación de instructor
     * @param {Object} updateData - Datos de la asignación a actualizar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    updateAsignacionInstructor: async (updateData) => {
        try {
            // El backend espera: cod_ficha, id_instructor_actual, id_instructor_nuevo
            const backendData = {
                cod_ficha: updateData.cod_ficha,
                id_instructor_actual: updateData.id_instructor_actual,
                id_instructor_nuevo: updateData.id_instructor_nuevo
            };
            
            const response = await request('/grupo-instructor/update', {
                method: 'PUT',
                body: JSON.stringify(backendData)
            });
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * GRUPO_INSTRUCTOR - Eliminar asignación de instructor
     * @param {number} codFicha - Código de ficha
     * @param {number} idInstructor - ID del instructor
     * @returns {Promise<Object>} Respuesta del servidor
     */
    deleteAsignacionInstructor: async (codFicha, idInstructor) => {
        try {
            const response = await request(`/grupo-instructor/delete?cod_ficha=${codFicha}&id_instructor=${idInstructor}`, {
                method: 'DELETE'
            });
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener ambientes disponibles del centro del usuario
     * @returns {Promise<Array>} Lista de ambientes
     */
    getAmbientesDisponibles: async () => {
        try {
            // Obtener código de centro del usuario logueado
            const userString = localStorage.getItem('user');
            if (!userString) {
                throw new Error('No se encontró información del usuario logueado');
            }
            
            const user = JSON.parse(userString);
            const codCentro = user.cod_centro;
            
            if (!codCentro) {
                throw new Error('El usuario no tiene un centro asignado');
            }
            
            const response = await request(`/ambiente/get-by-centro/${codCentro}`);
            return response || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener instructores disponibles del centro del usuario
     * @returns {Promise<Array>} Lista de instructores
     */
    getInstructoresDisponibles: async () => {
        try {
            // Obtener código de centro del usuario logueado
            const userString = localStorage.getItem('user');
            if (!userString) {
                throw new Error('No se encontró información del usuario logueado');
            }
            
            const user = JSON.parse(userString);
            const codCentro = user.cod_centro;
            
            if (!codCentro) {
                throw new Error('El usuario no tiene un centro asignado');
            }
            
            const response = await request(`/users/get-by-centro?cod_centro=${codCentro}`);
            
            // Filtrar solo instructores (id_rol = 3)
            const instructores = response ? response.filter(user => user.id_rol === 3) : [];
            return instructores;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener información del programa de formación
     * @param {number} codPrograma - Código del programa
     * @param {number} laVersion - Versión del programa
     * @returns {Promise<Object>} Información del programa
     */
    getProgramaFormacion: async (codPrograma, laVersion) => {
        try {
            const response = await request(`/programa/get-by-cod-programa-la-version/${codPrograma}/${laVersion}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
}; 