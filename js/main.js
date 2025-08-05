import { authService } from './api/auth.service.js';

// 🔒 Función de ayuda para validar el rol
const isRol = (rol) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.id_rol === rol;
};

// 🚪 GUARDIÁN DE AUTENTICACIÓN
(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    authService.logout();
  }
})();

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelector('.sidebar-nav');

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

// ✅ Función principal para cargar contenido dinámico
const loadContent = async (page) => {
  try {
    // Restricción de seguridad adicional para evitar que instructores carguen dashboard
    if (page === 'dashboard' && isRol(3)) {
      console.warn('Acceso denegado al dashboard para rol 3');
      return loadContent('calendario');
    }

    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error(`Error de red: ${response.status} - ${response.statusText}`);

    const html = await response.text();
    mainContent.innerHTML = html;

    // Navegación activa
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      const isActive = link.dataset.page === page;
      link.classList.toggle('active', isActive);
      link.classList.toggle('bg-success', isActive);
      link.classList.toggle('text-white', isActive);
    });

    // Breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (breadcrumb && pageNames[page]) {
      breadcrumb.textContent = pageNames[page];
    }

    // Cargar JS de la página
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

// ✅ Import dinámico del JS por página
const loadPageModule = async (page) => {
  try {
    switch (page) {
      case 'dashboard':
        if (isRol(3)) return;
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
        setTimeout(() => gruposModule.init?.(), 50);
        break;

      case 'calendario':
        const calendarioModule = await import('./pages/calendario.js');
        setTimeout(() => calendarioModule.init?.(), 50);
        break;

      case 'cargararchivos':
        const cargararchivosModule = await import('./pages/cargararchivos.js');
        if (cargararchivosModule.init) cargararchivosModule.init();
        break;

      case 'profile':
        const profileModule = await import('./pages/profile.js');
        if (profileModule.init) profileModule.init();
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`Error cargando el módulo de la página '${page}':`, error);
  }
};

// 📦 Carga inicial y lógica de seguridad por rol
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const hash = location.hash?.replace('#', '') || null;

  console.log('👤 Usuario detectado:', user);
  console.log('🔗 Hash actual:', hash);

  // Ocultar accesos según rol
  if (user?.id_rol === 3) {
    const pagesToHide = ['dashboard', 'usuarios', 'centros', 'cargararchivos', 'grupos', 'metas'];
    pagesToHide.forEach(page => {
      const navItem = document.querySelector(`[data-page="${page}"]`);
      if (navItem) {
        navItem.closest('.nav-item').style.display = 'none';
      }
    });
  }

  // Redirección segura
  if (hash === 'dashboard' && isRol(3)) {
    history.replaceState(null, '', '#calendario');
    loadContent('calendario');
  } else if (hash) {
    loadContent(hash);
  } else {
    const defaultPage = isRol(3) ? 'calendario' : 'dashboard';
    history.replaceState(null, '', `#${defaultPage}`);
    loadContent(defaultPage);
  }
});

// Navegación lateral dinámica
navLinks.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-page]');
  if (link) {
    event.preventDefault();
    loadContent(link.dataset.page);
  }
});

// Logout
const logoutButton = document.getElementById('logout-button');
logoutButton?.addEventListener('click', (e) => {
  e.preventDefault();
  authService.logout();
});

window.loadContent = loadContent;
