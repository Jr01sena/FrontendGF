// src/api/programa.service.js
import { request } from './apiClient.js';

export const programaService = {
  /**
   * Obtener todos los programas
   * @returns {Promise<Array>}
   */
  getAll: async (limit = 10, offset = 0) => {
    const endpoint = `/programa/get-all?limit=${limit}&offset=${offset}`;
    return request(endpoint);
  },

  buscarPorNombre: async (nombre) => {
    return request(`/programa/buscar?nombre=${encodeURIComponent(nombre)}`);
  },

  /**
   * Actualizar horas de un programa por código y versión
   * @param {number|string} codPrograma 
   * @param {number|string} version 
   * @param {object} data 
   * @returns {Promise<object>}
   */
  updateHorasPrograma: (codPrograma, version, data) => {
    return request(`/programa/update/${codPrograma}/${version}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtener competencias por programa y versión
   */
  getCompetenciasPorPrograma: async (codPrograma, version) => {
    return request(`/programa-competencia/get-competencias-by-programa/${codPrograma}/${version}`);
  }
};
