import { ambienteService } from '../api/ambiente.service.js';

// --- FUNCIONES DE VISTA (Generación de HTML) ---

function createAmbienteRow(ambiente) {
  const statusSwitch = `
    <div class="form-check form-switch ms-2 d-inline-block">
      <input class="form-check-input ambiente-status-switch" type="checkbox" role="switch" 
             id="switch-${ambiente.id_ambiente}" data-ambiente-id="${ambiente.id_ambiente}" 
             ${ambiente.estado ? 'checked' : ''}>
      <label class="form-check-label" for="switch-${ambiente.id_ambiente}">
        ${ambiente.estado ? 'Activo' : 'Inactivo'}
      </label>
    </div>
  `;

  return `
    <tr>
      <td class="align-middle">
        <div class="d-flex px-2 py-1 align-items-center">
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${ambiente.nombre_ambiente}</h6>
            <p class="text-xs text-secondary mb-0">ID: ${ambiente.id_ambiente}</p>
          </div>
        </div>
      </td>
      <td class="align-middle">
        <div class="d-flex align-items-center px-2">
          <h6 class="mb-0 text-sm">${ambiente.ubicacion}</h6>
        </div>
      </td>
      <td class="align-middle text-center">
        <span class="badge bg-gradient-success">${ambiente.num_max_aprendices} estudiantes</span>
      </td>
      <td class="align-middle text-center">
        <span class="text-secondary text-xs font-weight-bold">${ambiente.municipio}</span>
      </td>
      <td class="align-middle text-center">
        ${statusSwitch}
      </td>
      <td class="align-middle text-center">
        <button type="button" class="btn btn-sm btn-success btn-edit-ambiente" 
                data-id-ambiente="${ambiente.id_ambiente}"
                data-nombre-ambiente="${ambiente.nombre_ambiente}" 
                data-num-max-aprendices="${ambiente.num_max_aprendices}"
                data-municipio="${ambiente.municipio}"
                data-ubicacion="${ambiente.ubicacion}"
                data-bs-toggle="modal" 
                data-bs-target="#edit-ambiente-modal">
          Editar
        </button>
      </td>
    </tr>
  `;
}

// --- FUNCIONES DE INFORMACIÓN DEL USUARIO ---

function displayCentroInfo() {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const centroNombre = document.getElementById('centro-nombre');
      
      if (centroNombre && user.cod_centro) {
        // Obtener el nombre del centro del usuario si está disponible
        centroNombre.textContent = `Centro ${user.cod_centro}`;
        console.log('ℹ️ Mostrando información del centro:', user.cod_centro);
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener información del centro:', error);
  }
}

// --- FUNCIONES DE CARGA DE DATOS ---

async function loadAmbientes() {
  console.log('🔄 Iniciando carga de ambientes...');
  
  const loadingSpinner = document.getElementById('loading-spinner');
  const errorMessage = document.getElementById('error-message');
  const tableContainer = document.getElementById('ambientes-table-container');
  const noDataMessage = document.getElementById('no-data-message');
  const tableBody = document.getElementById('ambientes-table-body');

  // Verificar que los elementos existen
  console.log('📋 Elementos DOM encontrados:', {
    loadingSpinner: !!loadingSpinner,
    errorMessage: !!errorMessage,
    tableContainer: !!tableContainer,
    noDataMessage: !!noDataMessage,
    tableBody: !!tableBody
  });

  try {
    // Mostrar indicador de carga
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    tableContainer.style.display = 'none';
    noDataMessage.style.display = 'none';

    console.log('🚀 Llamando a ambienteService.getAmbientesByCentro()...');
    
    // Obtener ambientes desde la API
    const ambientes = await ambienteService.getAmbientesByCentro();
    
    console.log('✅ Respuesta recibida:', ambientes);
    console.log('📊 Número de ambientes:', ambientes ? ambientes.length : 'ambientes es null/undefined');

    // Ocultar indicador de carga
    loadingSpinner.style.display = 'none';

    if (ambientes && ambientes.length > 0) {
      console.log('📝 Generando filas de tabla...');
      // Mostrar tabla con datos
      tableBody.innerHTML = ambientes.map(createAmbienteRow).join('');
      tableContainer.style.display = 'block';
      console.log('✅ Tabla mostrada con', ambientes.length, 'ambientes');
      
      // Reconfigurar event listeners después de regenerar la tabla
      setupTableEventListeners();
    } else {
      console.log('⚠️ No hay ambientes para mostrar');
      // Mostrar mensaje de sin datos
      noDataMessage.style.display = 'block';
    }

  } catch (error) {
    console.error('❌ Error al cargar ambientes:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Ocultar indicador de carga y mostrar error
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    document.getElementById('error-text').textContent = error.message || 'Error al cargar los ambientes de formación';
  }
}

// --- FUNCIONES DE MODAL Y FORMULARIO ---

// Variables para almacenar datos del ambiente que se está editando
let currentEditingAmbiente = null;

function resetForm() {
  const form = document.getElementById('create-ambiente-form');
  form.reset();
  
  // Restaurar estado por defecto (activo)
  const estadoCheckbox = document.getElementById('estado');
  const estadoLabel = document.getElementById('estado-label');
  estadoCheckbox.checked = true;
  estadoLabel.textContent = 'Activo';
  
  // Limpiar mensaje de error
  const errorMessage = document.getElementById('modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de envío
  const submitBtn = document.getElementById('btn-submit-ambiente');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  
  submitBtn.disabled = false;
  submitText.textContent = 'Crear Ambiente';
  submitLoading.style.display = 'none';

  // Mostrar información del centro en el modal
  displayModalCentroInfo();
}

function displayModalCentroInfo() {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const modalCentroInfo = document.getElementById('modal-centro-info');
      
      if (modalCentroInfo && user.cod_centro) {
        modalCentroInfo.textContent = `Centro ${user.cod_centro} - Se asignará automáticamente`;
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener información del centro para el modal:', error);
  }
}

function handleEstadoChange() {
  const estadoCheckbox = document.getElementById('estado');
  const estadoLabel = document.getElementById('estado-label');
  
  if (estadoCheckbox.checked) {
    estadoLabel.textContent = 'Activo';
  } else {
    estadoLabel.textContent = 'Inactivo';
  }
}

function showModalError(message) {
  const errorMessage = document.getElementById('modal-error-message');
  const errorText = document.getElementById('modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-ambiente');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.textContent = 'Creando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = 'Crear Ambiente';
    submitLoading.style.display = 'none';
  }
}

// async function handleCreateSubmit(event) {
//   event.preventDefault();
  
//   console.log('📝 Procesando formulario de creación de ambiente...');
  
//   // Limpiar errores previos
//   const errorMessage = document.getElementById('modal-error-message');
//   errorMessage.style.display = 'none';
  
//   // Mostrar loading
//   setSubmitLoading(true);
  
//   try {
//     // Obtener datos del formulario
//     const formData = new FormData(event.target);
//     const ambienteData = {
//       nombre_ambiente: formData.get('nombre_ambiente').trim(),
//       num_max_aprendices: parseInt(formData.get('num_max_aprendices')),
//       municipio: formData.get('municipio').trim(),
//       ubicacion: formData.get('ubicacion').trim(),
//       estado: formData.has('estado') // checkbox está marcado
//     };
    
//     console.log('📊 Datos del ambiente a crear:', ambienteData);
    
//     // Validaciones básicas
//     if (!ambienteData.nombre_ambiente || ambienteData.nombre_ambiente.length < 3) {
//       throw new Error('El nombre del ambiente debe tener al menos 3 caracteres');
//     }
    
//     if (!ambienteData.num_max_aprendices || ambienteData.num_max_aprendices < 1 || ambienteData.num_max_aprendices > 100) {
//       throw new Error('La capacidad máxima debe estar entre 1 y 100 aprendices');
//     }
    
//     if (!ambienteData.municipio || ambienteData.municipio.length < 3) {
//       throw new Error('El municipio debe tener al menos 3 caracteres');
//     }
    
//     if (!ambienteData.ubicacion || ambienteData.ubicacion.length < 10) {
//       throw new Error('La ubicación debe tener al menos 10 caracteres');
//     }
    
//     // Crear el ambiente
//     const response = await ambienteService.createAmbiente(ambienteData);
    
//     console.log('✅ Ambiente creado exitosamente:', response);
    
//     // Cerrar modal
//     const modal = bootstrap.Modal.getInstance(document.getElementById('create-ambiente-modal'));
//     modal.hide();
    
//     // Mostrar mensaje de éxito
//     console.log('🎉 ¡Ambiente creado exitosamente!');
    
//     // Recargar la tabla de ambientes
//     await loadAmbientes();
    
//   } catch (error) {
//     console.error('❌ Error al crear ambiente:', error);
//     showModalError(error.message || 'Error al crear el ambiente');
//   } finally {
//     setSubmitLoading(false);
//   }
// }

// --- FUNCIONES PARA CAMBIO DE ESTADO ---
// ...existing code...
async function handleCreateSubmit(event) {
  event.preventDefault();
  
  console.log('📝 Procesando formulario de creación de ambiente...');
  
  // Limpiar errores previos
  const errorMessage = document.getElementById('modal-error-message');
  errorMessage.style.display = 'none';
  
  // Mostrar loading
  setSubmitLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const ambienteData = {
      nombre_ambiente: formData.get('nombre_ambiente').trim(),
      num_max_aprendices: parseInt(formData.get('num_max_aprendices')),
      municipio: formData.get('municipio').trim(),
      ubicacion: formData.get('ubicacion').trim(),
      estado: formData.has('estado')
    };
    
    console.log('📊 Datos del ambiente a crear:', ambienteData);
    
    // Validaciones básicas
    if (!ambienteData.nombre_ambiente || ambienteData.nombre_ambiente.length < 3) {
      throw new Error('El nombre del ambiente debe tener al menos 3 caracteres');
    }
    if (!ambienteData.num_max_aprendices || ambienteData.num_max_aprendices < 1 || ambienteData.num_max_aprendices > 100) {
      throw new Error('La capacidad máxima debe estar entre 1 y 100 aprendices');
    }
    if (!ambienteData.municipio || ambienteData.municipio.length < 3) {
      throw new Error('El municipio debe tener al menos 3 caracteres');
    }
    if (!ambienteData.ubicacion || ambienteData.ubicacion.length < 10) {
      throw new Error('La ubicación debe tener al menos 10 caracteres');
    }
    
    // Crear el ambiente
    const response = await ambienteService.createAmbiente(ambienteData);
    
    console.log('✅ Ambiente creado exitosamente:', response);
    
    // Cerrar modal y eliminar backdrop si persiste
    const modalElement = document.getElementById('create-ambiente-modal');
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) modal = new bootstrap.Modal(modalElement);
    modal.hide();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Mostrar mensaje de éxito
    console.log('🎉 ¡Ambiente creado exitosamente!');
    
    // Recargar la tabla de ambientes
    await loadAmbientes();
    
  } catch (error) {
    console.error('❌ Error al crear ambiente:', error);
    showModalError(error.message || 'Error al crear el ambiente');
  } finally {
    setSubmitLoading(false);
  }
}
// ...existing code...
async function handleEditSubmit(event) {
  event.preventDefault();
  
  console.log('📝 Procesando formulario de edición de ambiente...');
  
  if (!currentEditingAmbiente) {
    console.error('❌ No hay ambiente seleccionado para editar');
    showEditModalError('Error: No se encontró el ambiente a editar');
    return;
  }
  
  // Limpiar errores previos
  const errorMessage = document.getElementById('edit-modal-error-message');
  errorMessage.style.display = 'none';
  
  // Mostrar loading
  setEditSubmitLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const updateData = {
      nombre_ambiente: formData.get('nombre_ambiente').trim(),
      num_max_aprendices: parseInt(formData.get('num_max_aprendices')),
      municipio: formData.get('municipio').trim(),
      ubicacion: formData.get('ubicacion').trim()
    };
    
    console.log('📊 Datos para actualizar:', updateData);
    console.log('🎯 Ambiente a actualizar (ID):', currentEditingAmbiente.id_ambiente);
    
    // Validaciones básicas
    if (!updateData.nombre_ambiente || updateData.nombre_ambiente.length < 3) {
      throw new Error('El nombre del ambiente debe tener al menos 3 caracteres');
    }
    if (!updateData.num_max_aprendices || updateData.num_max_aprendices < 1 || updateData.num_max_aprendices > 100) {
      throw new Error('La capacidad máxima debe estar entre 1 y 100 aprendices');
    }
    if (!updateData.municipio || updateData.municipio.length < 3) {
      throw new Error('El municipio debe tener al menos 3 caracteres');
    }
    if (!updateData.ubicacion || updateData.ubicacion.length < 10) {
      throw new Error('La ubicación debe tener al menos 10 caracteres');
    }
    
    // Actualizar el ambiente
    const response = await ambienteService.updateAmbiente(currentEditingAmbiente.id_ambiente, updateData);
    
    console.log('✅ Ambiente actualizado exitosamente:', response);
    
    // Cerrar modal y eliminar backdrop si persiste
    const modalElement = document.getElementById('edit-ambiente-modal');
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) modal = new bootstrap.Modal(modalElement);
    modal.hide();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Limpiar referencia
    currentEditingAmbiente = null;
    
    // Mostrar mensaje de éxito
    console.log('🎉 ¡Ambiente actualizado exitosamente!');
    
    // Recargar la tabla de ambientes
    await loadAmbientes();
    
  } catch (error) {
    console.error('❌ Error al actualizar ambiente:', error);
    showEditModalError(error.message || 'Error al actualizar el ambiente');
  } finally {
    setEditSubmitLoading(false);
  }
}
// ...existing code...


async function handleStatusSwitch(event) {
  const switchElement = event.target;
  
  // Solo procesar si es un switch de estado de ambiente
  if (!switchElement.classList.contains('ambiente-status-switch')) {
    return;
  }
  
  const ambienteId = parseInt(switchElement.dataset.ambienteId);
  const label = switchElement.nextElementSibling;
  
  if (!ambienteId || !label) {
    console.error('❌ Error: No se pudo obtener ID del ambiente o label');
    return;
  }
  
  console.log(`🔄 Cambiando estado del ambiente ${ambienteId} a:`, switchElement.checked ? 'Activo' : 'Inactivo');
  
  // Deshabilitar el switch mientras se procesa
  switchElement.disabled = true;
  
  try {
    // Llamar al servicio para modificar el estado
    const response = await ambienteService.modifyStatus(ambienteId);
    
    console.log('✅ Estado modificado exitosamente:', response);
    
    // Actualizar el label
    label.textContent = switchElement.checked ? 'Activo' : 'Inactivo';
    
    // Opcional: mostrar mensaje de éxito temporal
    showStatusChangeSuccess(switchElement.checked ? 'activado' : 'desactivado');
    
  } catch (error) {
    console.error('❌ Error al modificar estado:', error);
    
    // Revertir el switch al estado anterior
    switchElement.checked = !switchElement.checked;
    label.textContent = switchElement.checked ? 'Activo' : 'Inactivo';
    
    // Mostrar mensaje de error
    showStatusChangeError(error.message || 'Error al cambiar el estado del ambiente');
  } finally {
    // Rehabilitar el switch
    switchElement.disabled = false;
  }
}

function showStatusChangeSuccess(action) {
  // Crear un toast o mensaje temporal de éxito
  console.log(`🎉 Ambiente ${action} exitosamente`);
  
  // Opcional: aquí podrías agregar un toast notification
  // Por ahora solo lo logueamos
}

function showStatusChangeError(message) {
  // Mostrar error temporal
  console.error('❌ Error:', message);
  
  // Opcional: aquí podrías mostrar un toast de error
  // Por ahora solo lo logueamos
}

// --- FUNCIONES PARA EDICIÓN ---

function handleEditButtonClick(event) {
  const editButton = event.target.closest('.btn-edit-ambiente');
  if (!editButton) return;

  console.log('📝 Clic en botón editar ambiente');
  
  // Obtener datos del ambiente desde los data attributes
  const ambienteData = {
    id_ambiente: parseInt(editButton.dataset.idAmbiente),
    nombre_ambiente: editButton.dataset.nombreAmbiente,
    num_max_aprendices: parseInt(editButton.dataset.numMaxAprendices),
    municipio: editButton.dataset.municipio,
    ubicacion: editButton.dataset.ubicacion
  };

  console.log('📊 Datos del ambiente a editar:', ambienteData);
  
  // Guardar referencia global para usar en el submit
  currentEditingAmbiente = ambienteData;
  
  // Poblar el formulario de edición
  populateEditForm(ambienteData);
}

function populateEditForm(ambienteData) {
  console.log('📝 Poblando formulario de edición:', ambienteData);
  
  // Poblar los campos
  document.getElementById('edit_id_ambiente').value = ambienteData.id_ambiente;
  document.getElementById('edit_nombre_ambiente').value = ambienteData.nombre_ambiente;
  document.getElementById('edit_num_max_aprendices').value = ambienteData.num_max_aprendices;
  document.getElementById('edit_municipio').value = ambienteData.municipio;
  document.getElementById('edit_ubicacion').value = ambienteData.ubicacion;
  
  // Limpiar mensajes de error
  const errorMessage = document.getElementById('edit-modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de envío
  resetEditSubmitButton();
}

function resetEditSubmitButton() {
  const submitBtn = document.getElementById('btn-submit-edit-ambiente');
  const submitText = document.getElementById('edit-submit-text');
  const submitLoading = document.getElementById('edit-submit-loading');
  
  submitBtn.disabled = false;
  submitText.textContent = 'Actualizar Ambiente';
  submitLoading.style.display = 'none';
}

function showEditModalError(message) {
  const errorMessage = document.getElementById('edit-modal-error-message');
  const errorText = document.getElementById('edit-modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setEditSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-edit-ambiente');
  const submitText = document.getElementById('edit-submit-text');
  const submitLoading = document.getElementById('edit-submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.textContent = 'Actualizando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = 'Actualizar Ambiente';
    submitLoading.style.display = 'none';
  }
}

// async function handleEditSubmit(event) {
//   event.preventDefault();
  
//   console.log('📝 Procesando formulario de edición de ambiente...');
  
//   if (!currentEditingAmbiente) {
//     console.error('❌ No hay ambiente seleccionado para editar');
//     showEditModalError('Error: No se encontró el ambiente a editar');
//     return;
//   }
  
//   // Limpiar errores previos
//   const errorMessage = document.getElementById('edit-modal-error-message');
//   errorMessage.style.display = 'none';
  
//   // Mostrar loading
//   setEditSubmitLoading(true);
  
//   try {
//     // Obtener datos del formulario
//     const formData = new FormData(event.target);
//     const updateData = {
//       nombre_ambiente: formData.get('nombre_ambiente').trim(),
//       num_max_aprendices: parseInt(formData.get('num_max_aprendices')),
//       municipio: formData.get('municipio').trim(),
//       ubicacion: formData.get('ubicacion').trim()
//     };
    
//     console.log('📊 Datos para actualizar:', updateData);
//     console.log('🎯 Ambiente a actualizar (ID):', currentEditingAmbiente.id_ambiente);
    
//     // Validaciones básicas
//     if (!updateData.nombre_ambiente || updateData.nombre_ambiente.length < 3) {
//       throw new Error('El nombre del ambiente debe tener al menos 3 caracteres');
//     }
    
//     if (!updateData.num_max_aprendices || updateData.num_max_aprendices < 1 || updateData.num_max_aprendices > 100) {
//       throw new Error('La capacidad máxima debe estar entre 1 y 100 aprendices');
//     }
    
//     if (!updateData.municipio || updateData.municipio.length < 3) {
//       throw new Error('El municipio debe tener al menos 3 caracteres');
//     }
    
//     if (!updateData.ubicacion || updateData.ubicacion.length < 10) {
//       throw new Error('La ubicación debe tener al menos 10 caracteres');
//     }
    
//     // Actualizar el ambiente
//     const response = await ambienteService.updateAmbiente(currentEditingAmbiente.id_ambiente, updateData);
    
//     console.log('✅ Ambiente actualizado exitosamente:', response);
    
//     // Cerrar modal
//     const modal = bootstrap.Modal.getInstance(document.getElementById('edit-ambiente-modal'));
//     modal.hide();
    
//     // Limpiar referencia
//     currentEditingAmbiente = null;
    
//     // Mostrar mensaje de éxito
//     console.log('🎉 ¡Ambiente actualizado exitosamente!');
    
//     // Recargar la tabla de ambientes
//     await loadAmbientes();
    
//   } catch (error) {
//     console.error('❌ Error al actualizar ambiente:', error);
//     showEditModalError(error.message || 'Error al actualizar el ambiente');
//   } finally {
//     setEditSubmitLoading(false);
//   }
// }

function setupTableEventListeners() {
  // Listener para los botones de editar en la tabla
  const tableBody = document.getElementById('ambientes-table-body');
  if (tableBody) {
    tableBody.removeEventListener('click', handleEditButtonClick);
    tableBody.addEventListener('click', handleEditButtonClick);
    
    // Listener para los switches de estado
    tableBody.removeEventListener('change', handleStatusSwitch);
    tableBody.addEventListener('change', handleStatusSwitch);
  }
  
  console.log('🔗 Event listeners de tabla configurados');
}

function setupEventListeners() {
  // Listener para el formulario de creación
  const createForm = document.getElementById('create-ambiente-form');
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateSubmit);
    createForm.addEventListener('submit', handleCreateSubmit);
  }
  
  // Listener para limpiar el formulario al abrir el modal de creación
  const createModal = document.getElementById('create-ambiente-modal');
  if (createModal) {
    createModal.addEventListener('show.bs.modal', resetForm);
  }

  // Listener para el switch de estado
  const estadoCheckbox = document.getElementById('estado');
  if (estadoCheckbox) {
    estadoCheckbox.removeEventListener('change', handleEstadoChange);
    estadoCheckbox.addEventListener('change', handleEstadoChange);
  }

  // Listener para el formulario de edición
  const editForm = document.getElementById('edit-ambiente-form');
  if (editForm) {
    editForm.removeEventListener('submit', handleEditSubmit);
    editForm.addEventListener('submit', handleEditSubmit);
  }
  
  console.log('🔗 Event listeners de modales configurados');
}

// --- INICIALIZACIÓN ---

function init() {
  console.log('🚀 Inicializando módulo de ambientes...');
  displayCentroInfo();
  loadAmbientes();
  setupEventListeners();
}

export { init }; 