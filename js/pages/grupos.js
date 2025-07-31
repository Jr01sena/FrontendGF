import { gruposService } from '../api/grupos.service.js';

// --- VARIABLES GLOBALES ---
let currentCodFicha = null;
let currentEditingAsignacion = null;
let ambientesDisponibles = [];
let instructoresDisponibles = [];

// --- FUNCIONES DE VISTA (Generación de HTML) ---

function createDatosGrupoView(datosGrupo, grupoConfig, programaInfo) {
  // El estado viene en la tabla grupo con el campo "estado_grupo"
  const estado = grupoConfig?.estado_grupo || grupoConfig?.estado || grupoConfig?.estado_ficha || grupoConfig?.state || grupoConfig?.status || 
                datosGrupo?.estado_grupo || datosGrupo?.estado_ficha || datosGrupo?.estado || datosGrupo?.state || datosGrupo?.status || '-';
  
  // Determinar si el estado es activo (múltiples variaciones)
  const estadosActivos = ['ACTIVA', 'ACTIVO', 'En ejecucion', 'EN EJECUCION', 'EJECUCION', 'ACTIVE', 'RUNNING'];
  const esActivo = estadosActivos.some(est => estado?.toString().toUpperCase().includes(est.toUpperCase()));
  
  return `
    <div class="row">
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Código de Ficha</h6>
          <p class="mb-0 font-weight-bold">${datosGrupo.cod_ficha || datosGrupo.codigo_ficha || currentCodFicha || '-'}</p>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Programa de Formación</h6>
          <p class="mb-0">${programaInfo?.nombre || (grupoConfig?.cod_programa ? `Código: ${grupoConfig.cod_programa}` : '-')}</p>
          ${programaInfo?.nombre ? `<small class="text-success">Versión: ${programaInfo.la_version}</small>` : '<small class="text-muted">Nombre del programa no disponible</small>'}
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Estado de la Ficha</h6>
          <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'}">
            ${estado}
          </span>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Jornada</h6>
          <p class="mb-0 font-weight-bold">${grupoConfig?.jornada || datosGrupo?.jornada || grupoConfig?.turno || datosGrupo?.turno || '-'}</p>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Modalidad</h6>
          <p class="mb-0">${grupoConfig?.modalidad || datosGrupo?.modalidad || grupoConfig?.tipo_modalidad || datosGrupo?.tipo_modalidad || '-'}</p>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Municipio</h6>
          <p class="mb-0">${grupoConfig?.nombre_municipio || '-'}</p>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Oficina</h6>
          <p class="mb-0">-</p>
          <small class="text-muted">No disponible en API</small>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3 bg-light">
          <h6 class="text-dark mb-2">Coordinador/Instructor</h6>
          <p class="mb-0">${grupoConfig?.instructor || grupoConfig?.responsable || datosGrupo?.coordinador || datosGrupo?.instructor || datosGrupo?.responsable || '-'}</p>
        </div>
      </div>
    </div>
  `;
}

function createGrupoConfigView(grupo) {
  const ambienteNombre = ambientesDisponibles.find(amb => amb.id_ambiente === grupo.id_ambiente)?.nombre_ambiente || 'No asignado';
  
  // Manejar horas que pueden venir como "00:00:00" o null
  const horaInicio = grupo.hora_inicio && grupo.hora_inicio !== '00:00:00' ? grupo.hora_inicio.substring(0, 5) : 'No configurado';
  const horaFin = grupo.hora_fin && grupo.hora_fin !== '00:00:00' ? grupo.hora_fin.substring(0, 5) : 'No configurado';
  
  return `
    <div class="row">
      <div class="col-md-4 mb-3">
        <div class="border rounded p-3">
          <h6 class="text-dark mb-2">Hora de Inicio</h6>
          <p class="mb-0 font-weight-bold ${horaInicio !== 'No configurado' ? 'text-success' : 'text-muted'}">${horaInicio}</p>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="border rounded p-3">
          <h6 class="text-dark mb-2">Hora de Fin</h6>
          <p class="mb-0 font-weight-bold ${horaFin !== 'No configurado' ? 'text-warning' : 'text-muted'}">${horaFin}</p>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="border rounded p-3">
          <h6 class="text-dark mb-2">Ambiente Asignado</h6>
          <p class="mb-0 font-weight-bold text-info">${ambienteNombre}</p>
          <small class="text-muted">ID: ${grupo.id_ambiente || 'No asignado'}</small>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3">
          <h6 class="text-dark mb-2">Fecha de Inicio</h6>
          <p class="mb-0">${grupo.fecha_inicio ? new Date(grupo.fecha_inicio).toLocaleDateString('es-CO') : '-'}</p>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="border rounded p-3">
          <h6 class="text-dark mb-2">Fecha de Fin</h6>
          <p class="mb-0">${grupo.fecha_fin ? new Date(grupo.fecha_fin).toLocaleDateString('es-CO') : '-'}</p>
        </div>
      </div>
    </div>
  `;
}

function createInstructorRow(asignacion) {
  // Buscar instructor usando el campo real del backend: id_usuario
  const instructor = instructoresDisponibles.find(inst => inst.id_usuario == asignacion.id_instructor);
  
  // Usar el campo real del backend: nombre_completo
  const nombreInstructor = instructor ? 
    (instructor.nombre_completo || `Usuario ID: ${instructor.id_usuario}`) : 
    'Instructor no encontrado';
  
  return `
    <tr>
      <td class="align-middle">
        <div class="d-flex px-2 py-1 align-items-center">
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${nombreInstructor}</h6>
            <p class="text-xs text-secondary mb-0">ID: ${asignacion.id_instructor}</p>
          </div>
        </div>
      </td>
      <td class="align-middle">
        <span class="text-secondary text-xs font-weight-bold">${asignacion.fecha_asignacion ? new Date(asignacion.fecha_asignacion).toLocaleDateString('es-CO') : '-'}</span>
      </td>
      <td class="align-middle text-center">
        <span class="badge bg-gradient-success">Asignado</span>
      </td>
      <td class="align-middle text-center">
        <button type="button" class="btn btn-sm btn-warning btn-edit-asignacion me-2" 
                data-asignacion-id="${asignacion.id}"
                data-instructor-id="${asignacion.id_instructor}"
                data-fecha-asignacion="${asignacion.fecha_asignacion}"
                data-bs-toggle="modal" 
                data-bs-target="#edit-asignacion-modal">
          <i class="material-symbols-rounded">edit</i>
        </button>
        <button type="button" class="btn btn-sm btn-danger btn-delete-asignacion" 
                data-asignacion-id="${asignacion.id}"
                data-instructor-id="${asignacion.id_instructor}"
                data-instructor-nombre="${nombreInstructor}">
          <i class="material-symbols-rounded">delete</i>
        </button>
      </td>
    </tr>
  `;
}

// --- FUNCIONES DE CARGA DE DATOS ---

async function loadFichaData(codFicha) {
  const loadingElement = document.getElementById('ficha-loading');
  const errorElement = document.getElementById('ficha-error');
  const contentElement = document.getElementById('grupos-content');

  try {
    // Mostrar loading
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    contentElement.style.display = 'none';
    
    currentCodFicha = codFicha;
    
    // Cargar datos secuencialmente para mejor debugging
    const datosGrupo = await gruposService.getDatosGrupoByCodFicha(codFicha);
    const grupos = await gruposService.getGruposByCodFicha(codFicha);
    const instructoresAsignados = await gruposService.getInstructoresByFicha(codFicha);
    
    // Cargar opciones para dropdowns
    await loadDropdownOptions();
    
    // Guardar config del grupo para uso global
    currentGrupoConfig = grupos?.[0] || {};
    
    // Obtener información del programa de formación si está disponible
    let programaInfo = null;
    if (currentGrupoConfig.cod_programa && currentGrupoConfig.la_version) {
      try {
        programaInfo = await gruposService.getProgramaFormacion(currentGrupoConfig.cod_programa, currentGrupoConfig.la_version);
      } catch (error) {
        // No se pudo obtener información del programa
      }
    }
    
    // Mostrar datos (solo datos de la API, sin respaldos)
    displayDatosGrupo(datosGrupo || {}, programaInfo);
    displayGrupoConfig(grupos?.[0] || {});
    displayInstructoresAsignados(instructoresAsignados || []);
    
    // Ocultar loading y mostrar contenido
    loadingElement.style.display = 'none';
    contentElement.style.display = 'block';
    
  } catch (error) {
    // Ocultar loading y mostrar error
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
    document.getElementById('ficha-error-text').textContent = error.message || 'Error al cargar los datos de la ficha';
  }
}

async function loadDropdownOptions() {
  try {
    // Cargar ambientes y instructores disponibles
    const [ambientes, instructores] = await Promise.all([
      gruposService.getAmbientesDisponibles(),
      gruposService.getInstructoresDisponibles()
    ]);
    
    ambientesDisponibles = ambientes || [];
    instructoresDisponibles = instructores || [];
    

    
    // Poblar dropdowns
    populateAmbientesDropdown();
    populateInstructoresDropdowns();
    
  } catch (error) {
  }
}

function populateAmbientesDropdown() {
  const dropdown = document.getElementById('id_ambiente');
  if (!dropdown) return;
  
  // Limpiar opciones existentes (excepto la primera)
  dropdown.innerHTML = '<option value="">Seleccione un ambiente...</option>';
  
  // Agregar ambientes
  ambientesDisponibles.forEach(ambiente => {
    const option = document.createElement('option');
    option.value = ambiente.id_ambiente;
    option.textContent = `${ambiente.nombre_ambiente} (Cap: ${ambiente.num_max_aprendices})`;
    dropdown.appendChild(option);
  });
}

function populateInstructoresDropdowns() {
  const dropdowns = [
    document.getElementById('id_instructor'),
    document.getElementById('edit_id_instructor')
  ];
  
  dropdowns.forEach(dropdown => {
    if (!dropdown) return;
    
    // Limpiar opciones existentes (excepto la primera)
    dropdown.innerHTML = '<option value="">Seleccione un instructor...</option>';
    
    // Agregar instructores
    instructoresDisponibles.forEach(instructor => {
      // Validar que el instructor tenga un ID válido (campo real del backend)
      if (!instructor.id_usuario) {
        return;
      }
      
      const option = document.createElement('option');
      option.value = instructor.id_usuario;
      
      // Usar el campo real del backend: nombre_completo
      const nombreCompleto = instructor.nombre_completo || `Usuario ID: ${instructor.id_usuario}`;
      
      option.textContent = nombreCompleto;
      dropdown.appendChild(option);
    });
  });
}

// --- VARIABLES GLOBALES PARA COMPARTIR DATOS ---
let currentGrupoConfig = null;

// --- FUNCIONES DE DISPLAY ---

function displayDatosGrupo(datosGrupo, programaInfo) {
  const container = document.getElementById('datos-grupo-content');
  
  if (container) {
    container.innerHTML = createDatosGrupoView(datosGrupo || {}, currentGrupoConfig || {}, programaInfo || null);
  }
}

function displayGrupoConfig(grupo) {
  const container = document.getElementById('grupo-config-content');
  
  if (container) {
    container.innerHTML = createGrupoConfigView(grupo || {});
  }
}

function displayInstructoresAsignados(instructores) {
  const loadingElement = document.getElementById('instructores-loading');
  const errorElement = document.getElementById('instructores-error');
  const tableContainer = document.getElementById('instructores-table-container');
  const noDataElement = document.getElementById('instructores-no-data');
  const tableBody = document.getElementById('instructores-table-body');
  
  // Ocultar loading
  loadingElement.style.display = 'none';
  errorElement.style.display = 'none';
  
  if (instructores && instructores.length > 0) {
    // Mostrar tabla con datos
    tableBody.innerHTML = instructores.map(createInstructorRow).join('');
    tableContainer.style.display = 'block';
    noDataElement.style.display = 'none';
    
    // Reconfigurar event listeners después de regenerar la tabla
    setupTableEventListeners();
  } else {
    // Mostrar mensaje de sin datos
    tableContainer.style.display = 'none';
    noDataElement.style.display = 'block';
  }
}

// --- FUNCIONES DE MODAL Y FORMULARIO ---

function resetFichaForm() {
  document.getElementById('selector-ficha').value = '';
  document.getElementById('grupos-content').style.display = 'none';
  document.getElementById('ficha-error').style.display = 'none';
  currentCodFicha = null;
}

function resetEditGrupoForm() {
  const form = document.getElementById('edit-grupo-form');
  if (form) {
    form.reset();
  }
  
  const errorElement = document.getElementById('edit-grupo-error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  resetEditGrupoSubmitButton();
}

function resetAsignarInstructorForm() {
  const form = document.getElementById('asignar-instructor-form');
  if (form) {
    form.reset();
    // Establecer fecha por defecto
    document.getElementById('fecha_asignacion').value = new Date().toISOString().split('T')[0];
  }
  
  const errorElement = document.getElementById('asignar-instructor-error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  resetAsignarInstructorSubmitButton();
}

function resetEditAsignacionForm() {
  const form = document.getElementById('edit-asignacion-form');
  if (form) {
    form.reset();
  }
  
  const errorElement = document.getElementById('edit-asignacion-error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  resetEditAsignacionSubmitButton();
}

// --- FUNCIONES DE BOTONES Y LOADING ---

function resetEditGrupoSubmitButton() {
  const submitBtn = document.getElementById('btn-submit-edit-grupo');
  const submitText = document.getElementById('edit-grupo-submit-text');
  const submitLoading = document.getElementById('edit-grupo-submit-loading');
  
  if (submitBtn) submitBtn.disabled = false;
  if (submitText) submitText.textContent = 'Actualizar Configuración';
  if (submitLoading) submitLoading.style.display = 'none';
}

function setEditGrupoLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-edit-grupo');
  const submitText = document.getElementById('edit-grupo-submit-text');
  const submitLoading = document.getElementById('edit-grupo-submit-loading');
  
  if (isLoading) {
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Actualizando...';
    if (submitLoading) submitLoading.style.display = 'inline-block';
  } else {
    resetEditGrupoSubmitButton();
  }
}

function resetAsignarInstructorSubmitButton() {
  const submitBtn = document.getElementById('btn-submit-asignar-instructor');
  const submitText = document.getElementById('asignar-instructor-submit-text');
  const submitLoading = document.getElementById('asignar-instructor-submit-loading');
  
  if (submitBtn) submitBtn.disabled = false;
  if (submitText) submitText.textContent = 'Asignar Instructor';
  if (submitLoading) submitLoading.style.display = 'none';
}

function setAsignarInstructorLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-asignar-instructor');
  const submitText = document.getElementById('asignar-instructor-submit-text');
  const submitLoading = document.getElementById('asignar-instructor-submit-loading');
  
  if (isLoading) {
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Asignando...';
    if (submitLoading) submitLoading.style.display = 'inline-block';
  } else {
    resetAsignarInstructorSubmitButton();
  }
}

function resetEditAsignacionSubmitButton() {
  const submitBtn = document.getElementById('btn-submit-edit-asignacion');
  const submitText = document.getElementById('edit-asignacion-submit-text');
  const submitLoading = document.getElementById('edit-asignacion-submit-loading');
  
  if (submitBtn) submitBtn.disabled = false;
  if (submitText) submitText.textContent = 'Actualizar Asignación';
  if (submitLoading) submitLoading.style.display = 'none';
}

function setEditAsignacionLoading(isLoading) {
  const submitBtn = document.getElementById('btn-submit-edit-asignacion');
  const submitText = document.getElementById('edit-asignacion-submit-text');
  const submitLoading = document.getElementById('edit-asignacion-submit-loading');
  
  if (isLoading) {
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Actualizando...';
    if (submitLoading) submitLoading.style.display = 'inline-block';
  } else {
    resetEditAsignacionSubmitButton();
  }
}

// --- FUNCIONES DE MANEJO DE ERRORES ---

function showEditGrupoError(message) {
  const errorElement = document.getElementById('edit-grupo-error');
  const errorText = document.getElementById('edit-grupo-error-text');
  
  if (errorText) errorText.textContent = message;
  if (errorElement) errorElement.style.display = 'block';
}

function showAsignarInstructorError(message) {
  const errorElement = document.getElementById('asignar-instructor-error');
  const errorText = document.getElementById('asignar-instructor-error-text');
  
  if (errorText) errorText.textContent = message;
  if (errorElement) errorElement.style.display = 'block';
}

function showEditAsignacionError(message) {
  const errorElement = document.getElementById('edit-asignacion-error');
  const errorText = document.getElementById('edit-asignacion-error-text');
  
  if (errorText) errorText.textContent = message;
  if (errorElement) errorElement.style.display = 'block';
}

// --- MANEJADORES DE EVENTOS ---

async function handleCargarFicha() {
  const codFicha = document.getElementById('selector-ficha').value.trim();
  
  if (!codFicha) {
    alert('Por favor ingrese un código de ficha');
    return;
  }
  
  await loadFichaData(codFicha);
}

async function handleEditGrupo() {
  if (!currentCodFicha) {
    alert('No hay ficha seleccionada');
    return;
  }

  try {
    await loadDropdownOptions();
    const grupos = await gruposService.getGruposByCodFicha(currentCodFicha);
    const grupo = grupos[0];

    // Resetear el formulario antes de poblar los campos
    resetEditGrupoForm();

    if (grupo) {
      console.log('Datos del grupo:', grupo);

      document.getElementById('modal-cod-ficha').textContent = currentCodFicha;

      // Asignar horas con formato correcto, vacío si es "00:00:00" o "00:00"
      const horaInicio = (grupo.hora_inicio === '00:00:00' || grupo.hora_inicio === '00:00') ? '' : (grupo.hora_inicio ? grupo.hora_inicio.substring(0,5) : '');
      const horaFin = (grupo.hora_fin === '00:00:00' || grupo.hora_fin === '00:00') ? '' : (grupo.hora_fin ? grupo.hora_fin.substring(0,5) : '');

      document.getElementById('hora_inicio').value = horaInicio;
      document.getElementById('hora_fin').value = horaFin;

      // Asignar ambiente como string
      const ambienteSelect = document.getElementById('id_ambiente');
      console.log('Opciones de ambiente:', Array.from(ambienteSelect.options).map(o => o.value));
      ambienteSelect.value = grupo.id_ambiente ? String(grupo.id_ambiente) : '';
      console.log('Valor asignado a ambiente:', ambienteSelect.value);
    }

    const modal = new bootstrap.Modal(document.getElementById('edit-grupo-modal'));
    modal.show();

  } catch (error) {
    alert('Error al cargar los datos del grupo');
  }
}

async function handleEditGrupoSubmit(event) {
  event.preventDefault();
  
  if (!currentCodFicha) {
    showEditGrupoError('No hay ficha seleccionada');
    return;
  }
  
  // Limpiar errores previos
  const errorElement = document.getElementById('edit-grupo-error');
  if (errorElement) errorElement.style.display = 'none';
  
  // Mostrar loading
  setEditGrupoLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const updateData = {
      hora_inicio: formData.get('hora_inicio'),
      hora_fin: formData.get('hora_fin'),
      id_ambiente: parseInt(formData.get('id_ambiente'))
    };
    
    // Validaciones básicas
    if (!updateData.hora_inicio || !updateData.hora_fin) {
      throw new Error('Las horas de inicio y fin son obligatorias');
    }
    
    if (updateData.hora_inicio >= updateData.hora_fin) {
      throw new Error('La hora de inicio debe ser menor que la hora de fin');
    }
    
    if (!updateData.id_ambiente) {
      throw new Error('Debe seleccionar un ambiente');
    }
    
    // Actualizar el grupo
    const response = await gruposService.updateGrupo(currentCodFicha, updateData);
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('edit-grupo-modal'));
    modal.hide();
    
    // Recargar datos de la ficha
    await loadFichaData(currentCodFicha);
    
  } catch (error) {
    showEditGrupoError(error.message || 'Error al actualizar la configuración del grupo');
  } finally {
    setEditGrupoLoading(false);
  }
}

async function handleAsignarInstructor() {
  if (!currentCodFicha) {
    alert('No hay ficha seleccionada');
    return;
  }
  
  // Poblar información del modal
  document.getElementById('modal-asignar-cod-ficha').textContent = currentCodFicha;
  
  // Establecer fecha por defecto
  document.getElementById('fecha_asignacion').value = new Date().toISOString().split('T')[0];
}

async function handleAsignarInstructorSubmit(event) {
  event.preventDefault();
  
  if (!currentCodFicha) {
    showAsignarInstructorError('No hay ficha seleccionada');
    return;
  }
  
  // Limpiar errores previos
  const errorElement = document.getElementById('asignar-instructor-error');
  if (errorElement) errorElement.style.display = 'none';
  
  // Mostrar loading
  setAsignarInstructorLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const asignacionData = {
      cod_ficha: currentCodFicha,
      id_instructor: parseInt(formData.get('id_instructor')),
      fecha_asignacion: formData.get('fecha_asignacion')
    };
    
    // Validaciones básicas
    if (!asignacionData.id_instructor) {
      throw new Error('Debe seleccionar un instructor');
    }
    
    if (!asignacionData.fecha_asignacion) {
      throw new Error('La fecha de asignación es obligatoria');
    }
    
    // Crear la asignación
    const response = await gruposService.createAsignacionInstructor(asignacionData);
    
    // Cerrar modal y eliminar backdrop si persiste
    const modal = bootstrap.Modal.getInstance(document.getElementById('asignar-instructor-modal'));
    modal.hide();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Recargar datos de instructores
    const instructoresAsignados = await gruposService.getInstructoresByFicha(currentCodFicha);
    displayInstructoresAsignados(instructoresAsignados);
    
  } catch (error) {
    showAsignarInstructorError(error.message || 'Error al asignar el instructor');
  } finally {
    setAsignarInstructorLoading(false);
  }
}

function handleEditAsignacionClick(event) {
  const editButton = event.target.closest('.btn-edit-asignacion');
  if (!editButton) return;
  
  const asignacionData = {
    id: parseInt(editButton.dataset.asignacionId),
    id_instructor: parseInt(editButton.dataset.instructorId),
    fecha_asignacion: editButton.dataset.fechaAsignacion
  };
  
  currentEditingAsignacion = asignacionData;
  
  // Poblar formulario
  document.getElementById('modal-edit-cod-ficha').textContent = currentCodFicha;
  document.getElementById('edit_asignacion_id').value = asignacionData.id;
  document.getElementById('edit_id_instructor').value = asignacionData.id_instructor;
  document.getElementById('edit_fecha_asignacion').value = asignacionData.fecha_asignacion.split('T')[0];
}

async function handleEditAsignacionSubmit(event) {
  event.preventDefault();
  
  if (!currentEditingAsignacion) {
    showEditAsignacionError('No hay asignación seleccionada para editar');
    return;
  }
  
  // Limpiar errores previos
  const errorElement = document.getElementById('edit-asignacion-error');
  if (errorElement) errorElement.style.display = 'none';
  
  // Mostrar loading
  setEditAsignacionLoading(true);
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const updateData = {
      cod_ficha: currentCodFicha,
      id_instructor_actual: currentEditingAsignacion.id_instructor, // Instructor original
      id_instructor_nuevo: parseInt(formData.get('id_instructor')), // Nuevo instructor seleccionado
      fecha_asignacion: formData.get('fecha_asignacion')
    };
    
    // Validaciones básicas
    if (!updateData.id_instructor_nuevo) {
      throw new Error('Debe seleccionar un instructor');
    }
    
    if (!updateData.fecha_asignacion) {
      throw new Error('La fecha de asignación es obligatoria');
    }
    
    // Actualizar la asignación
    const response = await gruposService.updateAsignacionInstructor(updateData);
    
    // Cerrar modal y eliminar backdrop si persiste
    const modal = bootstrap.Modal.getInstance(document.getElementById('edit-asignacion-modal'));
    modal.hide();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Limpiar referencia
    currentEditingAsignacion = null;
    
    // Recargar datos de instructores
    const instructoresAsignados = await gruposService.getInstructoresByFicha(currentCodFicha);
    displayInstructoresAsignados(instructoresAsignados);
    
  } catch (error) {
    showEditAsignacionError(error.message || 'Error al actualizar la asignación');
  } finally {
    setEditAsignacionLoading(false);
  }
}

async function handleDeleteAsignacionClick(event) {
  const deleteButton = event.target.closest('.btn-delete-asignacion');
  if (!deleteButton) return;
  
  const asignacionId = parseInt(deleteButton.dataset.asignacionId);
  const instructorId = parseInt(deleteButton.dataset.instructorId);
  const instructorNombre = deleteButton.dataset.instructorNombre;
  
  if (!confirm(`¿Está seguro de eliminar la asignación del instructor ${instructorNombre}?`)) {
    return;
  }
  
  try {
    // Deshabilitar botón mientras se procesa
    deleteButton.disabled = true;
    deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    
    await gruposService.deleteAsignacionInstructor(currentCodFicha, instructorId);
    
    // Recargar datos de instructores
    const instructoresAsignados = await gruposService.getInstructoresByFicha(currentCodFicha);
    displayInstructoresAsignados(instructoresAsignados);
    
  } catch (error) {
    alert('Error al eliminar la asignación: ' + (error.message || 'Error desconocido'));
    
    // Restaurar botón
    deleteButton.disabled = false;
    deleteButton.innerHTML = '<i class="material-symbols-rounded">delete</i>';
  }
}

// --- CONFIGURACIÓN DE EVENT LISTENERS ---

function setupTableEventListeners() {
  // Listener para los botones de editar en la tabla
  const tableBody = document.getElementById('instructores-table-body');
  if (tableBody) {
    tableBody.removeEventListener('click', handleEditAsignacionClick);
    tableBody.addEventListener('click', handleEditAsignacionClick);
    
    tableBody.removeEventListener('click', handleDeleteAsignacionClick);
    tableBody.addEventListener('click', handleDeleteAsignacionClick);
  }
}

function setupEventListeners() {
  // Botón cargar ficha
  const btnCargarFicha = document.getElementById('btn-cargar-ficha');
  if (btnCargarFicha) {
    btnCargarFicha.removeEventListener('click', handleCargarFicha);
    btnCargarFicha.addEventListener('click', handleCargarFicha);
  }
  
  // Enter en el input de ficha
  const selectorFicha = document.getElementById('selector-ficha');
  if (selectorFicha) {
    selectorFicha.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        handleCargarFicha();
      }
    });
  }
  
  // Botón editar grupo
  const btnEditGrupo = document.getElementById('btn-edit-grupo');
  if (btnEditGrupo) {
    btnEditGrupo.removeEventListener('click', handleEditGrupo);
    btnEditGrupo.addEventListener('click', handleEditGrupo);
  }
  
  // Formulario editar grupo
  const editGrupoForm = document.getElementById('edit-grupo-form');
  if (editGrupoForm) {
    editGrupoForm.removeEventListener('submit', handleEditGrupoSubmit);
    editGrupoForm.addEventListener('submit', handleEditGrupoSubmit);
  }
  
  // Modal editar grupo
  const editGrupoModal = document.getElementById('edit-grupo-modal');
  
  // Botón asignar instructor
  const btnAsignarInstructor = document.getElementById('btn-asignar-instructor');
  if (btnAsignarInstructor) {
    btnAsignarInstructor.removeEventListener('click', handleAsignarInstructor);
    btnAsignarInstructor.addEventListener('click', handleAsignarInstructor);
  }
  
  // Formulario asignar instructor
  const asignarInstructorForm = document.getElementById('asignar-instructor-form');
  if (asignarInstructorForm) {
    asignarInstructorForm.removeEventListener('submit', handleAsignarInstructorSubmit);
    asignarInstructorForm.addEventListener('submit', handleAsignarInstructorSubmit);
  }
  
  // Modal asignar instructor
  const asignarInstructorModal = document.getElementById('asignar-instructor-modal');
  if (asignarInstructorModal) {
    asignarInstructorModal.addEventListener('show.bs.modal', resetAsignarInstructorForm);
  }
  
  // Formulario editar asignación
  const editAsignacionForm = document.getElementById('edit-asignacion-form');
  if (editAsignacionForm) {
    editAsignacionForm.removeEventListener('submit', handleEditAsignacionSubmit);
    editAsignacionForm.addEventListener('submit', handleEditAsignacionSubmit);
  }
  
  // Modal editar asignación
  const editAsignacionModal = document.getElementById('edit-asignacion-modal');
  if (editAsignacionModal) {
    editAsignacionModal.addEventListener('show.bs.modal', resetEditAsignacionForm);
  }
}

// --- FUNCIÓN PARA VERIFICAR DEPENDENCIAS ---

function checkDependencies() {
  // Solo verificar que las dependencias estén disponibles, sin manipular estilos
  const materialDashboardCSS = document.querySelector('link[href*="material-dashboard"]');
  if (!materialDashboardCSS) {
    // CSS de Material Dashboard no encontrado
  }
  
  if (typeof bootstrap === 'undefined') {
    // Bootstrap no está disponible
  }
}

// --- INICIALIZACIÓN ---

function init() {
  checkDependencies();
  setupEventListeners();
  resetFichaForm();
}

export { init }; 