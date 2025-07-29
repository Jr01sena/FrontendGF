import { metaService } from '../api/meta.service.js';

// --- FUNCIONES DE VISTA (Generación de HTML) ---

function createMetaRow(meta) {
  // Formatear el concepto para mejor presentación
  const conceptoFormatted = meta.concepto.charAt(0).toUpperCase() + meta.concepto.slice(1);
  
  return `
    <tr>
      <td>
        <div class="d-flex px-2 py-1">
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${meta.anio}</h6>
            <p class="text-xs text-secondary mb-0">Año</p>
          </div>
        </div>
      </td>
      <td>
        <div class="d-flex flex-column justify-content-center">
          <h6 class="mb-0 text-sm">${conceptoFormatted}</h6>
          <p class="text-xs text-secondary mb-0">Concepto de meta</p>
        </div>
      </td>
      <td class="align-middle text-center">
        <span class="badge bg-gradient-success font-weight-bold">${meta.valor.toLocaleString()}</span>
      </td>
      <td class="align-middle text-center">
        <span class="text-secondary text-xs font-weight-bold">${meta.id_meta}</span>
      </td>
      <td class="align-middle text-center">
        <button type="button" class="btn btn-sm btn-success btn-edit-meta me-2" 
                data-id-meta="${meta.id_meta}"
                data-anio="${meta.anio}" 
                data-concepto="${meta.concepto}"
                data-valor="${meta.valor}"
                data-bs-toggle="modal" 
                data-bs-target="#edit-meta-modal">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button type="button" class="btn btn-sm btn-danger btn-delete-meta" 
                data-id-meta="${meta.id_meta}"
                data-concepto="${meta.concepto}"
                data-anio="${meta.anio}">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </td>
    </tr>
  `;
}

function populateYearFilter(metas) {
  const yearFilter = document.getElementById('year-filter');
  if (!yearFilter) return;

  // Obtener años únicos de las metas
  const uniqueYears = [...new Set(metas.map(meta => meta.anio))].sort((a, b) => b - a);
  
  // Limpiar opciones existentes (excepto "Todos los años")
  yearFilter.innerHTML = '<option value="">Todos los años</option>';
  
  // Agregar años únicos
  uniqueYears.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  console.log('📅 Filtro de años poblado con:', uniqueYears);
}

function updateStats(metas) {
  if (!metas || metas.length === 0) {
    // Ocultar estadísticas si no hay datos
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) statsContainer.style.display = 'none';
    return;
  }

  // Calcular estadísticas
  const totalMetas = metas.length;
  const totalValue = metas.reduce((sum, meta) => sum + meta.valor, 0);

  // Actualizar elementos del DOM
  const totalMetasEl = document.getElementById('total-metas');
  const totalValueEl = document.getElementById('total-value');

  if (totalMetasEl) totalMetasEl.textContent = totalMetas.toLocaleString();
  if (totalValueEl) totalValueEl.textContent = totalValue.toLocaleString();

  // Mostrar contenedor de estadísticas
  const statsContainer = document.getElementById('stats-container');
  if (statsContainer) statsContainer.style.display = 'flex';

  console.log('📊 Estadísticas actualizadas:', {
    totalMetas,
    totalValue
  });
}

function updateCentroInfo() {
  const userString = localStorage.getItem('user');
  if (!userString) return;

  try {
    const user = JSON.parse(userString);
    const centroNombreEl = document.getElementById('centro-nombre');
    const centroCodigoEl = document.getElementById('centro-codigo');
    const centroInfoEl = document.getElementById('centro-info');

    if (centroNombreEl && user.nombre_centro) {
      centroNombreEl.textContent = user.nombre_centro;
    }
    if (centroCodigoEl && user.cod_centro) {
      centroCodigoEl.textContent = user.cod_centro;
    }
    if (centroInfoEl) {
      centroInfoEl.style.display = 'block';
    }
  } catch (error) {
    console.error('❌ Error al mostrar información del centro:', error);
  }
}

// --- FUNCIONES DE CARGA DE DATOS ---

async function loadMetas(selectedYear = null) {
  console.log('🔄 Iniciando carga de metas...');
  console.log('📅 Año seleccionado:', selectedYear || 'Todos');
  
  const loadingSpinner = document.getElementById('loading-spinner');
  const errorMessage = document.getElementById('error-message');
  const tableContainer = document.getElementById('metas-table-container');
  const noDataMessage = document.getElementById('no-data-message');
  const tableBody = document.getElementById('metas-table-body');

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

    console.log('🚀 Llamando a metaService.getMetasByCodCentro()...');
    
    // Obtener metas desde la API
    const metas = await metaService.getMetasByCodCentro(selectedYear);
    
    console.log('✅ Respuesta recibida:', metas);
    console.log('📊 Número de metas:', metas ? metas.length : 'metas es null/undefined');

    // Ocultar indicador de carga
    loadingSpinner.style.display = 'none';

    if (metas && metas.length > 0) {
      console.log('📝 Generando filas de tabla...');
      // Mostrar tabla con datos
      tableBody.innerHTML = metas.map(createMetaRow).join('');
      tableContainer.style.display = 'block';
      console.log('✅ Tabla mostrada con', metas.length, 'metas');
      
      // Actualizar filtro de años y estadísticas solo si no hay año seleccionado
      if (!selectedYear) {
        populateYearFilter(metas);
      }
      updateStats(metas);
      updateCentroInfo();
      
      // Reconfigurar event listeners después de regenerar la tabla
      setupTableEventListeners();
    } else {
      console.log('⚠️ No hay metas para mostrar');
      // Mostrar mensaje de sin datos
      noDataMessage.style.display = 'block';
      updateStats([]);
      updateCentroInfo();
    }

  } catch (error) {
    console.error('❌ Error al cargar metas:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Ocultar indicador de carga y mostrar error
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    document.getElementById('error-text').textContent = error.message || 'Error al cargar las metas del centro';
    
    // Ocultar estadísticas en caso de error
    updateStats([]);
  }
}

// --- FUNCIONES DE FILTRADO ---

function handleYearFilterChange() {
  const yearFilter = document.getElementById('year-filter');
  if (!yearFilter) return;

  const selectedYear = yearFilter.value ? parseInt(yearFilter.value) : null;
  console.log('🔍 Filtro de año cambiado:', selectedYear || 'Todos los años');
  
  // Recargar metas con el año seleccionado
  loadMetas(selectedYear);
}

function handleRefreshClick() {
  console.log('🔄 Botón de actualizar presionado');
  
  // Resetear filtro de año
  const yearFilter = document.getElementById('year-filter');
  if (yearFilter) {
    yearFilter.value = '';
  }
  
  // Recargar todas las metas
  loadMetas();
}

// --- FUNCIONES DE MODAL Y FORMULARIO ---

// Variables para almacenar datos de las metas que se están procesando
let currentEditingMeta = null;
let currentDeletingMeta = null;

function resetCreateForm() {
  const form = document.getElementById('create-meta-form');
  form.reset();
  
  // Limpiar mensaje de error
  const errorMessage = document.getElementById('modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de envío
  const submitBtn = document.getElementById('btn-submit-meta');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  
  submitBtn.disabled = false;
  submitText.textContent = 'Crear Meta';
  submitLoading.style.display = 'none';

  // Actualizar información del centro en el modal
  updateModalCentroInfo();
}

function updateModalCentroInfo() {
  const userString = localStorage.getItem('user');
  if (!userString) return;

  try {
    const user = JSON.parse(userString);
    const modalCentroNombreEl = document.getElementById('modal-centro-nombre');
    const modalCentroCodigoEl = document.getElementById('modal-centro-codigo');

    if (modalCentroNombreEl && user.nombre_centro) {
      modalCentroNombreEl.textContent = user.nombre_centro;
    }
    if (modalCentroCodigoEl && user.cod_centro) {
      modalCentroCodigoEl.textContent = user.cod_centro;
    }
  } catch (error) {
    console.error('❌ Error al mostrar información del centro en modal:', error);
  }
}

function showModalError(message) {
  const errorMessage = document.getElementById('modal-error-message');
  const errorText = document.getElementById('modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-meta');
  const submitText = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.textContent = 'Creando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = 'Crear Meta';
    submitLoading.style.display = 'none';
  }
}

async function handleCreateSubmit(event) {
  event.preventDefault();
  
  console.log('📝 Procesando formulario de creación de meta...');
  
  // Limpiar errores previos
  const errorMessage = document.getElementById('modal-error-message');
  errorMessage.style.display = 'none';
  
  // Mostrar loading
  setSubmitLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const metaData = {
      anio: parseInt(formData.get('anio')),
      concepto: formData.get('concepto').trim(),
      valor: parseInt(formData.get('valor'))
    };
    
    console.log('📊 Datos de la meta a crear:', metaData);
    
    // Validaciones básicas
    if (!metaData.anio || metaData.anio < 2000 || metaData.anio > 2100) {
      throw new Error('El año debe estar entre 2000 y 2100');
    }
    
    if (!metaData.concepto || metaData.concepto.length < 2) {
      throw new Error('El concepto debe tener al menos 2 caracteres');
    }
    
    if (!metaData.valor || metaData.valor < 1) {
      throw new Error('El valor de la meta debe ser mayor a 0');
    }
    
    // Crear la meta
    const response = await metaService.createMeta(metaData);
    
    console.log('✅ Meta creada exitosamente:', response);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('create-meta-modal'));
    modal.hide();
    
    // Mostrar mensaje de éxito (opcional - podrías agregar un toast)
    console.log('🎉 ¡Meta creada exitosamente!');
    
    // Recargar la tabla de metas
    await loadMetas();
    
  } catch (error) {
    console.error('❌ Error al crear meta:', error);
    showModalError(error.message || 'Error al crear la meta');
  } finally {
    setSubmitLoading(false);
  }
}

// --- FUNCIONES PARA EDICIÓN ---

function handleEditButtonClick(event) {
  const editButton = event.target.closest('.btn-edit-meta');
  if (!editButton) return;

  console.log('📝 Clic en botón editar meta');
  
  // Obtener datos de la meta desde los data attributes
  const metaData = {
    id_meta: parseInt(editButton.dataset.idMeta),
    anio: parseInt(editButton.dataset.anio),
    concepto: editButton.dataset.concepto,
    valor: parseInt(editButton.dataset.valor)
  };

  console.log('📊 Datos de la meta a editar:', metaData);
  
  // Guardar referencia global para usar en el submit
  currentEditingMeta = metaData;
  
  // Poblar el formulario de edición
  populateEditForm(metaData);
}

function populateEditForm(metaData) {
  console.log('📝 Poblando formulario de edición:', metaData);
  
  // Poblar los campos
  document.getElementById('edit_id_meta').value = metaData.id_meta;
  document.getElementById('edit_anio_meta').value = metaData.anio;
  document.getElementById('edit_concepto_meta').value = metaData.concepto;
  document.getElementById('edit_valor_meta').value = metaData.valor;
  
  // Limpiar mensajes de error
  const errorMessage = document.getElementById('edit-modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de envío
  resetEditSubmitButton();
  
  // Actualizar información del centro
  updateEditModalCentroInfo();
}

function updateEditModalCentroInfo() {
  const userString = localStorage.getItem('user');
  if (!userString) return;

  try {
    const user = JSON.parse(userString);
    const editModalCentroNombreEl = document.getElementById('edit-modal-centro-nombre');
    const editModalCentroCodigoEl = document.getElementById('edit-modal-centro-codigo');

    if (editModalCentroNombreEl && user.nombre_centro) {
      editModalCentroNombreEl.textContent = user.nombre_centro;
    }
    if (editModalCentroCodigoEl && user.cod_centro) {
      editModalCentroCodigoEl.textContent = user.cod_centro;
    }
  } catch (error) {
    console.error('❌ Error al mostrar información del centro en modal de edición:', error);
  }
}

function resetEditSubmitButton() {
  const submitBtn = document.getElementById('btn-submit-edit-meta');
  const submitText = document.getElementById('edit-submit-text');
  const submitLoading = document.getElementById('edit-submit-loading');
  
  submitBtn.disabled = false;
  submitText.textContent = 'Actualizar Meta';
  submitLoading.style.display = 'none';
}

function showEditModalError(message) {
  const errorMessage = document.getElementById('edit-modal-error-message');
  const errorText = document.getElementById('edit-modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setEditSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-edit-meta');
  const submitText = document.getElementById('edit-submit-text');
  const submitLoading = document.getElementById('edit-submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.textContent = 'Actualizando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.textContent = 'Actualizar Meta';
    submitLoading.style.display = 'none';
  }
}

async function handleEditSubmit(event) {
  event.preventDefault();
  
  console.log('📝 Procesando formulario de edición de meta...');
  
  if (!currentEditingMeta) {
    console.error('❌ No hay meta seleccionada para editar');
    showEditModalError('Error: No se encontró la meta a editar');
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
      anio: parseInt(formData.get('anio')),
      concepto: formData.get('concepto').trim(),
      valor: parseInt(formData.get('valor'))
    };
    
    console.log('📊 Datos para actualizar:', updateData);
    console.log('🎯 Meta a actualizar (ID):', currentEditingMeta.id_meta);
    
    // Validaciones básicas
    if (!updateData.anio || updateData.anio < 2000 || updateData.anio > 2100) {
      throw new Error('El año debe estar entre 2000 y 2100');
    }
    
    if (!updateData.concepto || updateData.concepto.length < 2) {
      throw new Error('El concepto debe tener al menos 2 caracteres');
    }
    
    if (!updateData.valor || updateData.valor < 1) {
      throw new Error('El valor de la meta debe ser mayor a 0');
    }
    
    // Actualizar la meta
    const response = await metaService.updateMeta(currentEditingMeta.id_meta, updateData);
    
    console.log('✅ Meta actualizada exitosamente:', response);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('edit-meta-modal'));
    modal.hide();
    
    // Limpiar referencia
    currentEditingMeta = null;
    
    // Mostrar mensaje de éxito
    console.log('🎉 ¡Meta actualizada exitosamente!');
    
    // Recargar la tabla de metas
    await loadMetas();
    
  } catch (error) {
    console.error('❌ Error al actualizar meta:', error);
    showEditModalError(error.message || 'Error al actualizar la meta');
  } finally {
    setEditSubmitLoading(false);
  }
}

// --- FUNCIONES PARA ELIMINACIÓN ---

function handleDeleteButtonClick(event) {
  const deleteButton = event.target.closest('.btn-delete-meta');
  if (!deleteButton) return;

  console.log('🗑️ Clic en botón eliminar meta');
  
  // Obtener datos de la meta desde los data attributes
  const metaData = {
    id_meta: parseInt(deleteButton.dataset.idMeta),
    concepto: deleteButton.dataset.concepto,
    anio: parseInt(deleteButton.dataset.anio)
  };

  console.log('📊 Datos de la meta a eliminar:', metaData);
  
  // Guardar referencia global para usar en la confirmación
  currentDeletingMeta = metaData;
  
  // Mostrar modal de confirmación
  showDeleteConfirmation(metaData);
}

function showDeleteConfirmation(metaData) {
  console.log('⚠️ Mostrando confirmación de eliminación:', metaData);
  
  // Poblar datos en el modal de confirmación
  document.getElementById('delete-meta-concepto').textContent = metaData.concepto;
  document.getElementById('delete-meta-anio').textContent = metaData.anio;
  document.getElementById('delete-meta-id').textContent = metaData.id_meta;
  
  // Limpiar mensajes de error
  const errorMessage = document.getElementById('delete-modal-error-message');
  errorMessage.style.display = 'none';
  
  // Restaurar botón de confirmación
  resetDeleteSubmitButton();
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('delete-meta-modal'));
  modal.show();
}

function resetDeleteSubmitButton() {
  const submitBtn = document.getElementById('btn-confirm-delete-meta');
  const submitText = document.getElementById('delete-submit-text');
  const submitLoading = document.getElementById('delete-submit-loading');
  
  submitBtn.disabled = false;
  submitText.innerHTML = '<i class="fas fa-trash me-1"></i>Sí, Eliminar';
  submitLoading.style.display = 'none';
}

function showDeleteModalError(message) {
  const errorMessage = document.getElementById('delete-modal-error-message');
  const errorText = document.getElementById('delete-modal-error-text');
  
  errorText.textContent = message;
  errorMessage.style.display = 'block';
}

function setDeleteSubmitLoading(isLoading) {
  const submitBtn = document.getElementById('btn-confirm-delete-meta');
  const submitText = document.getElementById('delete-submit-text');
  const submitLoading = document.getElementById('delete-submit-loading');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitText.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Eliminando...';
    submitLoading.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    submitText.innerHTML = '<i class="fas fa-trash me-1"></i>Sí, Eliminar';
    submitLoading.style.display = 'none';
  }
}

async function handleConfirmDelete() {
  console.log('🗑️ Confirmando eliminación de meta...');
  
  if (!currentDeletingMeta) {
    console.error('❌ No hay meta seleccionada para eliminar');
    showDeleteModalError('Error: No se encontró la meta a eliminar');
    return;
  }
  
  // Limpiar errores previos
  const errorMessage = document.getElementById('delete-modal-error-message');
  errorMessage.style.display = 'none';
  
  // Mostrar loading
  setDeleteSubmitLoading(true);
  
  try {
    console.log('🎯 Meta a eliminar (ID):', currentDeletingMeta.id_meta);
    
    // Eliminar la meta
    const response = await metaService.deleteMeta(currentDeletingMeta.id_meta);
    
    console.log('✅ Meta eliminada exitosamente:', response);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('delete-meta-modal'));
    modal.hide();
    
    // Limpiar referencia
    currentDeletingMeta = null;
    
    // Mostrar mensaje de éxito
    console.log('🎉 ¡Meta eliminada exitosamente!');
    
    // Recargar la tabla de metas
    await loadMetas();
    
  } catch (error) {
    console.error('❌ Error al eliminar meta:', error);
    showDeleteModalError(error.message || 'Error al eliminar la meta');
  } finally {
    setDeleteSubmitLoading(false);
  }
}

// --- CONFIGURACIÓN DE EVENT LISTENERS ---

function setupEventListeners() {
  console.log('🔗 Configurando event listeners...');

  // Listener para el filtro de año
  const yearFilter = document.getElementById('year-filter');
  if (yearFilter) {
    yearFilter.removeEventListener('change', handleYearFilterChange);
    yearFilter.addEventListener('change', handleYearFilterChange);
    console.log('✅ Event listener del filtro de año configurado');
  }

  // Listener para el botón de actualizar
  const refreshBtn = document.getElementById('btn-refresh-metas');
  if (refreshBtn) {
    refreshBtn.removeEventListener('click', handleRefreshClick);
    refreshBtn.addEventListener('click', handleRefreshClick);
    console.log('✅ Event listener del botón actualizar configurado');
  }

  // Listener para el formulario de creación
  const createForm = document.getElementById('create-meta-form');
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateSubmit);
    createForm.addEventListener('submit', handleCreateSubmit);
    console.log('✅ Event listener del formulario de creación configurado');
  }
  
  // Listener para limpiar el formulario al abrir el modal de creación
  const createModal = document.getElementById('create-meta-modal');
  if (createModal) {
    createModal.addEventListener('show.bs.modal', resetCreateForm);
    console.log('✅ Event listener del modal de creación configurado');
  }

  // Listener para el formulario de edición
  const editForm = document.getElementById('edit-meta-form');
  if (editForm) {
    editForm.removeEventListener('submit', handleEditSubmit);
    editForm.addEventListener('submit', handleEditSubmit);
    console.log('✅ Event listener del formulario de edición configurado');
  }

  // Listener para el botón de confirmación de eliminación
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete-meta');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.removeEventListener('click', handleConfirmDelete);
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    console.log('✅ Event listener del botón de confirmación de eliminación configurado');
  }
  
  console.log('🔗 Event listeners configurados correctamente');
}

function setupTableEventListeners() {
  // Listener para los botones de editar y eliminar en la tabla
  const tableBody = document.getElementById('metas-table-body');
  if (tableBody) {
    // Remover listeners existentes
    tableBody.removeEventListener('click', handleEditButtonClick);
    tableBody.removeEventListener('click', handleDeleteButtonClick);
    
    // Agregar listeners para editar y eliminar
    tableBody.addEventListener('click', handleEditButtonClick);
    tableBody.addEventListener('click', handleDeleteButtonClick);
    
    console.log('✅ Event listeners de botones editar y eliminar configurados');
  }
  
  console.log('🔗 Event listeners de tabla configurados');
}

// --- INICIALIZACIÓN ---

function init() {
  console.log('🚀 Inicializando módulo de metas...');
  loadMetas();
  setupEventListeners();
}

export { init }; 