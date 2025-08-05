import { userService } from '../api/user.service.js';

let modalInstance = null; // Guardará la instancia del modal de Bootstrap
let originalMail = null;

// Variables unificadas para manejo de usuarios
let allUsers = []; // Lista completa de usuarios cargados
let filteredUsers = []; // Usuarios filtrados por búsqueda
let currentPage = 1;
const pageSize = 5; // Usuarios por página

// --- FUNCIONES DE BÚSQUEDA ---

function filterUsers(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    filteredUsers = [...allUsers];
  } else {
    filteredUsers = allUsers.filter(user => 
      user.nombre_completo.toLowerCase().includes(term) ||
      user.correo.toLowerCase().includes(term) ||
      user.identificacion.toLowerCase().includes(term)
    );
  }
  
  // Resetear a la primera página cuando se filtra
  currentPage = 1;
  
  renderUsers(filteredUsers);
  updateSearchResultsCount(searchTerm, filteredUsers.length, allUsers.length);
}

function renderUsers(users = filteredUsers) {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;

  // Aplicar paginación a los usuarios filtrados
  const totalPages = Math.ceil(users.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = users.slice(startIndex, endIndex);

  if (paginatedUsers.length > 0) {
    tableBody.innerHTML = paginatedUsers.map(createUserRow).join('');
  } else {
    const searchTerm = document.getElementById('user-search')?.value || '';
    if (searchTerm.trim()) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center p-4">
            <div class="text-muted">
              <i class="material-symbols-rounded mb-2 d-block" style="font-size: 2rem;">search_off</i>
              <strong>No se encontraron usuarios</strong><br>
              <small>No hay usuarios que coincidan con "${searchTerm}"</small>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>';
    }
  }

  // Actualizar paginador
  renderPagination(users.length);
}

function updateSearchResultsCount(searchTerm, filteredCount, totalCount) {
  const countElement = document.getElementById('search-results-count');
  if (!countElement) return;
  
  if (searchTerm.trim()) {
    countElement.textContent = `Mostrando ${filteredCount} de ${totalCount} usuarios`;
    countElement.style.display = 'block';
  } else {
    countElement.style.display = 'none';
  }
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginador = document.getElementById("paginador-usuarios");
  
  if (!paginador) return;
  
  paginador.innerHTML = "";

  // No mostrar paginador si solo hay una página o menos
  if (totalPages <= 1) return;

  const ul = document.createElement("ul");
  ul.className = "pagination justify-content-center my-3";

  const createPageItem = (label, page, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}`;

    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = label;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!disabled && currentPage !== page) {
        currentPage = page;
        renderUsers(filteredUsers);
      }
    });

    li.appendChild(a);
    return li;
  };

  // Botón anterior
  ul.appendChild(createPageItem("«", currentPage - 1, currentPage === 1));

  // Calcular rango de páginas a mostrar
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  // Números de página
  for (let i = startPage; i <= endPage; i++) {
    ul.appendChild(createPageItem(i, i, false, i === currentPage));
  }

  // Botón siguiente
  ul.appendChild(createPageItem("»", currentPage + 1, currentPage === totalPages));

  paginador.appendChild(ul);
}

function clearSearch() {
  const searchInput = document.getElementById('user-search');
  if (searchInput) {
    searchInput.value = '';
    filterUsers('');
  }
}

// --- FUNCIONES DE VISTA (Generación de HTML) ---
function createUserRow(user) {
  const statusBadge = user.estado
    ? `<span class="badge bg-success">Activo</span>`
    : `<span class="badge bg-danger">Inactivo</span>`;

  const userId = user.id_usuario;

  // Extraer iniciales de nombre_completo
  let iniciales = "U";
  if (user?.nombre_completo) {
    const partes = user.nombre_completo.trim().split(" ");
    if (partes.length >= 2) {
      iniciales = partes[0][0] + partes[1][0];
    } else {
      iniciales = partes[0][0];
    }
  }

  return `
    <tr>
      <td class="align-middle">
        <div class="d-flex px-2 py-1">
          <div>
            <div class="avatar bg-gradient-dark text-white fw-bold rounded-circle d-flex align-items-center justify-content-center me-3"
                 style="width: 36px; height: 36px;">
              ${iniciales.toUpperCase()}
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${user.nombre_completo}</h6>
            <p class="text-xs text-secondary mb-0">${user.identificacion}</p>
          </div>
        </div>
      </td>
      <td class="align-middle">
        <p class="text-xs font-weight-bold mb-0">${user.correo}</p>
      </td>
      <td class="text-center align-middle">
        <p class="text-xs text-secondary mb-0">${user.telefono}</p>
      </td>
      <td class="px-0">
        <div class="form-check form-switch ms-2 d-inline-block">
          <input class="form-check-input user-status-switch" type="checkbox" role="switch" 
                 id="switch-${userId}" data-user-id="${userId}" 
                 ${user.estado ? 'checked' : ''}>
          <label class="form-check-label" for="switch-${userId}">
            ${user.estado ? 'Activo' : 'Inactivo'}
          </label>
        </div>
      </td>
      <td class="text-center align-middle">
        <span class="text-xs font-weight-bold text-secondary badge badge-pill">${user.rol}</span>
      </td>
      <td class="text-center align-middle">
        <button class="btn btn-sm btn-success btn-edit-user" data-user-id="${userId}">
          Editar
        </button>
      </td>
    </tr>
  `;
}


// --- LÓGICA DE MODAL ---

async function openEditModal(userId) {
  const modalElement = document.getElementById('edit-user-modal');
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalElement);
  }

  try {
    const user = await userService.getUserById(userId);
    originalMail = user.correo;
    document.getElementById('edit-user-id').value = user.id_usuario;
    document.getElementById('edit-nombre_completo').value = user.nombre_completo;
    document.getElementById('edit-correo').value = user.correo;
    document.getElementById('edit-telefono').value = user.telefono;
    document.getElementById('edit-tipo_contrato').value = user.tipo_contrato;
    modalInstance.show();
  } catch (error) {
    console.error(`Error al obtener datos del usuario ${userId}:`, error);
    alert('No se pudieron cargar los datos del usuario.');
  }
}

// --- MANEJADORES DE EVENTOS ---

async function handleUpdateSubmit(event) {
  event.preventDefault();
  const userId = document.getElementById('edit-user-id').value;
  const updatedData = {
    nombre_completo: document.getElementById('edit-nombre_completo').value,
    telefono: document.getElementById('edit-telefono').value,
    tipo_contrato: document.getElementById('edit-tipo_contrato').value,
  };

  let newEmail = document.getElementById('edit-correo').value;

  if (newEmail != originalMail) {
    updatedData.correo = newEmail;
  }

  try {
    await userService.updateUser(userId, updatedData);
    modalInstance.hide();
    await reloadUsersData(); // Usar reloadUsersData en lugar de init()
  } catch (error) {
    console.error(`Error al actualizar el usuario ${userId}:`, error);
    alert('No se pudo actualizar el usuario.');
  }
}

async function handleTableClick(event) {
  // Manejador para el botón de editar
  const editButton = event.target.closest('.btn-edit-user');
  if (editButton) {
    const userId = editButton.dataset.userId;
    openEditModal(userId);
    return;
  }
}

async function handleStatusSwitch(event) {
  const switchElement = event.target;
  if (!switchElement.classList.contains('user-status-switch')) return;

  const userId = switchElement.dataset.userId;
  const newStatus = switchElement.checked;
  const actionText = newStatus ? 'activar' : 'desactivar';
  
  if (confirm(`¿Estás seguro de que deseas ${actionText} este usuario?`)) {
    try {
      await userService.deleteUser(userId); // Esta función maneja el cambio de estado
      alert(`El usuario ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
      await reloadUsersData(); // Usar reloadUsersData en lugar de init()
    } catch (error) {
      console.error(`Error al ${actionText} el usuario ${userId}:`, error);
      alert(`No se pudo ${actionText} el usuario.`);
      // Revertir el switch si hay error
      switchElement.checked = !newStatus;
    }
  } else {
    // Revertir el switch si el usuario cancela
    switchElement.checked = !newStatus;
  }
}

// Los event listeners se manejan en setupEventListeners()

// Función para recargar datos manteniendo la búsqueda activa
async function reloadUsersData() {
  try {
    const users = await userService.getUsersByCentro();
    allUsers = users || [];
    
    // Mantener el término de búsqueda actual
    const searchInput = document.getElementById('user-search');
    const currentSearchTerm = searchInput ? searchInput.value : '';
    
    // Aplicar filtro con el término actual
    filterUsers(currentSearchTerm);
  } catch (error) {
    console.error('Error al recargar usuarios:', error);
    const tableBody = document.getElementById('users-table-body');
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al recargar los datos.</td></tr>`;
    }
  }
}

// --- MANEJADORES DE EVENTOS PARA BÚSQUEDA ---

function handleSearchInput(event) {
  const searchTerm = event.target.value;
  filterUsers(searchTerm);
}

function handleSearchKeydown(event) {
  // Limpiar búsqueda con Escape
  if (event.key === 'Escape') {
    clearSearch();
  }
}

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---

async function init() {
  const userString = localStorage.getItem('user');
  const currentUser = JSON.parse(userString);

  // Verificación de permisos
  if (![1, 2].includes(currentUser?.id_rol)) {
    const userSection = document.getElementById('user-management-section');
    if (userSection) {
      userSection.innerHTML = `
        <div class="alert alert-warning text-center">
          No tienes permiso para acceder al módulo de usuarios.
        </div>
      `;
    }
    return;
  }

  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando usuarios...</td></tr>';

  try {
    // Cargar usuarios una sola vez
    const users = await userService.getUsersByCentro();
    
    // Inicializar arrays globales
    allUsers = users || [];
    filteredUsers = [...allUsers];
    currentPage = 1;
    
    // Limpiar búsqueda anterior
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Renderizar usuarios con paginación
    if (allUsers.length > 0) {
      renderUsers(filteredUsers);
      updateSearchResultsCount('', filteredUsers.length, allUsers.length);
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>';
    }
    
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    
    // Limpiar arrays en caso de error
    allUsers = [];
    filteredUsers = [];
  }

  // Configurar event listeners
  setupEventListeners();
}

function setupEventListeners() {
  const tableBody = document.getElementById('users-table-body');
  const editForm = document.getElementById('edit-user-form');
  const searchInput = document.getElementById('user-search');
  const createUserButton = document.getElementById('btn-open-create-user');
  const createUserForm = document.getElementById('create-user-form');

  // Event listeners para tabla
  if (tableBody) {
    tableBody.removeEventListener('click', handleTableClick);
    tableBody.addEventListener('click', handleTableClick);
    tableBody.removeEventListener('change', handleStatusSwitch);
    tableBody.addEventListener('change', handleStatusSwitch);
  }

  // Event listeners para formulario de edición
  if (editForm) {
    editForm.removeEventListener('submit', handleUpdateSubmit);
    editForm.addEventListener('submit', handleUpdateSubmit);
  }

  // Event listeners para búsqueda
  if (searchInput && searchInput.offsetParent !== null) {
    searchInput.removeEventListener('input', handleSearchInput);
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.removeEventListener('keydown', handleSearchKeydown);
    searchInput.addEventListener('keydown', handleSearchKeydown);
  }

  // Event listener para botón de crear usuario
  if (createUserButton) {
    createUserButton.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('create-user-modal'));
      modal.show();
    });
  }

  // Event listener para formulario de crear usuario
  if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userString = localStorage.getItem('user');
      const user = JSON.parse(userString);

      const newUser = {
        nombre_completo: document.getElementById('create-nombre_completo').value,
        identificacion: document.getElementById('create-identificacion').value,
        correo: document.getElementById('create-correo').value,
        pass_hash: document.getElementById('create-pass_hash').value,
        telefono: document.getElementById('create-telefono').value,
        tipo_contrato: document.getElementById('create-tipo_contrato').value,
        id_rol: parseInt(document.getElementById('create-id_rol').value),
        estado: true,
        cod_centro: user.cod_centro
      };

      try {
        await userService.createUser(newUser);
        bootstrap.Modal.getInstance(document.getElementById('create-user-modal')).hide();
        alert('Usuario creado exitosamente');
        await reloadUsersData();
      } catch (error) {
        alert(error?.message || 'Error al crear usuario');
        console.error('Error creando usuario:', error);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.id_rol === 3) {
    const userMenuItem = document.querySelector('[data-page="usuarios"]');
    if (userMenuItem) {
      userMenuItem.style.display = 'none';
    }
  }
});

export { init };

