import { centroService } from '../api/centro.service.js';

// --- FUNCIONES DE VISTA (Generación de HTML) ---

function createCentroRow(centro) {
  return `
    <tr>
      <td>
        <div class="d-flex px-2 py-1">
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${centro.cod_centro}</h6>
            <p class="text-xs text-secondary mb-0">Código de Centro</p>
          </div>
        </div>
      </td>
      <td>
        <div class="d-flex flex-column justify-content-center">
          <h6 class="mb-0 text-sm">${centro.nombre_centro}</h6>
        </div>
      </td>
      <td class="align-middle text-center">
        <span class="badge bg-gradient-success">${centro.cod_regional}</span>
      </td>
      <td class="align-middle text-center">
        <button type="button" class="btn btn-sm btn-success btn-edit-centro" 
                data-cod-centro="${centro.cod_centro}"
                data-nombre-centro="${centro.nombre_centro}" 
                data-cod-regional="${centro.cod_regional}"
                data-bs-toggle="modal" 
                data-bs-target="#edit-centro-modal">
           Editar
        </button>
      </td>
    </tr>
  `;
}

// --- FUNCIONES DE CARGA DE DATOS ---

async function loadCentros() {
  console.log('🔄 Iniciando carga de centros...');
  
  const loadingSpinner = document.getElementById('loading-spinner');
  const errorMessage = document.getElementById('error-message');
  const tableContainer = document.getElementById('centros-table-container');
  const noDataMessage = document.getElementById('no-data-message');
  const tableBody = document.getElementById('centros-table-body');

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

    console.log('🚀 Llamando a centroService.getAllCentros()...');
    
    // Obtener centros desde la API
    const centros = await centroService.getAllCentros();
    
    console.log('✅ Respuesta recibida:', centros);
    console.log('📊 Número de centros:', centros ? centros.length : 'centros es null/undefined');

    // Ocultar indicador de carga
    loadingSpinner.style.display = 'none';

    if (centros && centros.length > 0) {
      console.log('📝 Generando filas de tabla...');
      // Mostrar tabla con datos
      tableBody.innerHTML = centros.map(createCentroRow).join('');
      tableContainer.style.display = 'block';
      console.log('✅ Tabla mostrada con', centros.length, 'centros');
      
      // Reconfigurar event listeners después de regenerar la tabla
      setupTableEventListeners();
    } else {
      console.log('⚠️ No hay centros para mostrar');
      // Mostrar mensaje de sin datos
      noDataMessage.style.display = 'block';
    }

  } catch (error) {
    console.error('❌ Error al cargar centros:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Ocultar indicador de carga y mostrar error
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    document.getElementById('error-text').textContent = error.message || 'Error al cargar los centros de formación';
  }
}

// --- FUNCIONES DE MODAL Y FORMULARIO ---

// Variables para almacenar datos del centro que se está editando
let currentEditingCentro = null;

function resetForm() {
  const form = document.getElementById('create-centro-form');
  form.reset();
  
  // Limpiar mensaje de error
  const errorMessage = document.getElementById('modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de envío
  const submitBtn = document.getElementById('btn-submit-centro');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  
  submitBtn.disabled = false;
  submitText.textContent = 'Crear Centro';
  submitLoading.style.display = 'none';
}

function showModalError(message) {
  const errorMessage = document.getElementById('modal-error-message');
  const errorText = document.getElementById('modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-centro');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.textContent = 'Creando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = 'Crear Centro';
    submitLoading.style.display = 'none';
  }
}

// async function handleCreateSubmit(event) {
//   event.preventDefault();
  
//   console.log('📝 Procesando formulario de creación de centro...');
  
//   // Limpiar errores previos
//   const errorMessage = document.getElementById('modal-error-message');
//   errorMessage.style.display = 'none';
  
//   // Mostrar loading
//   setSubmitLoading(true);
  
//   try {
//     // Obtener datos del formulario
//     const formData = new FormData(event.target);
//     const centroData = {
//       cod_centro: parseInt(formData.get('cod_centro')),
//       nombre_centro: formData.get('nombre_centro').trim(),
//       cod_regional: parseInt(formData.get('cod_regional'))
//     };
    
//     console.log('📊 Datos del centro a crear:', centroData);
    
//     // Validaciones básicas
//     if (!centroData.cod_centro || centroData.cod_centro < 1000 || centroData.cod_centro > 99999) {
//       throw new Error('El código del centro debe estar entre 1000 y 99999');
//     }
    
//     if (!centroData.nombre_centro || centroData.nombre_centro.length < 3) {
//       throw new Error('El nombre del centro debe tener al menos 3 caracteres');
//     }
    
//     if (!centroData.cod_regional || centroData.cod_regional < 1) {
//       throw new Error('El código regional es requerido');
//     }
    
//     // Crear el centro
//     const response = await centroService.createCentro(centroData);
    
//     console.log('✅ Centro creado exitosamente:', response);
    
//     // Cerrar modal
//     const modal = bootstrap.Modal.getInstance(document.getElementById('create-centro-modal'));
//     modal.hide();
    
//     // Mostrar mensaje de éxito (opcional - podrías agregar un toast)
//     console.log('🎉 ¡Centro creado exitosamente!');
    
//     // Recargar la tabla de centros
//     await loadCentros();
    
//   } catch (error) {
//     console.error('❌ Error al crear centro:', error);
//     showModalError(error.message || 'Error al crear el centro');
//   } finally {
//     setSubmitLoading(false);
//   }
// }

// --- FUNCIONES PARA EDICIÓN ---

// ...existing code...
async function handleCreateSubmit(event) {
  event.preventDefault();
  
  console.log('📝 Procesando formulario de creación de centro...');
  
  // Limpiar errores previos
  const errorMessage = document.getElementById('modal-error-message');
  errorMessage.style.display = 'none';
  
  // Mostrar loading
  setSubmitLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const centroData = {
      cod_centro: parseInt(formData.get('cod_centro')),
      nombre_centro: formData.get('nombre_centro').trim(),
      cod_regional: parseInt(formData.get('cod_regional'))
    };
    
    console.log('📊 Datos del centro a crear:', centroData);
    
    // Validaciones básicas
    if (!centroData.cod_centro || centroData.cod_centro < 1000 || centroData.cod_centro > 99999) {
      throw new Error('El código del centro debe estar entre 1000 y 99999');
    }
    
    if (!centroData.nombre_centro || centroData.nombre_centro.length < 3) {
      throw new Error('El nombre del centro debe tener al menos 3 caracteres');
    }
    
    if (!centroData.cod_regional || centroData.cod_regional < 1) {
      throw new Error('El código regional es requerido');
    }
    
    // Crear el centro
    const response = await centroService.createCentro(centroData);
    
    console.log('✅ Centro creado exitosamente:', response);
    
    // Cerrar modal y eliminar backdrop si persiste
    const modalElement = document.getElementById('create-centro-modal');
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) modal = new bootstrap.Modal(modalElement);
    modal.hide();
    // Eliminar backdrop si persiste
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Mostrar mensaje de éxito (opcional - podrías agregar un toast)
    console.log('🎉 ¡Centro creado exitosamente!');
    
    // Recargar la tabla de centros
    await loadCentros();
    
  } catch (error) {
    console.error('❌ Error al crear centro:', error);
    showModalError(error.message || 'Error al crear el centro');
  } finally {
    setSubmitLoading(false);
  }
}
// ...existing code...
async function handleEditSubmit(event) {
  event.preventDefault();
  
  console.log('📝 Procesando formulario de edición de centro...');
  
  if (!currentEditingCentro) {
    console.error('❌ No hay centro seleccionado para editar');
    showEditModalError('Error: No se encontró el centro a editar');
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
      nombre_centro: formData.get('nombre_centro').trim(),
      cod_regional: parseInt(formData.get('cod_regional'))
    };
    
    console.log('📊 Datos para actualizar:', updateData);
    console.log('🎯 Centro a actualizar (código):', currentEditingCentro.cod_centro);
    
    // Validaciones básicas
    if (!updateData.nombre_centro || updateData.nombre_centro.length < 3) {
      throw new Error('El nombre del centro debe tener al menos 3 caracteres');
    }
    
    if (!updateData.cod_regional || updateData.cod_regional < 1) {
      throw new Error('El código regional es requerido');
    }
    
    // Actualizar el centro
    const response = await centroService.updateCentro(currentEditingCentro.cod_centro, updateData);
    
    console.log('✅ Centro actualizado exitosamente:', response);
    
    // Cerrar modal y eliminar backdrop si persiste
    const modalElement = document.getElementById('edit-centro-modal');
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) modal = new bootstrap.Modal(modalElement);
    modal.hide();
    // Eliminar backdrop si persiste
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Limpiar referencia
    currentEditingCentro = null;
    
    // Mostrar mensaje de éxito
    console.log('🎉 ¡Centro actualizado exitosamente!');
    
    // Recargar la tabla de centros
    await loadCentros();
    
  } catch (error) {
    console.error('❌ Error al actualizar centro:', error);
    showEditModalError(error.message || 'Error al actualizar el centro');
  } finally {
    setEditSubmitLoading(false);
  }
}
// ...existing code...

function handleEditButtonClick(event) {
  const editButton = event.target.closest('.btn-edit-centro');
  if (!editButton) return;

  console.log('📝 Clic en botón editar centro');
  
  // Obtener datos del centro desde los data attributes
  const centroData = {
    cod_centro: parseInt(editButton.dataset.codCentro),
    nombre_centro: editButton.dataset.nombreCentro,
    cod_regional: parseInt(editButton.dataset.codRegional)
  };

  console.log('📊 Datos del centro a editar:', centroData);
  
  // Guardar referencia global para usar en el submit
  currentEditingCentro = centroData;
  
  // Poblar el formulario de edición
  populateEditForm(centroData);
}

function populateEditForm(centroData) {
  console.log('📝 Poblando formulario de edición:', centroData);
  
  // Poblar los campos
  document.getElementById('edit_cod_centro').value = centroData.cod_centro;
  document.getElementById('edit_nombre_centro').value = centroData.nombre_centro;
  document.getElementById('edit_cod_regional').value = centroData.cod_regional;
  
  // Limpiar mensajes de error
  const errorMessage = document.getElementById('edit-modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de envío
  resetEditSubmitButton();
}

function resetEditSubmitButton() {
  const submitBtn = document.getElementById('btn-submit-edit-centro');
  const submitText = document.getElementById('edit-submit-text');
  const submitLoading = document.getElementById('edit-submit-loading');
  
  submitBtn.disabled = false;
  submitText.textContent = 'Actualizar Centro';
  submitLoading.style.display = 'none';
}

function showEditModalError(message) {
  const errorMessage = document.getElementById('edit-modal-error-message');
  const errorText = document.getElementById('edit-modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setEditSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-edit-centro');
  const submitText = document.getElementById('edit-submit-text');
  const submitLoading = document.getElementById('edit-submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.textContent = 'Actualizando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = 'Actualizar Centro';
    submitLoading.style.display = 'none';
  }
}

// async function handleEditSubmit(event) {
//   event.preventDefault();
  
//   console.log('📝 Procesando formulario de edición de centro...');
  
//   if (!currentEditingCentro) {
//     console.error('❌ No hay centro seleccionado para editar');
//     showEditModalError('Error: No se encontró el centro a editar');
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
//       nombre_centro: formData.get('nombre_centro').trim(),
//       cod_regional: parseInt(formData.get('cod_regional'))
//     };
    
//     console.log('📊 Datos para actualizar:', updateData);
//     console.log('🎯 Centro a actualizar (código):', currentEditingCentro.cod_centro);
    
//     // Validaciones básicas
//     if (!updateData.nombre_centro || updateData.nombre_centro.length < 3) {
//       throw new Error('El nombre del centro debe tener al menos 3 caracteres');
//     }
    
//     if (!updateData.cod_regional || updateData.cod_regional < 1) {
//       throw new Error('El código regional es requerido');
//     }
    
//     // Actualizar el centro
//     const response = await centroService.updateCentro(currentEditingCentro.cod_centro, updateData);
    
//     console.log('✅ Centro actualizado exitosamente:', response);
    
//     // Cerrar modal
//     const modal = bootstrap.Modal.getInstance(document.getElementById('edit-centro-modal'));
//     modal.hide();
    
//     // Limpiar referencia
//     currentEditingCentro = null;
    
//     // Mostrar mensaje de éxito
//     console.log('🎉 ¡Centro actualizado exitosamente!');
    
//     // Recargar la tabla de centros
//     await loadCentros();
    
//   } catch (error) {
//     console.error('❌ Error al actualizar centro:', error);
//     showEditModalError(error.message || 'Error al actualizar el centro');
//   } finally {
//     setEditSubmitLoading(false);
//   }
// }

function setupEventListeners() {
  // Listener para el formulario de creación
  const createForm = document.getElementById('create-centro-form');
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateSubmit);
    createForm.addEventListener('submit', handleCreateSubmit);
  }
  
  // Listener para limpiar el formulario al abrir el modal de creación
  const createModal = document.getElementById('create-centro-modal');
  if (createModal) {
    createModal.addEventListener('show.bs.modal', resetForm);
  }

  // Listener para el formulario de edición
  const editForm = document.getElementById('edit-centro-form');
  if (editForm) {
    editForm.removeEventListener('submit', handleEditSubmit);
    editForm.addEventListener('submit', handleEditSubmit);
  }
  
  console.log('🔗 Event listeners de modales configurados');
}

function setupTableEventListeners() {
  // Listener para los botones de editar en la tabla
  const tableBody = document.getElementById('centros-table-body');
  if (tableBody) {
    tableBody.removeEventListener('click', handleEditButtonClick);
    tableBody.addEventListener('click', handleEditButtonClick);
  }
  
  console.log('🔗 Event listeners de tabla configurados');
}

// --- INICIALIZACIÓN ---

function init() {
  console.log('🚀 Inicializando módulo de centros...');
  loadCentros();
  setupEventListeners();
}

export { init }; 