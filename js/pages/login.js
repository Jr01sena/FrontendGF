// La ruta del import ahora es más específica
import { authService } from '../api/auth.service.js';

document.addEventListener('DOMContentLoaded', () => {
    // Redirigir si ya hay un token (el usuario ya tiene sesión)
    if (localStorage.getItem('accessToken')) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de la forma tradicional
        errorMessage.textContent = ''; // Limpia errores anteriores

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const data = await authService.loginUser(username, password);

            // Si el login es exitoso...

            // 1. Guardar los datos en localStorage
            // El token se guarda como string, el objeto de usuario como un string JSON
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // 2. Redirigir al dashboard (index.html)
            window.location.href = 'index.html';

        } catch (error) {
            // Si apiService.loginUser lanza un error, lo capturamos aquí
            errorMessage.textContent = error.message || 'No se pudo iniciar sesión. Revisa tus credenciales.';
        }
    });
});