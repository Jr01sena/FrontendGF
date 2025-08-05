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



/**
 * Carga dinámicamente el contenido HTML de la página indicada y, si es necesario,
 * importa y ejecuta el módulo JS correspondiente para enganchar la lógica de la vista.
 * Esto permite que cada vista tenga su propio JS y listeners, incluso cuando se carga dinámicamente.
 */
const loadContent = async (page) => {

  try {
    const response = await fetch(`pages/${page}.html`);


    if (!response.ok) {
      throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
    }
    const html = await response.text();
    mainContent.innerHTML = html;
    
    // Actualizar estado activo en navegación
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

    // Cargar módulos JavaScript correspondientes
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

/**
 * Carga el módulo JavaScript específico para cada página
 * @param {string} page - Nombre de la página
 */
const loadPageModule = async (page) => {
  try {
    switch (page) {
      case 'dashboard':
        const dashboardModule = await import('./pages/dashboard.js');
        if (dashboardModule.init) {
          dashboardModule.init();
        }
        break;

      case 'usuarios':
        const usersModule = await import('./pages/users.js');
        if (usersModule.init) {
          usersModule.init();
        }
        break;

      case 'centros':
        const centrosModule = await import('./pages/centros.js');
        if (centrosModule.init) {
          centrosModule.init();
        }
        break;

      case 'ambientes':
        const ambientesModule = await import('./pages/ambientes.js');
        if (ambientesModule.init) {
          ambientesModule.init();
        }
        break;

      case 'programas':
        const programasModule = await import('./pages/programas.js');
        if (programasModule.init) {
          programasModule.init();
        }
        break;

      case 'competencias':
        const competenciasModule = await import('./pages/competencias.js');
        if (competenciasModule.init) {
          competenciasModule.init();
        }
        break;
      
      case 'metas':
        const metasModule = await import('./pages/metas.js');
        if (metasModule.init) {
          metasModule.init();
        }
        break;


      case 'grupos':
        const gruposModule = await import('./pages/grupos.js');
        if (gruposModule.init) {
          // Pequeño delay para asegurar que el DOM esté listo
          setTimeout(() => {
            gruposModule.init();
          }, 50);
        }
        break;

      case 'calendario':
        const calendarioModule = await import('./pages/calendario.js');
        if (calendarioModule.init) {
          // Pequeño delay para asegurar que el DOM esté listo
          setTimeout(() => {
            calendarioModule.init();
          }, 50);
        }
        break;

      case 'cargararchivos':
        const cargararchivosModule = await import('./pages/cargararchivos.js');
        if (cargararchivosModule.init) {
          cargararchivosModule.init();
        }
        break;

      case 'profile':
        const profileModule = await import('./pages/profile.js');
        if (profileModule.init) {
          profileModule.init();
        }
        break;


      case 'billing':
      case 'notifications':
        break;

      default:
    }
  } catch (error) {
  }
};

// Event listener para navegación
navLinks.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-page]');
  if (link) {
    event.preventDefault();
    const pageToLoad = link.dataset.page;
    loadContent(pageToLoad);
  }
});

// Event listener para logout
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    authService.logout();
  });
}

// Carga inicial del dashboard
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('👤 Usuario detectado:', user);

  const currentPage = location.hash?.replace('#', '') || null;
  console.log('🔍 Página desde hash:', currentPage);

  if (currentPage) {
    console.log('📄 Cargando desde hash:', currentPage);
    loadContent(currentPage);
    return;
  }

  if (user?.id_rol === 3) {
    console.log('➡️ Redirigiendo a CALENDARIO por rol 3');
    loadContent('calendario');
    history.replaceState(null, '', '#calendario');
  } else {
    console.log('➡️ Redirigiendo a DASHBOARD');
    loadContent('dashboard');
    history.replaceState(null, '', '#dashboard');
  }
});



window.loadContent = loadContent;

