// Este archivo tendrá una única función request que se encargará de todo el trabajo estándar: 
// añadir la URL base, poner el token, y manejar los errores 401 y 403.

// La única función que necesitamos importar es la de logout.
import { authService } from './auth.service.js';

// const API_BASE_URL = 'https://api.gestion-formacion.tech';
const API_BASE_URL = 'http://localhost:8000';

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

    const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`📤 apiClient: Cabeceras:`, headers);

    try {
        const response = await fetch(url, { ...options, headers });
        console.log(`📥 apiClient: Respuesta status: ${response.status}`);

        if (response.status === 401) {
            console.log('🚫 apiClient: Error 401 - Token expirado');
            authService.logout();
            return Promise.reject(new Error('Sesión expirada. Inicia sesión nuevamente.'));
        }

        if (response.status === 403) {
            console.warn('🚫 apiClient: Error 403 - Acceso denegado');
            const errorData = await response.json().catch(() => ({ detail: 'Acceso denegado.' }));
            return Promise.reject(new Error(errorData.detail || 'Acceso denegado.'));
        }

        if (!response.ok) {
            console.log(`❌ apiClient: Error HTTP ${response.status}`);
            const errorData = await response.json().catch(() => ({ detail: 'Ocurrió un error en la petición.' }));
            throw new Error(typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail));

        }

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
 * @param {string} endpoint - El endpoint al que se llamará.
 * @param {FormData} formData - El objeto FormData con los datos a enviar.
 * @param {object} [options={}] - Opciones adicionales para fetch.
 * @returns {Promise<any>} - La respuesta de la API en formato JSON.
 */
export async function requestFormData(endpoint, formData, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    console.log(`🔗 apiClient FormData: Petición a ${url}`);
    console.log(`🔑 apiClient FormData: Token disponible: ${token ? 'SÍ' : 'NO'}`);
    console.log(`📁 apiClient FormData: Datos a enviar:`, formData);

    const headers = {
        'accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`📤 apiClient FormData: Cabeceras:`, headers);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers,
            mode: 'cors',
            credentials: 'omit',
            ...options
        });

        console.log(`📥 apiClient FormData: Respuesta status: ${response.status}`);

        if (response.status === 401) {
            console.log('🚫 apiClient FormData: Error 401 - Token expirado');
            authService.logout();
            return Promise.reject(new Error('Sesión expirada. Inicia sesión nuevamente.'));
        }

        if (response.status === 403) {
            console.warn('🚫 apiClient FormData: Error 403 - Acceso denegado');
            const errorData = await response.json().catch(() => ({ detail: 'Acceso denegado.' }));
            return Promise.reject(new Error(errorData.detail || 'Acceso denegado.'));
        }

        if (!response.ok) {
            console.log(`❌ apiClient FormData: Error HTTP ${response.status}`);
            const errorData = await response.json().catch(() => ({
                detail: `Error ${response.status}: ${response.statusText}`
            }));
            throw new Error(errorData.detail || errorData.message || 'Error en el servidor');
        }

        const result = response.status === 204 ? {} : await response.json();
        console.log(`✅ apiClient FormData: Respuesta exitosa:`, result);
        return result;

    } catch (error) {
        console.error(`❌ apiClient FormData: Error en la petición a ${endpoint}:`, error);
        throw error;
    }
}
