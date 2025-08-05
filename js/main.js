import { authService } from './api/auth.service.js';

// ✅ AUTENTICACIÓN INICIAL
(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    authService.logout();
  }
})();

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelector('.sidebar-nav');

// ✅ Mapas de nombres de páginas para el breadcrumb
const pageNames = {
  dashboard: 'Dashboard',
  usuarios: 'Usuarios',
  centros: 'Centros de Formación',
  ambientes: 'Ambientes de Formación',
  cargararchivos: 'Cargar Archivos',
  programas: 'Programa Formación',
  grupos: 'Grupos de Formación',
  calendario: 'Calendario',
  metas: 'Metas',
  billing: 'Billing',
  notifications: 'Notifications',
  profile: 'Perfil',
  'sign-in': 'Sign In',
  'sign-up': 'Sign Up'
};

// ✅ CARGAR CONTENIDO HTML Y SU MÓDULO JS
const loadContent = async (page) => {
  try {
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) {
      throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
    }
    const html = await response.text();
    mainContent.innerHTML = html;

    // Activar item del menú
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      if (link.dataset.page === page) {
        link.classList.add('active', 'bg-success', 'text-white');
      } else {
        link.classList.remove('active', 'bg-success', 'text-white');
      }
    });

    // Actualizar breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (breadcrumb && pageNames[page]) {
      breadcrumb.textContent = pageNames[page];
    }

    // Cargar módulo JS correspondiente
    await loadPageModule(page);

  } catch (error) {
    mainContent.innerHTML = `
      <div class="container-fluid py-4">
        <div class="row">
          <div class="col-12">
            <div class="card border-danger">
              <div class="card-body text-center">
                <h3 class="text-danger mb-3">
                  <i class="material-symbols-rounded me-2">error</i>
                  No se pudo cargar el contenido
                </h3>
                <p class="text-muted">Página: <strong>${page}</strong></p>
                <p class="text-muted">Error: ${error.message}</p>
                <button class="btn btn-success" onclick="location.reload()">
                  <i class="material-symbols-rounded me-2">refresh</i>
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

// ✅ CARGAR MÓDULO JS SEGÚN PÁGINA
const loadPageModule = async (page) => {
  try {
    switch (page) {
      case 'dashboard':
        const dashboardModule = await import('./pages/dashboard.js');
        if (dashboardModule.init) dashboardModule.init();
        break;
      case 'usuarios':
        const usersModule = await import('./pages/users.js');
        if (usersModule.init) usersModule.init();
        break;
      case 'centros':
        const centrosModule = await import('./pages/centros.js');
        if (centrosModule.init) centrosModule.init();
        break;
      case 'ambientes':
        const ambientesModule = await import('./pages/ambientes.js');
        if (ambientesModule.init) ambientesModule.init();
        break;
      case 'programas':
        const programasModule = await import('./pages/programas.js');
        if (programasModule.init) programasModule.init();
        break;
      case 'competencias':
        const competenciasModule = await import('./pages/competencias.js');
        if (competenciasModule.init) competenciasModule.init();
        break;
      case 'metas':
        const metasModule = await import('./pages/metas.js');
        if (metasModule.init) metasModule.init();
        break;
      case 'grupos':
        const gruposModule = await import('./pages/grupos.js');
        if (gruposModule.init) setTimeout(() => gruposModule.init(), 50);
        break;
      case 'calendario':
        const calendarioModule = await import('./pages/calendario.js');
        if (calendarioModule.init) setTimeout(() => calendarioModule.init(), 50);
        break;
      case 'cargararchivos':
        const cargararchivosModule = await import('./pages/cargararchivos.js');
        if (cargararchivosModule.init) cargararchivosModule.init();
        break;
      case 'profile':
        const profileModule = await import('./pages/profile.js');
        if (profileModule.init) profileModule.init();
        break;
    }
  } catch (error) {
    console.error(`Error al cargar el módulo de la página '${page}':`, error);
  }
};

// ✅ LISTENER DE NAVEGACIÓN
navLinks.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-page]');
  if (link) {
    event.preventDefault();
    const pageToLoad = link.dataset.page;
    loadContent(pageToLoad);
    location.hash = `#${pageToLoad}`;
  }
});

// ✅ LOGOUT
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    authService.logout();
  });
}

// ✅ CARGA INICIAL
document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const hash = location.hash?.replace('#', '') || null;

  if (!user) {
    setTimeout(() => location.reload(), 50);
    return;
  }

  // 🔒 Ocultar módulos restringidos para rol 3
  if (user.id_rol === 3) {
    const pagesToHide = ['dashboard', 'usuarios', 'centros', 'cargararchivos', 'grupos', 'metas'];
    pagesToHide.forEach(page => {
      const navItem = document.querySelector(`[data-page="${page}"]`);
      if (navItem) {
        navItem.closest('.nav-item').style.display = 'none';
      }
    });

    // ✅ Forzar vista inicial 'calendario'
    if (hash !== 'calendario') {
      location.hash = '#calendario';
    }
    await loadContent('calendario');
    return;
  }

  // 👤 Para otros roles (1, 2)
  if (hash && pageNames[hash]) {
    await loadContent(hash);
  } else {
    location.hash = '#dashboard';
    await loadContent('dashboard');
  }
});

// ✅ BLOQUEAR CLIC EN DASHBOARD SI ES ROL 3
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.id_rol === 3) {
    const dashboardLink = document.querySelector('[data-page="dashboard"]');
    if (dashboardLink) {
      dashboardLink.addEventListener('click', async (e) => {
        e.preventDefault();
        await loadContent('calendario');
        location.hash = '#calendario';
      });
    }
  }
});

// ✅ Hacer pública la función loadContent (por si se llama desde otras vistas)
window.loadContent = loadContent;
