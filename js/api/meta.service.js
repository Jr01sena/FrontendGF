// Servicio para manejar operaciones de metas
import { request } from './apiClient.js';

export const metaService = {
    /**
     * Obtiene las metas por código de centro del usuario logueado
     * @param {number} [anio] - Año específico para filtrar las metas (opcional)
     * @returns {Promise<Array>} Lista de metas
     */
    getMetasByCodCentro: async (anio = null) => {
        try {
            console.log('🌐 metaService: Iniciando petición para obtener metas');
            
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
            
            console.log('🏢 Código de centro del usuario:', codCentro);
            console.log('📅 Año solicitado:', anio || 'Todos los años');
            
            // Construir URL con parámetros
            let endpoint = `/metas/get-by-cod-centro/${codCentro}`;
            if (anio && anio >= 2000 && anio <= 2100) {
                endpoint += `?anio=${anio}`;
            }
            
            const metas = await request(endpoint);
            console.log('✅ metaService: Respuesta exitosa:', metas);
            return metas;
        } catch (error) {
            console.error('❌ metaService: Error al obtener metas:', error);
            throw error;
        }
    },

    /**
     * Crea una nueva meta
     * @param {Object} metaData - Datos de la meta a crear
     * @param {number} metaData.anio - Año de la meta
     * @param {string} metaData.concepto - Concepto de la meta
     * @param {number} metaData.valor - Valor de la meta
     * @returns {Promise<Object>} Respuesta del servidor
     */
    createMeta: async (metaData) => {
        try {
            console.log('🌐 metaService: Creando meta:', metaData);
            
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
            
            // Agregar cod_centro automáticamente
            const dataWithCentro = {
                ...metaData,
                cod_centro: codCentro
            };
            
            console.log('📊 Datos completos para crear:', dataWithCentro);
            
            const response = await request('/metas/create', {
                method: 'POST',
                body: JSON.stringify(dataWithCentro)
            });
            
            console.log('✅ metaService: Meta creada exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ metaService: Error al crear meta:', error);
            throw error;
        }
    },

    /**
     * Actualiza una meta existente
     * @param {number} idMeta - ID de la meta a actualizar
     * @param {Object} metaData - Datos de la meta a actualizar
     * @param {number} metaData.anio - Año de la meta
     * @param {string} metaData.concepto - Concepto de la meta
     * @param {number} metaData.valor - Valor de la meta
     * @returns {Promise<Object>} Respuesta del servidor
     */
    updateMeta: async (idMeta, metaData) => {
        try {
            console.log(`🌐 metaService: Actualizando meta ${idMeta}:`, metaData);
            
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
            
            // Agregar cod_centro automáticamente
            const dataWithCentro = {
                ...metaData,
                cod_centro: codCentro
            };
            
            console.log('📊 Datos completos para actualizar:', dataWithCentro);
            
            const response = await request(`/metas/update/${idMeta}`, {
                method: 'PUT',
                body: JSON.stringify(dataWithCentro)
            });
            
            console.log('✅ metaService: Meta actualizada exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ metaService: Error al actualizar meta:', error);
            throw error;
        }
    },

    /**
     * Elimina una meta existente
     * @param {number} idMeta - ID de la meta a eliminar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    deleteMeta: async (idMeta) => {
        try {
            console.log(`🌐 metaService: Eliminando meta ${idMeta}`);
            
            const response = await request(`/metas/delete/${idMeta}`, {
                method: 'DELETE'
            });
            
            console.log('✅ metaService: Meta eliminada exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ metaService: Error al eliminar meta:', error);
            throw error;
        }
    }
}; 