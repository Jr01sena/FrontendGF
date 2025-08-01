// Este archivo tendrá una única función request que se encargará de todo el trabajo estandar: 
// añadir la URL base, poner el token, y manejar los errores 401. Esto evita repetir código en cada servicio.

// La única función que necesitamos importar es la de logout.
// La importamos para usarla en caso de un error 401.
import { authService } from './auth.service.js';

const API_BASE_URL = 'https://api.gestion-formacion.tech';

/**
 * Cliente central para realizar todas las peticiones a la API.
 * @param {string} endpoint - El endpoint al que se llamará (ej. '/users/get-by-centro').
 * @param {object} [options={}] - Opciones para la petición fetch (method, headers, body).
 * @returns {Promise<any>} - La respuesta de la API en formato JSON.
 */
export async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    console.log(`🔗 apiClient: Petición a ${url}`);
    console.log(`🔑 apiClient: Token disponible: ${token ? 'SÍ' : 'NO'}`);

    // Configuramos las cabeceras por defecto
    const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        ...options.headers, // Permite sobrescribir o añadir cabeceras
    };

    // Si hay un token, lo añadimos a la cabecera de Authorization
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`📤 apiClient: Cabeceras:`, headers);

    try {
        const response = await fetch(url, { ...options, headers });
        console.log(`📥 apiClient: Respuesta status: ${response.status}`);

        // Manejo centralizado del error 401 (Token inválido/expirado)
        if (response.status === 401) {
        console.log('🚫 apiClient: Error 401 - Token expirado');
        authService.logout(); // Cerramos la sesión
        return Promise.reject(new Error('Sesión expirada.'));
        }

        if (!response.ok) {
        console.log(`❌ apiClient: Error HTTP ${response.status}`);
        const errorData = await response.json().catch(() => ({ detail: 'Ocurrió un error en la petición.' }));
        throw new Error(errorData.detail);
        }
        
        // Si la respuesta no tiene contenido (ej. status 204), devolvemos un objeto vacío.
        const result = response.status === 204 ? {} : await response.json();
        console.log(`✅ apiClient: Respuesta exitosa:`, result);
        return result;

    } catch (error) {
        console.error(`❌ apiClient: Error en la petición a ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Cliente para peticiones que requieren FormData (por ejemplo, uploads de archivos).
 * @param {string} endpoint - El endpoint al que se llamará (ej. '/archivos/upload-excel-pe04/').
 * @param {FormData} formData - El objeto FormData con los datos a enviar.
 * @param {object} [options={}] - Opciones adicionales para fetch (headers, etc).
 * @returns {Promise<any>} - La respuesta de la API en formato JSON.
 */
export async function requestFormData(endpoint, formData, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    console.log(`🔗 apiClient FormData: Petición a ${url}`);
    console.log(`🔑 apiClient FormData: Token disponible: ${token ? 'SÍ' : 'NO'}`);
    console.log(`📁 apiClient FormData: Datos a enviar:`, formData);

    // IMPORTANTE: NO establecer Content-Type para FormData
    // El navegador lo establece automáticamente con el boundary correcto
    const headers = {
        'accept': 'application/json',
        ...options.headers,
    };
    
    // Si hay un token, lo añadimos a la cabecera de Authorization
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`📤 apiClient FormData: Cabeceras:`, headers);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers,
            mode: 'cors', // Asegurar que se use CORS
            credentials: 'omit', // No enviar cookies por defecto
            ...options
        });

        console.log(`📥 apiClient FormData: Respuesta status: ${response.status}`);

        // Manejo centralizado del error 401 (Token inválido/expirado)
        if (response.status === 401) {
            console.log('🚫 apiClient FormData: Error 401 - Token expirado');
            authService.logout();
            return Promise.reject(new Error('Sesión expirada.'));
        }

        if (!response.ok) {
            console.log(`❌ apiClient FormData: Error HTTP ${response.status}`);
            const errorData = await response.json().catch(() => ({ 
                detail: `Error ${response.status}: ${response.statusText}` 
            }));
            throw new Error(errorData.detail || errorData.message || 'Error en el servidor');
        }
        
        // Si la respuesta no tiene contenido (ej. status 204), devolvemos un objeto vacío
        const result = response.status === 204 ? {} : await response.json();
        console.log(`✅ apiClient FormData: Respuesta exitosa:`, result);
        return result;

    } catch (error) {
        console.error(`❌ apiClient FormData: Error en la petición a ${endpoint}:`, error);
        console.error(`❌ apiClient FormData: Detalles del error:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}