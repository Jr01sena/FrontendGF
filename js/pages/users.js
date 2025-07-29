import { userService } from '../api/user.service.js';

let modalInstance = null; // Guardará la instancia del modal de Bootstrap
let originalMail = null;
let usuarios = [];      // Lista completa de usuarios
let currentPage = 1;
const pageSize = 5;     // Usuarios por página



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
    init(); // Recargamos la tabla para ver los cambios
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
      init(); // Recargamos la tabla para ver los cambios
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

document.getElementById('btn-open-create-user').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('create-user-modal'));
  modal.show();
});

document.getElementById('create-user-form').addEventListener('submit', async (e) => {
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
    init(); // recargar tabla
  } catch (error) {
    alert(error?.message || 'Error al crear usuario');
    console.error('Error creando usuario:', error);
  }
});


// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---

// async function init() {
//   const userString = localStorage.getItem('user');
//   const currentUser = JSON.parse(userString);

//   // Validar permisos (solo roles 1 y 2 pueden ver el módulo)
//   if (![1, 2].includes(currentUser?.id_rol)) {
//     const userSection = document.getElementById('user-management-section');
//     if (userSection) {
//       userSection.innerHTML = `
//         <div class="alert alert-warning text-center">
//           No tienes permiso para acceder al módulo de usuarios.
//         </div>
//       `;
//     }
//     return; // Evita que se ejecute el resto de init()
//   }
//   const tableBody = document.getElementById('users-table-body');
//   if (!tableBody) return;

//   tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando usuarios...</td></tr>'; // ✅ CORRECCIÓN: colspan="6"

//   try {
//     const users = await userService.getUsersByCentro();
//     if (users && users.length > 0) {
//       tableBody.innerHTML = users.map(createUserRow).join('');
//     } else {
//       tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>'; // ✅ CORRECCIÓN: colspan="6"
//     }
//   } catch (error) {
//     console.error('Error al obtener los usuarios:', error);
//     tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar los datos.</td></tr>`; // ✅ CORRECCIÓN: colspan="6"
//   }

//   // Aplicamos el patrón remove/add para evitar listeners duplicados
//   const editForm = document.getElementById('edit-user-form');
//   tableBody.removeEventListener('click', handleTableClick);
//   tableBody.addEventListener('click', handleTableClick);
//   tableBody.removeEventListener('change', handleStatusSwitch);
//   tableBody.addEventListener('change', handleStatusSwitch);
//   editForm.removeEventListener('submit', handleUpdateSubmit);
//   editForm.addEventListener('submit', handleUpdateSubmit);

// }

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
    usuarios = await userService.getUsersByCentro(); // ← se guarda globalmente
    if (usuarios.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios.</td></tr>';
      return;
    }
    renderizarUsuarios();  // ← muestra la primera página
    renderizarPaginador(); // ← genera el paginador
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
  }

  const editForm = document.getElementById('edit-user-form');
  tableBody.removeEventListener('click', handleTableClick);
  tableBody.addEventListener('click', handleTableClick);
  tableBody.removeEventListener('change', handleStatusSwitch);
  tableBody.addEventListener('change', handleStatusSwitch);
  editForm.removeEventListener('submit', handleUpdateSubmit);
  editForm.addEventListener('submit', handleUpdateSubmit);
}

function renderizarUsuarios() {
  const tableBody = document.getElementById('users-table-body');
  tableBody.innerHTML = "";

  const inicio = (currentPage - 1) * pageSize;
  const fin = inicio + pageSize;
  const paginaActual = usuarios.slice(inicio, fin);

  if (paginaActual.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay usuarios en esta página.</td></tr>';
    return;
  }

  tableBody.innerHTML = paginaActual.map(createUserRow).join("");
}

function renderizarPaginador() {
  const totalPages = Math.ceil(usuarios.length / pageSize);
  const paginador = document.getElementById("paginador-usuarios"); // ID en tu HTML
  paginador.innerHTML = "";

  if (totalPages <= 1) return;

  const ul = document.createElement("ul");
  ul.className = "pagination justify-content-center my-3";

  const crearItem = (label, page, disabled = false, active = false) => {
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
        renderizarUsuarios();
        renderizarPaginador();
      }
    });

    li.appendChild(a);
    return li;
  };

  ul.appendChild(crearItem("«", currentPage - 1, currentPage === 1));

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    ul.appendChild(crearItem(i, i, false, i === currentPage));
  }

  ul.appendChild(crearItem("»", currentPage + 1, currentPage === totalPages));

  paginador.appendChild(ul);
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