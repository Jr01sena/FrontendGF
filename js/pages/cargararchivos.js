// Importa el servicio de carga de archivos, que contiene las funciones para subir cada tipo de archivo
import { uploadService } from '../api/upload.service.js';

console.log('cargararchivos.js cargado');

/**
 * Lista de extensiones de Excel válidas
 */
const EXCEL_EXTENSIONS = [
  '.xlsx', '.xls', '.xlsm', '.xlsb', 
  '.xltx', '.xltm', '.xlam', 
  '.csv', '.xml', '.ods'
];

/**
 * Valida si el archivo tiene una extensión de Excel válida
 * @param {File} file - Archivo a validar
 * @returns {boolean} - True si la extensión es válida
 */
function isValidExcelFile(file) {
  if (!file || !file.name) return false;
  
  const fileName = file.name.toLowerCase();
  return EXCEL_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

/**
 * Obtiene el tamaño del archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Engancha el evento submit al formulario indicado y gestiona la carga del archivo.
 * @param {string} formId - ID del formulario en el DOM
 * @param {string} fileInputId - ID del input de tipo file
 * @param {string} tipo - Tipo de archivo ('pe04', 'df14a', 'juicios')
 * @param {string} statusId - ID del div donde se mostrarán los mensajes de estado
 */
function uploadFile(formId, fileInputId, tipo, statusId) {
  const form = document.getElementById(formId);
  if (!form) {
    console.error(`No se encontró el formulario con id '${formId}'`);
    return;
  }
  
  // Engancha el evento submit al formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Previene el comportamiento por defecto (recarga/redirección)
    
    const fileInput = document.getElementById(fileInputId);
    const statusDiv = document.getElementById(statusId);
    
    if (!fileInput || !statusDiv) {
      console.error(`No se encontró el input o el div de estado para '${fileInputId}'/'${statusId}'`);
      return;
    }
    
         // Validación: debe haber un archivo seleccionado
     if (!fileInput.files || fileInput.files.length === 0) {
       statusDiv.innerHTML = `
         <div class="alert alert-warning border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
           <i class="material-symbols-rounded me-1">warning</i>
           <strong>Debes seleccionar un archivo</strong>
         </div>
       `;
       console.warn('Intento de envío sin archivo seleccionado');
       return;
     }

    const selectedFile = fileInput.files[0];
    
         // Validación: debe ser un archivo Excel válido
     if (!isValidExcelFile(selectedFile)) {
       statusDiv.innerHTML = `
         <div class="alert alert-warning border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
           <i class="material-symbols-rounded me-1">error</i>
           <strong>Formato no válido</strong>
           <br><small style="color: #fff; opacity: 0.9;">Formatos aceptados: ${EXCEL_EXTENSIONS.join(', ')}</small>
         </div>
       `;
       console.warn(`Archivo rechazado: ${selectedFile.name} no es un formato Excel válido`);
       return;
     }

         // Validación: tamaño máximo de archivo (50MB)
     const maxSize = 50 * 1024 * 1024; // 50MB en bytes
     if (selectedFile.size > maxSize) {
       statusDiv.innerHTML = `
         <div class="alert alert-warning border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
           <i class="material-symbols-rounded me-1">error</i>
           <strong>Archivo muy grande</strong>
           <br><small style="color: #fff; opacity: 0.9;">Tamaño actual: ${formatFileSize(selectedFile.size)} | Máximo: ${formatFileSize(maxSize)}</small>
         </div>
       `;
       console.warn(`Archivo rechazado: ${selectedFile.name} supera el tamaño máximo`);
       return;
     }
    
    // Mostrar mensaje de carga
    statusDiv.innerHTML = `
      <div class="alert alert-info border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
        <i class="material-symbols-rounded me-1">upload</i>
        <strong>Subiendo archivo...</strong>
        <br><small style="color: #fff; opacity: 0.9;">${selectedFile.name} (${formatFileSize(selectedFile.size)})</small>
      </div>
    `;
    
    console.log(`Enviando archivo tipo ${tipo}: ${selectedFile.name}`);
    
    try {
      let response;
      // Llama al servicio correspondiente según el tipo de archivo
      if (tipo === 'pe04') {
        response = await uploadService.uploadPe04(selectedFile);
      } else if (tipo === 'df14a') {
        response = await uploadService.uploadDf14a(selectedFile);
      } else if (tipo === 'juicios') {
        response = await uploadService.uploadJuicios(selectedFile);
      } else {
        throw new Error('Tipo de archivo no soportado');
      }
      
      // Muestra mensaje de éxito y resetea el formulario
      statusDiv.innerHTML = `
        <div class="alert alert-success border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
          <i class="material-symbols-rounded me-1">check_circle</i>
          <strong>¡Archivo subido correctamente!</strong>
          <br><small style="color: #fff; opacity: 0.9;">${selectedFile.name}</small>
        </div>
      `;
      form.reset();
      console.log('Archivo subido correctamente', response);
      
    } catch (err) {
      // Análisis detallado del error
      console.error('❌ Error detallado al subir archivo:', {
        error: err,
        message: err.message,
        name: err.name,
        archivo: selectedFile.name,
        tipo: tipo
      });
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      let errorMessage = '';
             if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
         errorMessage = `
           <div class="alert alert-danger border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
             <i class="material-symbols-rounded me-1">error</i>
             <strong>Error de conexión</strong>
             <br><small style="color: #fff; opacity: 0.9;">No se puede conectar al servidor</small>
           </div>
         `;
             } else if (err.message.includes('CORS')) {
         errorMessage = `
           <div class="alert alert-danger border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
             <i class="material-symbols-rounded me-1">error</i>
             <strong>Error de configuración</strong>
             <br><small style="color: #fff; opacity: 0.9;">Problema de CORS en el servidor</small>
           </div>
         `;
             } else if (err.message.includes('401') || err.message.includes('token')) {
         errorMessage = `
           <div class="alert alert-warning border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
             <i class="material-symbols-rounded me-1">lock</i>
             <strong>Error de autenticación</strong>
             <br><small style="color: #fff; opacity: 0.9;">Inicia sesión nuevamente</small>
           </div>
         `;
             } else {
         errorMessage = `
           <div class="alert alert-danger border-0 mt-2" style="background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%); color: white;">
             <i class="material-symbols-rounded me-1">error</i>
             <strong>Error del servidor</strong>
             <br><small style="color: #fff; opacity: 0.9;">${err.message}</small>
           </div>
         `;
      }
      
      statusDiv.innerHTML = errorMessage;
    }
  });
}

/**
 * Función de inicialización que engancha los listeners de carga de archivos
 * para cada formulario de la vista. Debe llamarse después de insertar el HTML en el DOM.
 */
export function init() {
  console.log('🚀 Inicializando listeners de carga de archivos...');
  
  // Configurar los formularios
  uploadFile('form-pe04', 'file-pe04', 'pe04', 'pe04-status');
  uploadFile('form-df14a', 'file-df14a', 'df14a', 'df14a-status');
  uploadFile('form-juicios', 'file-juicios', 'juicios', 'juicios-status');
  
  console.log('✅ Inicialización de carga de archivos completada');
} 