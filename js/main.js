import { authService } from './api/auth.service.js';

// GUARDIÁN DE AUTENTICACIÓN
(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    authService.logout();
  }
})();

const mainContent = document.getElementById('main-content');
const navLinks = document.querySelector('.sidebar-nav');

// Mapeo de nombres de página a títulos para el breadcrumb
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

const loadContent = async (page) => {
  try {
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
    const html = await response.text();
    mainContent.innerHTML = html;

    // Actualizar navegación
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      if (link.dataset.page === page) {
        link.classList.add('active', 'bg-success', 'text-white');
      } else {
        link.classList.remove('active', 'bg-success', 'text-white');
      }
    });

    // Actualizar breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (breadcrumb && pageNames[page]) breadcrumb.textContent = pageNames[page];

    // Cargar JS correspondiente
    await loadPageModule(page);

  } catch (error) {
    mainContent.innerHTML = `
      <div class="container-fluid py-4">
        <div class="row"><div class="col-12"><div class="card border-danger">
          <div class="card-body text-center">
            <h3 class="text-danger mb-3"><i class="material-symbols-rounded me-2">error</i>No se pudo cargar el contenido</h3>
            <p class="text-muted">Página: <strong>${page}</strong></p>
            <p class="text-muted">Error: ${error.message}</p>
            <button class="btn btn-success" onclick="location.reload()">
              <i class="material-symbols-rounded me-2">refresh</i>Recargar página
            </button>
          </div>
        </div></div></div>
      </div>`;
  }
};

const loadPageModule = async (page) => {
  try {
    switch (page) {
      case 'dashboard':
        const dashboardModule = await import('./pages/dashboard.js');
        dashboardModule.init?.();
        break;
      case 'usuarios':
        const usersModule = await import('./pages/users.js');
        usersModule.init?.();
        break;
      case 'centros':
        const centrosModule = await import('./pages/centros.js');
        centrosModule.init?.();
        break;
      case 'ambientes':
        const ambientesModule = await import('./pages/ambientes.js');
        ambientesModule.init?.();
        break;
      case 'programas':
        const programasModule = await import('./pages/programas.js');
        programasModule.init?.();
        break;
      case 'competencias':
        const competenciasModule = await import('./pages/competencias.js');
        competenciasModule.init?.();
        break;
      case 'metas':
        const metasModule = await import('./pages/metas.js');
        metasModule.init?.();
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
        cargararchivosModule.init?.();
        break;
      case 'profile':
        const profileModule = await import('./pages/profile.js');
        profileModule.init?.();
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`❌ Error al cargar el módulo de la página '${page}':`, error);
  }
};

// ✅ EVENTOS - Todos en el mismo bloque
document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const hash = location.hash?.replace('#', '') || null;

  if (!user) {
    console.warn('⏳ Usuario no encontrado, recargando...');
    setTimeout(() => location.reload(), 50);
    return;
  }

  // 👤 Ocultar menús para rol 3
  if (user.id_rol === 3) {
    ['dashboard', 'usuarios', 'centros', 'cargararchivos', 'grupos', 'metas'].forEach(page => {
      const item = document.querySelector(`[data-page="${page}"]`);
      if (item) item.closest('.nav-item').style.display = 'none';
    });

    // ⛔ Bloquear clic manual al dashboard
    const dashboardLink = document.querySelector('[data-page="dashboard"]');
    if (dashboardLink) {
      dashboardLink.addEventListener('click', async e => {
        e.preventDefault();
        await loadContent('calendario');
      });
    }
  }

  // 🚦 Cargar la vista inicial basada en el rol
  if (user.id_rol === 3) {
    if (hash !== 'calendario') location.hash = '#calendario';
    await loadContent('calendario');
  } else {
    if (hash && pageNames[hash]) {
      await loadContent(hash);
    } else {
      location.hash = '#dashboard';
      await loadContent('dashboard');
    }
  }
});

// Navegación lateral
navLinks.addEventListener('click', async (event) => {
  const link = event.target.closest('a[data-page]');
  if (link) {
    event.preventDefault();
    const pageToLoad = link.dataset.page;
    await loadContent(pageToLoad);
  }
});

// Logout
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    authService.logout();
  });
}

window.loadContent = loadContent;
