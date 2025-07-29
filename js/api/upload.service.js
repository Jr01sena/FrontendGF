import { requestFormData } from './apiClient.js';

export const uploadService = {
  uploadPe04: async (file) => {
    console.log('📂 uploadService: Preparando upload Pe04, archivo:', file);
    if (!file) {
      throw new Error('No se ha proporcionado un archivo');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 uploadService: Enviando Pe04 al endpoint /archivos/upload-excel-pe04/');
    return requestFormData('/archivos/upload-excel-pe04/', formData);
  },
  
  uploadDf14a: async (file) => {
    console.log('📂 uploadService: Preparando upload Df14a, archivo:', file);
    if (!file) {
      throw new Error('No se ha proporcionado un archivo');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 uploadService: Enviando Df14a al endpoint /archivos/upload-excel-df14a/');
    return requestFormData('/archivos/upload-excel-df14a/', formData);
  },
  
  uploadJuicios: async (file) => {
    console.log('📂 uploadService: Preparando upload Juicios, archivo:', file);
    if (!file) {
      throw new Error('No se ha proporcionado un archivo');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 uploadService: Enviando Juicios al endpoint /archivos/upload-excel-juicios-evaluacion/');
    return requestFormData('/archivos/upload-excel-juicios-evaluacion/', formData);
  }
}; 