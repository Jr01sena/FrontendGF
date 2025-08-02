// Servicio para manejar operaciones de programación del calendario
import { request } from './apiClient.js';

export const programacionService = {
    /**
     * Obtener programaciones propias del instructor autenticado
     * @returns {Promise<Array>} Lista de programaciones del instructor
     */
    getOwnProgramaciones: async () => {
        try {
            const response = await request('/programacion/get-own');
            return response || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener todas las programaciones con filtros (para coordinadores)
     * @param {Object} filtros - Filtros de búsqueda
     * @param {number} filtros.id_instructor - ID del instructor
     * @param {string} filtros.fecha_programada - Fecha en formato YYYY-MM-DD
     * @param {number} filtros.cod_ficha - Código de ficha
     * @param {number} filtros.cod_centro - Código de centro
     * @returns {Promise<Array>} Lista de programaciones filtradas
     */
    getAllProgramaciones: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            // Agregar filtros como parámetros de query
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });
            
            const endpoint = params.toString() ? `/programacion/get-all?${params.toString()}` : '/programacion/get-all';
            const response = await request(endpoint);
            return response || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener programaciones de un instructor específico por mes
     * @param {number} idInstructor - ID del instructor
     * @param {string} fecha - Fecha en formato YYYY-MM-DD para obtener el mes
     * @returns {Promise<Array>} Lista de programaciones del mes
     */
    getProgramacionesByInstructorMes: async (idInstructor, fecha) => {
        try {
            // Extraer año y mes de la fecha
            const fechaObj = new Date(fecha);
            const year = fechaObj.getFullYear();
            const month = fechaObj.getMonth() + 1;
            
            // Obtener el primer y último día del mes
            const primerDia = new Date(year, month - 1, 1);
            const ultimoDia = new Date(year, month, 0);
            
            // Obtener todas las programaciones del instructor
            const todasProgramaciones = await programacionService.getAllProgramaciones({
                id_instructor: idInstructor
            });
            
            // Filtrar por el mes especificado
            const programacionesMes = todasProgramaciones.filter(prog => {
                const fechaProg = new Date(prog.fecha_programada);
                return fechaProg >= primerDia && fechaProg <= ultimoDia;
            });
            
            return programacionesMes;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener detalles de una programación específica
     * @param {number} idProgramacion - ID de la programación
     * @returns {Promise<Object>} Detalles de la programación
     */
    getProgramacionById: async (idProgramacion) => {
        try {
            const response = await request(`/programacion/get-by-id/${idProgramacion}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Crear nueva programación
     * @param {Object} programacionData - Datos de la nueva programación
     * @param {number} programacionData.id_instructor - ID del instructor
     * @param {number} programacionData.cod_ficha - Código de ficha
     * @param {string} programacionData.fecha_programada - Fecha en formato YYYY-MM-DD
     * @param {number} programacionData.horas_programadas - Número de horas
     * @param {string} programacionData.hora_inicio - Hora inicio en formato HH:MM
     * @param {string} programacionData.hora_fin - Hora fin en formato HH:MM
     * @param {number} programacionData.cod_competencia - Código de competencia
     * @param {number} programacionData.cod_resultado - Código de resultado
     * @returns {Promise<Object>} Respuesta del servidor
     */
    createProgramacion: async (programacionData) => {
        try {
            const response = await request('/programacion/create', {
                method: 'POST',
                body: JSON.stringify(programacionData)
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Actualizar programación existente
     * @param {number} idProgramacion - ID de la programación a actualizar
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    updateProgramacion: async (idProgramacion, updateData) => {
        try {
            const response = await request(`/programacion/update/${idProgramacion}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener competencias por código de ficha (necesitamos implementar esto en el backend)
     * Por ahora retorna array vacío como placeholder
     * @param {number} codFicha - Código de ficha
     * @returns {Promise<Array>} Lista de competencias
     */
    getCompetenciasByFicha: async (codFicha) => {
        try {
            // TODO: Implementar endpoint en backend para obtener competencias por ficha
            // Por ahora devolvemos array vacío
            const response = await request(`/competencia/get-by-ficha/${codFicha}`);
            return response || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener resultados de aprendizaje por competencia
     * @param {number} codCompetencia - Código de competencia
     * @returns {Promise<Array>} Lista de resultados de aprendizaje
     */
    getResultadosByCompetencia: async (codCompetencia) => {
        try {
            const response = await request(`/resultado-aprendizaje/get-by-cod-competencia/${codCompetencia}`);
            return response || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener fichas asignadas a un instructor
     * @param {number} idInstructor - ID del instructor
     * @returns {Promise<Array>} Lista de fichas del instructor
     */
    getFichasByInstructor: async (idInstructor) => {
        try {
            // Usar el servicio de grupos para obtener fichas del instructor
            const response = await request(`/grupo-instructor/get-by-instructor?id_instructor=${idInstructor}`);
            return response || [];
        } catch (error) {
            // Si no existe el endpoint, devolver array vacío
            console.warn('⚠️ Endpoint de fichas por instructor no encontrado');
            return [];
        }
    }
}; 