import { userService } from '../api/user.service.js';

let modalInstance = null; // Guardará la instancia del modal de Bootstrap
let createModalInstance = null; // Guardará la instancia del modal de crear
let originalMail = null; // Guardará el correo original para validación

// Variables para el buscador
let allUsers = []; // Guardará todos los usuarios cargados
let filteredUsers = []; // Usuarios filtrados por la búsqueda

// Función para limpiar modales problemáticos
function cleanupModals() {
  // Remover clase modal-open del body
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('padding-right');
  
  // Remover cualquier backdrop residual
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());
  
  // Resetear el overflow del body
  document.body.style.overflow = '';
}

// Hacer la función disponible globalmente
window.cleanupModals = cleanupModals;

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
  
  renderUsers(filteredUsers);
  updateSearchResultsCount(searchTerm, filteredUsers.length, allUsers.length);
}

function renderUsers(users) {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;

  if (users.length > 0) {
    tableBody.innerHTML = users.map(createUserRow).join('');
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

  return `
    <tr>
    <td class="align-middle">
      <div class="d-flex px-2 py-1">
        <div>
          <img src="../assets/img/team-2.jpg" class="avatar avatar-sm me-3 border-radius-lg" alt="user1">
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
    <td class="text-center align-middle">
      <div class="status-switch-container">
        <input class="form-check-input user-status-switch" type="checkbox" role="switch" 
               id="switch-${userId}" data-user-id="${userId}" 
               ${user.estado ? 'checked' : ''}>
        <label class="form-check-label text-xs" for="switch-${userId}">
          ${user.estado ? 'Activo' : 'Inactivo'}
        </label>
      </div>
    </td>
    <td class="text-center align-middle">
      <span class="text-xs font-weight-bold text-secondary badge badge-pill">${user.rol}</span>
    </td>
    <td class="text-center align-middle">
      <button class="btn btn-sm btn-success btn-edit-user" data-user-id="${userId}">
        <i class="material-symbols-rounded me-1">edit</i>
        Editar
      </button>
    </td>
    </tr>
  `;
}

// --- LÓGICA DE MODAL ---

function openCreateModal() {
  const createModalElement = document.getElementById('create-usuario-modal');
  if (!createModalInstance) {
    createModalInstance = new bootstrap.Modal(createModalElement, {
      backdrop: 'static',
      keyboard: false
    });
    
    // Agregar event listeners para limpiar cuando se cierra
    createModalElement.addEventListener('hidden.bs.modal', function () {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    });
  }
  
  // Limpiar formulario
  document.getElementById('create-user-form').reset();
  createModalInstance.show();
}

async function openEditModal(userId) {
  const modalElement = document.getElementById('edit-user-modal');
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });
    
    // Agregar event listeners para limpiar cuando se cierra
    modalElement.addEventListener('hidden.bs.modal', function () {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    });
  }

  try {
    const user = await userService.getUserById(userId);
    originalMail = user.correo; // Guardamos el correo original para validación
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

async function handleCreateSubmit(event) {
  event.preventDefault();
  
  const newUserData = {
    nombre_completo: document.getElementById('create-nombre_completo').value,
    identificacion: document.getElementById('create-identificacion').value,
    id_rol: parseInt(document.getElementById('create-id_rol').value),
    correo: document.getElementById('create-correo').value,
    pass_hash: document.getElementById('create-pass_hash').value,
    tipo_contrato: document.getElementById('create-tipo_contrato').value,
    telefono: document.getElementById('create-telefono').value,
    estado: true, // Siempre activo por defecto
    cod_centro: parseInt(document.getElementById('create-cod_centro').value)
  };

  try {
    await userService.createUser(newUserData);
    
    // Cerrar modal correctamente
    if (createModalInstance) {
      createModalInstance.hide();
    }
    
    // Limpiar cualquier backdrop residual
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
    }, 300);
    
    alert('Usuario creado exitosamente');
    
    // Recargar datos y mantener búsqueda
    await reloadUsersData();
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    if (error.message && error.message.includes('400')) {
      alert('Correo ya registrado. Por favor usa otro correo.');
    } else if (error.message && error.message.includes('401')) {
      alert('No tienes permisos para realizar esta acción.');
    } else {
      alert('Error al crear el usuario. Por favor intenta nuevamente.');
    }
  }
}

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
    
    // Cerrar modal correctamente
    if (modalInstance) {
      modalInstance.hide();
    }
    
    // Limpiar cualquier backdrop residual
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
    }, 300);
    
    // Recargar datos y mantener búsqueda
    await reloadUsersData();
  } catch (error) {
    console.error(`Error al actualizar el usuario ${userId}:`, error);
    alert('No se pudo actualizar el usuario.');
  }
}

async function handleTableClick(event) {
  // Manejador para el botón de crear
  const createButton = event.target.closest('#btn-create-usuario');
  if (createButton) {
    openCreateModal();
    return;
  }

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
      
      // Recargar datos y mantener búsqueda
      await reloadUsersData();
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

function checkUserPermissions() {
  const userString = localStorage.getItem('user');
  if (!userString) {
    console.warn('No se encontró información del usuario');
    return false;
  }
  
  const user = JSON.parse(userString);
  const createButton = document.getElementById('btn-create-usuario');
  const searchContainer = document.querySelector('.search-container');
  
  console.log(`Usuario actual: ${user.nombre_completo}, Rol: ${user.id_rol}`);
  
  // Solo mostrar botón de crear si es superadmin (rol 1)
  if (user.id_rol !== 1) {
    if (createButton) {
      createButton.style.display = 'none';
    }
    console.log('Botón de crear usuario oculto - Usuario no es superadmin');
  }
  
  // Ocultar buscador para usuarios con rol 3
  if (user.id_rol === 3) {
    if (searchContainer) {
      searchContainer.style.display = 'none';
    }
    console.log('Buscador oculto - Usuario tiene rol 3');
    return false;
  }
  
  console.log('Usuario tiene permisos para ver el buscador');
  return true;
}

async function init() {
  // Verificar permisos del usuario
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  
  checkUserPermissions();
  
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando usuarios...</td></tr>';

  try {
    const users = await userService.getUsersByCentro();
    
    // Guardar todos los usuarios y inicializar filtrados
    allUsers = users || [];
    filteredUsers = [...allUsers];
    
    // Renderizar usuarios
    if (allUsers.length > 0) {
      renderUsers(filteredUsers);
      
      // Limpiar búsqueda anterior si existe
      const searchInput = document.getElementById('user-search');
      if (searchInput) {
        searchInput.value = '';
      }
      updateSearchResultsCount('', filteredUsers.length, allUsers.length);
    } else {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>';
    }
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    
    // Limpiar arrays en caso de error
    allUsers = [];
    filteredUsers = [];
    
    // Si es un error de permisos, mostrar mensaje específico
    if (error.message && error.message.includes('Acceso denegado')) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center p-4">
            <div class="alert alert-warning" role="alert">
              <i class="material-symbols-rounded me-2">warning</i>
              <strong>Acceso restringido:</strong> No tienes permisos para ver la lista de usuarios.
              <br><small>Solo los administradores pueden acceder a esta función.</small>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    }
  }

  // Aplicamos el patrón remove/add para evitar listeners duplicados
  const editForm = document.getElementById('edit-user-form');
  const createForm = document.getElementById('create-user-form');
  const createButton = document.getElementById('btn-create-usuario');
  const searchInput = document.getElementById('user-search');
  
  // Event listeners para tabla
  tableBody.removeEventListener('click', handleTableClick);
  tableBody.addEventListener('click', handleTableClick);
  tableBody.removeEventListener('change', handleStatusSwitch);
  tableBody.addEventListener('change', handleStatusSwitch);
  
  // Event listeners para formularios
  if (editForm) {
    editForm.removeEventListener('submit', handleUpdateSubmit);
    editForm.addEventListener('submit', handleUpdateSubmit);
  }
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateSubmit);
    createForm.addEventListener('submit', handleCreateSubmit);
  }
  
  // Event listener para botón crear
  if (createButton) {
    createButton.removeEventListener('click', openCreateModal);
    createButton.addEventListener('click', openCreateModal);
  }
  
  // Event listeners para búsqueda (solo si el buscador está visible)
  if (searchInput && searchInput.offsetParent !== null) {
    searchInput.removeEventListener('input', handleSearchInput);
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.removeEventListener('keydown', handleSearchKeydown);
    searchInput.addEventListener('keydown', handleSearchKeydown);
  }
}

export { init };