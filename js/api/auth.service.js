// Este servicio NO usará nuestro apiClient 'request' porque el login es especial (x-www-form-urlencoded)
// y no necesita token.

export const authService = {
    loginUser: async (username, password) => {
        // La lógica de login se queda igual, ya que es un caso único.
        const url = 'https://api.gestion-formacion.tech/access/token';
    
        const body = new URLSearchParams({
            username,
            password,
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Usuario o contraseña incorrectos.' }));
            throw new Error(errorData.detail);
        }
        return await response.json();
    },

    logout: () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/sign-in.html';
    },
};