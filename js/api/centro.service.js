// Servicio para manejar operaciones de centros de formación
import { request } from './apiClient.js';

export const centroService = {
    /**
     * Obtiene todos los centros de formación
     * @returns {Promise<Array>} Lista de centros de formación
     */
    getAllCentros: async () => {
        try {
            console.log('🌐 centroService: Iniciando petición a /centro/get-all');
            const token = localStorage.getItem('accessToken');
            console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');
            if (token) {
                console.log('🔑 Token (primeros 50 chars):', token.substring(0, 50) + '...');
            }
            
            const centros = await request('/centro/get-all');
            console.log('✅ centroService: Respuesta exitosa:', centros);
            return centros;
        } catch (error) {
            console.error('❌ centroService: Error al obtener centros:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo centro de formación
     * @param {Object} centroData - Datos del centro a crear
     * @param {number} centroData.cod_centro - Código del centro
     * @param {string} centroData.nombre_centro - Nombre del centro
     * @param {number} centroData.cod_regional - Código de la regional
     * @returns {Promise<Object>} Respuesta del servidor
     */
    createCentro: async (centroData) => {
        try {
            console.log('🌐 centroService: Creando centro:', centroData);
            
            const response = await request('/centro/create', {
                method: 'POST',
                body: JSON.stringify(centroData)
            });
            
            console.log('✅ centroService: Centro creado exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ centroService: Error al crear centro:', error);
            throw error;
        }
    },

    /**
     * Actualiza un centro de formación existente
     * @param {number} codCentro - Código del centro a actualizar
     * @param {Object} centroData - Datos del centro a actualizar
     * @param {string} centroData.nombre_centro - Nuevo nombre del centro
     * @param {number} centroData.cod_regional - Nuevo código de la regional
     * @returns {Promise<Object>} Respuesta del servidor
     */
    updateCentro: async (codCentro, centroData) => {
        try {
            console.log(`🌐 centroService: Actualizando centro ${codCentro}:`, centroData);
            
            const response = await request(`/centro/update/${codCentro}`, {
                method: 'PUT',
                body: JSON.stringify(centroData)
            });
            
            console.log('✅ centroService: Centro actualizado exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ centroService: Error al actualizar centro:', error);
            throw error;
        }
    }
}; 