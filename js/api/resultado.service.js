// src/api/resultado.service.js
import { request } from './apiClient.js';

export const resultadoService = {
  getByCompetencia: async (codCompetencia) => {
    return request(`/resultado-aprendizaje/get-by-cod-competencia/${codCompetencia}`);
  }
};
