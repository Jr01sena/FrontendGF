// Servicio para manejar operaciones de ambientes de formación
import { request } from './apiClient.js';

export const ambienteService = {
    /**
     * Obtiene todos los ambientes de formación del centro del usuario logueado
     * @returns {Promise<Array>} Lista de ambientes de formación
     */
    getAmbientesByCentro: async () => {
        try {
            console.log('🌐 ambienteService: Iniciando petición para obtener ambientes');
            
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
            
            const ambientes = await request(`/ambiente/get-by-centro/${codCentro}`);
            console.log('✅ ambienteService: Respuesta exitosa:', ambientes);
            return ambientes;
        } catch (error) {
            console.error('❌ ambienteService: Error al obtener ambientes:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo ambiente de formación
     * @param {Object} ambienteData - Datos del ambiente a crear
     * @param {string} ambienteData.nombre_ambiente - Nombre del ambiente
     * @param {number} ambienteData.num_max_aprendices - Número máximo de aprendices
     * @param {string} ambienteData.municipio - Municipio donde se ubica
     * @param {string} ambienteData.ubicacion - Ubicación específica
     * @param {boolean} ambienteData.estado - Estado del ambiente (opcional, por defecto true)
     * @returns {Promise<Object>} Respuesta del servidor
     */
    createAmbiente: async (ambienteData) => {
        try {
            console.log('🌐 ambienteService: Creando ambiente:', ambienteData);
            
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
                ...ambienteData,
                cod_centro: codCentro
            };
            
            console.log('📊 Datos completos para crear:', dataWithCentro);
            
            const response = await request('/ambiente/create', {
                method: 'POST',
                body: JSON.stringify(dataWithCentro)
            });
            
            console.log('✅ ambienteService: Ambiente creado exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ ambienteService: Error al crear ambiente:', error);
            throw error;
        }
    },

    /**
     * Actualiza un ambiente de formación existente
     * @param {number} ambienteId - ID del ambiente a actualizar
     * @param {Object} ambienteData - Datos del ambiente a actualizar
     * @param {string} ambienteData.nombre_ambiente - Nuevo nombre del ambiente
     * @param {number} ambienteData.num_max_aprendices - Nueva capacidad máxima
     * @param {string} ambienteData.municipio - Nuevo municipio
     * @param {string} ambienteData.ubicacion - Nueva ubicación
     * @returns {Promise<Object>} Respuesta del servidor
     */
    updateAmbiente: async (ambienteId, ambienteData) => {
        try {
            console.log(`🌐 ambienteService: Actualizando ambiente ${ambienteId}:`, ambienteData);
            
            const response = await request(`/ambiente/update/${ambienteId}`, {
                method: 'PUT',
                body: JSON.stringify(ambienteData)
            });
            
            console.log('✅ ambienteService: Ambiente actualizado exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ ambienteService: Error al actualizar ambiente:', error);
            throw error;
        }
    },

    /**
     * Modifica el estado de un ambiente de formación (activo/inactivo)
     * @param {number} ambienteId - ID del ambiente a modificar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    modifyStatus: async (ambienteId) => {
        try {
            console.log(`🌐 ambienteService: Modificando estado del ambiente ${ambienteId}`);
            
            const response = await request(`/ambiente/modify-status/${ambienteId}`, {
                method: 'PUT'
            });
            
            console.log('✅ ambienteService: Estado del ambiente modificado exitosamente:', response);
            return response;
        } catch (error) {
            console.error('❌ ambienteService: Error al modificar estado del ambiente:', error);
            throw error;
        }
    }
}; 