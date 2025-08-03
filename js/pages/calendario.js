import { request } from "../api/apiClient.js";
import { programacionService } from '../api/programacion.service.js';
import { gruposService } from '../api/grupos.service.js';


// --- VARIABLES GLOBALES ---
let currentUser = null;
let currentRole = null;
let currentInstructorId = null;
let currentDate = new Date();
let currentProgramaciones = [];
let instructoresDisponibles = [];
let diasFestivos = []; // Se llena dinámicamente desde la API


// Elementos del DOM
let elements = {};

// --- FUNCIONES DE INICIALIZACIÓN ---

async function init() {
    try {
        console.log('🚀 Inicializando módulo de calendario');

        loadUserInfo();
        initializeElements();
        setupYearSelector();
        setupEventListeners();

        // Cargar festivos desde backend
        diasFestivos = await loadFestivos();
        console.log(`📆 ${diasFestivos.length} festivos cargados`);

        setupRoleInterface();
        console.log('✅ Módulo de calendario inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar calendario:', error);
    }
}



function loadUserInfo() {
    const userString = localStorage.getItem('user');
    if (userString) {
        currentUser = JSON.parse(userString);
        currentRole = currentUser.id_rol;
        currentInstructorId = currentUser.id_usuario;
        
        console.log('👤 Usuario actual:', {
            id: currentUser.id_usuario,
            rol: currentRole,
            nombre: currentUser.nombre_completo
        });
    }
}

function initializeElements() {
    elements = {
        // Controles principales
        instructorSelectorContainer: document.getElementById('instructor-selector-container'),
        instructorSelector: document.getElementById('instructor-selector'),
        calendarSubtitle: document.getElementById('calendar-subtitle'),
        
        // Navegación
        prevMonthBtn: document.getElementById('prev-month'),
        nextMonthBtn: document.getElementById('next-month'),
        monthSelector: document.getElementById('month-selector'),
        yearSelector: document.getElementById('year-selector'),
        
        // Contenido
        selectInstructorMessage: document.getElementById('select-instructor-message'),
        calendarLoading: document.getElementById('calendar-loading'),
        calendarError: document.getElementById('calendar-error'),
        calendarContainer: document.getElementById('calendar-container'),
        calendarMonthYear: document.getElementById('calendar-month-year'),
        calendarDays: document.getElementById('calendar-days'),
        
        // Botones
        addProgramacionBtn: document.getElementById('add-programacion-btn'),
        retryCalendarBtn: document.getElementById('retry-calendar'),
        
        // Modales
        programacionModal: document.getElementById('programacion-modal'),
        nuevaProgramacionModal: document.getElementById('nueva-programacion-modal')
    };
}

function setupYearSelector() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;
    const endYear = Math.max(currentYear + 3, 2030); // ← Asegura que llegue a 2030
    
    elements.yearSelector.innerHTML = '';
    
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        elements.yearSelector.appendChild(option);
    }
    
    // Establecer mes actual
    elements.monthSelector.value = currentDate.getMonth();
}

function setupEventListeners() {
    // Navegación del calendario
    elements.prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    elements.nextMonthBtn.addEventListener('click', () => navigateMonth(1));
    elements.monthSelector.addEventListener('change', updateCalendarFromSelectors);
    elements.yearSelector.addEventListener('change', updateCalendarFromSelectors);
    
    // Selector de instructor (coordinadores)
    elements.instructorSelector.addEventListener('change', handleInstructorChange);
    
    // Botones
    elements.addProgramacionBtn.addEventListener('click', openNuevaProgramacionModal);
    elements.retryCalendarBtn.addEventListener('click', loadCalendar);
    
    // Modales
    setupModalEventListeners();
}

function setupRoleInterface() {
    if (currentRole === 3) {
        // Instructor: Mostrar calendario directamente
        elements.calendarSubtitle.textContent = 'Tu programación académica';
        elements.addProgramacionBtn.classList.remove('d-none');
        loadCalendar();
    } else if (currentRole === 1 || currentRole === 2) {
        // Coordinador: Mostrar selector de instructor
        elements.calendarSubtitle.textContent = 'Gestiona la programación de instructores';
        elements.instructorSelectorContainer.classList.remove('d-none');
        elements.selectInstructorMessage.classList.remove('d-none');
        loadInstructores();
    } else {
        showCalendarError('No tienes permisos para acceder al calendario');
    }
}

// --- FUNCIONES DE NAVEGACIÓN ---

function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    updateSelectorsFromDate();
    loadCalendar();
}

function updateCalendarFromSelectors() {
    const month = parseInt(elements.monthSelector.value);
    const year = parseInt(elements.yearSelector.value);
    
    currentDate = new Date(year, month, 1);
    loadCalendar();
}

function updateSelectorsFromDate() {
    elements.monthSelector.value = currentDate.getMonth();
    elements.yearSelector.value = currentDate.getFullYear();
}

// --- FUNCIONES DE CARGA DE DATOS ---

async function loadInstructores() {
    try {
        console.log('👥 Cargando instructores disponibles...');
        instructoresDisponibles = await gruposService.getInstructoresDisponibles();
        
        // Poblar selector
        elements.instructorSelector.innerHTML = '<option value="">Seleccionar Instructor...</option>';
        instructoresDisponibles.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id_usuario;
            option.textContent = instructor.nombre_completo || `Usuario ID: ${instructor.id_usuario}`;
            elements.instructorSelector.appendChild(option);
        });
        
        console.log(`✅ ${instructoresDisponibles.length} instructores cargados`);
    } catch (error) {
        console.error('❌ Error al cargar instructores:', error);
    }
}

function handleInstructorChange() {
    const selectedInstructorId = parseInt(elements.instructorSelector.value);
    
    if (selectedInstructorId) {
        currentInstructorId = selectedInstructorId;
        elements.selectInstructorMessage.classList.add('d-none');
        elements.addProgramacionBtn.classList.remove('d-none');
        loadCalendar();
    } else {
        currentInstructorId = null;
        elements.selectInstructorMessage.classList.remove('d-none');
        elements.addProgramacionBtn.classList.add('d-none');
        hideCalendar();
    }
}

async function loadCalendar() {
    if (!currentInstructorId) {
        return;
    }
    
    try {
        showCalendarLoading();
        
        console.log('📅 Cargando programación del calendario...');
        
        // Formatear fecha para la consulta
        const fechaConsulta = formatDateForAPI(currentDate);
        
        // Cargar programaciones según el rol
        if (currentRole === 3) {
            // Instructor: usar sus propias programaciones
            currentProgramaciones = await programacionService.getOwnProgramaciones();
        } else {
            // Coordinador: obtener programaciones del instructor seleccionado
            currentProgramaciones = await programacionService.getProgramacionesByInstructorMes(
                currentInstructorId, 
                fechaConsulta
            );
        }
        
        // Filtrar programaciones del mes actual
        const programacionesMes = filterProgramacionesByMonth(currentProgramaciones, currentDate);
        
        console.log(`✅ ${programacionesMes.length} programaciones cargadas para el mes`);
        
        // Renderizar calendario
        renderCalendar(programacionesMes);
        showCalendar();
        
    } catch (error) {
        console.error('❌ Error al cargar calendario:', error);
        showCalendarError(error.message || 'Error al cargar la programación');
    }
}

async function loadFestivos() {
    try {
        const response = await fetch(`http://localhost:8000/festivos/get-all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Respuesta inválida del backend: no es un arreglo');

        const fechas = data.map(f => f.festivo.split('T')[0]); // ← ⬅️ corrección clave aquí
        console.log(`✅ ${fechas.length} festivos cargados:`, fechas);
        return fechas;
    } catch (error) {
        console.error('❌ Error al cargar festivos:', error);
        return [];
    }
}


console.log('Festivos cargados:', diasFestivos);


function filterProgramacionesByMonth(programaciones, date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return programaciones.filter(prog => {
        const progDate = new Date(prog.fecha_programada);
        return progDate.getFullYear() === year && progDate.getMonth() === month;
    });
}

// --- FUNCIONES DE RENDERIZADO ---

function renderCalendar(programaciones) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título del mes
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    elements.calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Calcular días del calendario
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    
    // Generar días del calendario
    elements.calendarDays.innerHTML = '';
    
    for (let i = 0; i < 42; i++) { // 6 semanas x 7 días
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        
        const dayElement = createDayElement(currentDay, month, today, programaciones);
        elements.calendarDays.appendChild(dayElement);
    }
}

function createProgramacionEvent(programacion) {
    const eventBtn = document.createElement('button');
    eventBtn.className = 'programacion-event';
    eventBtn.type = 'button';

    eventBtn.innerHTML = `
        <span class="ficha-number">${programacion.cod_ficha}</span>
        <span class="horas">${programacion.horas_programadas}h</span>
    `;

    eventBtn.addEventListener('click', () => openProgramacionModal(programacion.id_programacion));

    return eventBtn;
}



function createDayElement(date, currentMonth, today, programaciones) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    // Clases adicionales
    if (date.getMonth() !== currentMonth) {
        dayDiv.classList.add('other-month');
    }
    
    if (isSameDay(date, today)) {
        dayDiv.classList.add('today');
    }
    
    // Número del día
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayDiv.appendChild(dayNumber);
    
    // Programaciones del día
    const dayProgramaciones = programaciones.filter(prog => 
        isSameDay(parseLocalDate(prog.fecha_programada), date)
    );
    
    dayProgramaciones.forEach(prog => {
        const eventBtn = createProgramacionEvent(prog);  // ← Ya agrega los datasets internamente
        dayDiv.appendChild(eventBtn);
    });

    const isDomingo = date.getDay() === 0;
    const isFestivo = diasFestivos.includes(formatDateForAPI(date));

    if (isDomingo || isFestivo) {
        dayDiv.classList.add('dia-bloqueado');
        dayDiv.classList.add('disabled');
        dayDiv.title = isDomingo ? 'Domingo no programable' : 'Festivo no programable';
    }
    
    return dayDiv;
}



// --- FUNCIONES DE MODALES ---

function setupModalEventListeners() {
    // Modal de programación
    const editBtn = document.getElementById('edit-programacion-btn');
    const saveBtn = document.getElementById('save-programacion-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    if (editBtn) editBtn.addEventListener('click', enableEditMode);
    if (saveBtn) saveBtn.addEventListener('click', saveProgramacion);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEditMode);
    
    // Event listener para reset cuando se cierra el modal de programación
    const programacionModal = document.getElementById('programacion-modal');
    if (programacionModal) {
        programacionModal.addEventListener('hidden.bs.modal', () => {
            resetEditMode();
            currentProgramacionId = null;
        });
    }
    
    // Modal nueva programación
    const guardarBtn = document.getElementById('guardar-nueva-programacion');
    if (guardarBtn) guardarBtn.addEventListener('click', createNuevaProgramacion);
    
    // Event listener para reset cuando se cierra el modal de nueva programación
    const nuevaProgramacionModal = document.getElementById('nueva-programacion-modal');
    if (nuevaProgramacionModal) {
        nuevaProgramacionModal.addEventListener('hidden.bs.modal', () => {
            resetNuevaProgramacionForm();
        });
    }
    
    // Listeners para cascadas de selects
    const nuevaFicha = document.getElementById('nueva-ficha');
    const nuevaCompetencia = document.getElementById('nueva-competencia');
    
    if (nuevaFicha) nuevaFicha.addEventListener('change', loadCompetenciasByFicha);
    if (nuevaCompetencia) nuevaCompetencia.addEventListener('change', loadResultadosByCompetencia);
}

async function openProgramacionModal(idProgramacion) {
    try {
        // Guardar ID de la programación actual
        currentProgramacionId = idProgramacion;
        
        const modal = new bootstrap.Modal(elements.programacionModal);
        
        // Mostrar loading
        showModalLoading();
        hideModalError();
        hideModalContent();
        
        // Resetear modo edición al abrir
        resetEditMode();
        
        modal.show();
        
        // Cargar datos de la programación
        const programacion = await programacionService.getProgramacionById(idProgramacion);
        
        // Poblar formulario
        populateProgramacionForm(programacion);
        
        // Mostrar contenido
        showModalContent();
        hideModalLoading();
        
        // Configurar botones según permisos
        setupModalButtons(programacion);
        
    } catch (error) {
        console.error('❌ Error al abrir modal de programación:', error);
        showModalError(error.message || 'Error al cargar los detalles');
        hideModalLoading();
    }
}

function populateProgramacionForm(programacion) {
    document.getElementById('modal-cod-ficha').value = programacion.cod_ficha || '';
    document.getElementById('modal-fecha').value = programacion.fecha_programada || '';
    document.getElementById('modal-horas').value = programacion.horas_programadas || '';
    document.getElementById('modal-hora-inicio').value = programacion.hora_inicio || '';
    document.getElementById('modal-hora-fin').value = programacion.hora_fin || '';
    document.getElementById('modal-competencia').value = programacion.nombre_competencia || '';
    document.getElementById('modal-resultado').value = programacion.nombre_resultado || '';
    
    // Mostrar instructor solo para coordinadores
    const instructorContainer = document.getElementById('modal-instructor-container');
    if (currentRole === 1 || currentRole === 2) {
        document.getElementById('modal-instructor').value = programacion.nombre_instructor || '';
        instructorContainer.classList.remove('d-none');
    } else {
        instructorContainer.classList.add('d-none');
    }
}

function setupModalButtons(programacion) {
    const editBtn = document.getElementById('edit-programacion-btn');
    
    // Mostrar botón editar solo si tiene permisos
    if (canEditProgramacion(programacion)) {
        editBtn.classList.remove('d-none');
    } else {
        editBtn.classList.add('d-none');
    }
}

function canEditProgramacion(programacion) {
    // Coordinadores pueden editar todo
    if (currentRole === 1 || currentRole === 2) {
        return true;
    }
    
    // Instructores solo pueden editar sus propias programaciones
    if (currentRole === 3) {
        return programacion.id_instructor === currentInstructorId;
    }
    
    return false;
}

// --- FUNCIONES DE ESTADOS UI ---

function showCalendarLoading() {
    elements.calendarLoading.classList.remove('d-none');
    elements.calendarError.classList.add('d-none');
    elements.calendarContainer.classList.add('d-none');
}

function showCalendar() {
    elements.calendarContainer.classList.remove('d-none');
    elements.calendarLoading.classList.add('d-none');
    elements.calendarError.classList.add('d-none');
}

function showCalendarError(message) {
    elements.calendarError.classList.remove('d-none');
    elements.calendarLoading.classList.add('d-none');
    elements.calendarContainer.classList.add('d-none');
    
    const errorMsg = document.getElementById('calendar-error-message');
    if (errorMsg) errorMsg.textContent = message;
}

function hideCalendar() {
    elements.calendarContainer.classList.add('d-none');
    elements.calendarLoading.classList.add('d-none');
    elements.calendarError.classList.add('d-none');
}

function showModalLoading() {
    document.getElementById('modal-loading').classList.remove('d-none');
}

function hideModalLoading() {
    document.getElementById('modal-loading').classList.add('d-none');
}

function showModalContent() {
    document.getElementById('modal-content').classList.remove('d-none');
}

function hideModalContent() {
    document.getElementById('modal-content').classList.add('d-none');
}

function showModalError(message) {
    const errorDiv = document.getElementById('modal-error');
    const errorText = document.getElementById('modal-error-text');
    
    if (errorText) errorText.textContent = message;
    if (errorDiv) errorDiv.classList.remove('d-none');
}

function hideModalError() {
    const errorDiv = document.getElementById('modal-error');
    if (errorDiv) errorDiv.classList.add('d-none');
}

// --- FUNCIONES AUXILIARES ---

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // mes -1 porque enero = 0
}

// --- FUNCIONES DE EDICIÓN Y CREACIÓN ---

let editMode = false;
let currentProgramacionId = null;

function enableEditMode() {
    console.log('🔧 Habilitando modo edición...');
    editMode = true;
    
    // Habilitar campos editables
    const editableFields = ['modal-fecha', 'modal-horas', 'modal-hora-inicio', 'modal-hora-fin'];
    editableFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.removeAttribute('readonly');
    });
    
    // Mostrar/ocultar botones
    document.getElementById('edit-programacion-btn').classList.add('d-none');
    document.getElementById('save-programacion-btn').classList.remove('d-none');
    document.getElementById('cancel-edit-btn').classList.remove('d-none');
    
    // Cambiar título del modal
    document.getElementById('programacion-modal-label').innerHTML = `
        <i class="material-symbols-rounded me-2">edit</i>
        Editar Programación
    `;
}

async function saveProgramacion() {
    console.log('💾 Guardando programación...');
    
    if (!currentProgramacionId) {
        showModalError('No hay programación seleccionada para guardar');
        return;
    }
    
    try {
        // Deshabilitar botón mientras se guarda
        const saveBtn = document.getElementById('save-programacion-btn');
        const saveText = document.getElementById('save-programacion-text');
        const originalText = saveText.textContent;
        
        saveBtn.disabled = true;
        saveText.textContent = 'Guardando...';
        
        // Obtener datos del formulario
        const updateData = {
            fecha_programada: document.getElementById('modal-fecha').value,
            horas_programadas: parseInt(document.getElementById('modal-horas').value),
            hora_inicio: document.getElementById('modal-hora-inicio').value,
            hora_fin: document.getElementById('modal-hora-fin').value
        };
        
        // Validaciones básicas
        if (!updateData.fecha_programada || !updateData.horas_programadas || 
            !updateData.hora_inicio || !updateData.hora_fin) {
            throw new Error('Todos los campos son obligatorios');
        }
        
        if (updateData.hora_inicio >= updateData.hora_fin) {
            throw new Error('La hora de inicio debe ser menor que la hora de fin');
        }
        
        // Validar conflicto de horario con otras programaciones (excluyendo la actual)
        const programacionesEnFecha = currentProgramaciones.filter(p =>
            p.id_instructor === currentInstructorId &&
            p.fecha_programada === updateData.fecha_programada &&
            p.id_programacion !== currentProgramacionId // 👈 Evita compararse consigo misma
        );


        // Actualizar programación
        await programacionService.updateProgramacion(currentProgramacionId, updateData);
        
        // Cerrar modal y recargar calendario
        const modal = bootstrap.Modal.getInstance(elements.programacionModal);
        modal.hide();
        
        // Recargar calendario
        await loadCalendar();
        
        console.log('✅ Programación actualizada correctamente');
        
    } catch (error) {
        console.error('❌ Error al guardar programación:', error);
        showModalError(error.message || 'Error al guardar los cambios');
        
        // Restaurar botón
        const saveBtn = document.getElementById('save-programacion-btn');
        const saveText = document.getElementById('save-programacion-text');
        saveBtn.disabled = false;
        saveText.textContent = 'Guardar Cambios';
    }
}

function cancelEditMode() {
    console.log('❌ Cancelando edición...');
    
    // Cerrar modal sin guardar
    const modal = bootstrap.Modal.getInstance(elements.programacionModal);
    if (modal) {
        modal.hide();
    }
    
    resetEditMode();
}

function resetEditMode() {
    editMode = false;
    currentProgramacionId = null;
    
    // Restaurar campos como readonly
    const editableFields = ['modal-fecha', 'modal-horas', 'modal-hora-inicio', 'modal-hora-fin'];
    editableFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.setAttribute('readonly', true);
    });
    
    // Restaurar botones
    document.getElementById('edit-programacion-btn').classList.remove('d-none');
    document.getElementById('save-programacion-btn').classList.add('d-none');
    document.getElementById('cancel-edit-btn').classList.add('d-none');
    
    // Restaurar título del modal
    document.getElementById('programacion-modal-label').innerHTML = `
        <i class="material-symbols-rounded me-2">event_note</i>
        Detalles de Programación
    `;
}

async function openNuevaProgramacionModal() {
    console.log('➕ Abriendo modal nueva programación...');
    
    try {
        const modal = new bootstrap.Modal(elements.nuevaProgramacionModal);
        
        // Limpiar formulario
        resetNuevaProgramacionForm();
        
        // Cargar fichas del instructor
        await loadFichasForNewProgramacion();
        
        // Establecer fecha por defecto
        const today = new Date();
        document.getElementById('nueva-fecha').value = formatDateForAPI(today);
        
        const fechaInput = document.getElementById('nueva-fecha');
        fechaInput.addEventListener('input', (e) => {
            const fecha = e.target.value;
            const fechaDate = parseLocalDate(fecha);
            const esDomingo = fechaDate.getDay() === 0;
            const esFestivo = diasFestivos.includes(fecha);

            if (esDomingo || esFestivo) {
                showNuevaModalError('No se puede programar en domingos ni festivos.');
                e.target.value = '';
            } else {
                hideNuevaModalError();
            }
        });

        modal.show();
        
    } catch (error) {
        console.error('❌ Error al abrir modal nueva programación:', error);
        showNuevaModalError(error.message || 'Error al cargar el formulario');
    }
}


async function createNuevaProgramacion() {
    console.log('💾 Creando nueva programación...');
    
    try {
        // Deshabilitar botón mientras se crea
        const guardarBtn = document.getElementById('guardar-nueva-programacion');
        const guardarText = document.getElementById('guardar-nueva-text');
        const originalText = guardarText.textContent;
        
        guardarBtn.disabled = true;
        guardarText.textContent = 'Creando...';
        
        // Obtener datos del formulario
        const programacionData = {
            id_instructor: currentInstructorId,
            cod_ficha: parseInt(document.getElementById('nueva-ficha').value),
            fecha_programada: document.getElementById('nueva-fecha').value,
            horas_programadas: parseInt(document.getElementById('nueva-horas').value),
            hora_inicio: document.getElementById('nueva-hora-inicio').value,
            hora_fin: document.getElementById('nueva-hora-fin').value,
            cod_competencia: parseInt(document.getElementById('nueva-competencia').value),
            cod_resultado: parseInt(document.getElementById('nueva-resultado').value)
        };

        const fecha = programacionData.fecha_programada;
        const fechaDate = parseLocalDate(fecha);
        const esDomingo = fechaDate.getDay() === 0;
        const esFestivo = diasFestivos.includes(fecha);

        if (esDomingo || esFestivo) {
            throw new Error('No se puede crear programación en domingos ni festivos.');
        }

        // Validaciones básicas
        if (!programacionData.cod_ficha || !programacionData.fecha_programada || 
            !programacionData.horas_programadas || !programacionData.hora_inicio || 
            !programacionData.hora_fin || !programacionData.cod_competencia || 
            !programacionData.cod_resultado) {
            throw new Error('Todos los campos son obligatorios');
        }
        
        if (programacionData.hora_inicio >= programacionData.hora_fin) {
            throw new Error('La hora de inicio debe ser menor que la hora de fin');
        }

        // Validar traslape con otras programaciones
        const fechaNueva = programacionData.fecha_programada;
        const inicioNueva = programacionData.hora_inicio;
        const finNueva = programacionData.hora_fin;

        // Filtrar las programaciones del instructor en la misma fecha
        const programacionesEnFecha = currentProgramaciones.filter(p =>
            p.id_instructor === programacionData.id_instructor &&
            p.fecha_programada === fechaNueva
        );

        const traslape = programacionesEnFecha.some(p => {
            const iniExistente = p.hora_inicio;
            const finExistente = p.hora_fin;

            return (
                (inicioNueva >= iniExistente && inicioNueva < finExistente) || // Inicia dentro de otra
                (finNueva > iniExistente && finNueva <= finExistente) ||       // Termina dentro de otra
                (inicioNueva <= iniExistente && finNueva >= finExistente)      // La nueva contiene a otra
            );
        });

        if (traslape) {
            throw new Error('Este horario se cruza con otra programación existente.');
        }


        // Crear programación
        await programacionService.createProgramacion(programacionData);
        
        // Cerrar modal y recargar calendario
        const modal = bootstrap.Modal.getInstance(elements.nuevaProgramacionModal);
        modal.hide();
        
        // Recargar calendario
        await loadCalendar();
        
        console.log('✅ Programación creada correctamente');
        
    } catch (error) {
        console.error('❌ Error al crear programación:', error);
        showNuevaModalError(error.message || 'Error al crear la programación');
    } finally {
        // Restaurar botón SIEMPRE
        const guardarBtn = document.getElementById('guardar-nueva-programacion');
        const guardarText = document.getElementById('guardar-nueva-text');
        guardarBtn.disabled = false;
        guardarText.textContent = 'Crear Programación';
    }

}

async function loadFichasForNewProgramacion() {
    try {
        // Obtener fichas del instructor (placeholder - necesita implementación en backend)
        console.log('📋 Cargando fichas del instructor...');
        
        const fichas = await programacionService.getFichasByInstructor(currentInstructorId);
        
        const fichaSelect = document.getElementById('nueva-ficha');
        fichaSelect.innerHTML = '<option value="">Seleccionar ficha...</option>';
        
        if (fichas.length === 0) {
            fichaSelect.innerHTML = '<option value="">No hay fichas asignadas</option>';
            fichaSelect.disabled = true;
        } else {
            fichas.forEach(ficha => {
                const option = document.createElement('option');
                option.value = ficha.cod_ficha;
                option.textContent = `Ficha ${ficha.cod_ficha}`;
                fichaSelect.appendChild(option);
            });

            // Escuchar cambios en el select de ficha para cargar horario y competencias
            document.getElementById('nueva-ficha').addEventListener('change', async function () {
            const codFicha = this.value;

            if (codFicha) {
                await loadHorarioGrupo(codFicha);       // ← Carga hora_inicio y hora_fin automáticamente
                await loadCompetenciasByFicha();        // ← Carga competencias y sus resultados
            } else {
                document.getElementById('nueva-hora-inicio').value = '';
                document.getElementById('nueva-hora-fin').value = '';
            }
            });

        }

    } catch (error) {
        console.error('❌ Error al cargar fichas:', error);
        const fichaSelect = document.getElementById('nueva-ficha');
        fichaSelect.innerHTML = '<option value="">Error al cargar fichas</option>';
        fichaSelect.disabled = true;
    }
}


// --- CARGAR HORARIO AUTOMÁTICAMENTE AL SELECCIONAR FICHA ---
async function loadHorarioGrupo(codFicha) {
    try {
        console.log(`⏰ Cargando horario del grupo para ficha ${codFicha}...`);

        const grupo = await request(`/grupo/get-by-cod-ficha/${codFicha}`, {
            method: 'GET'
        });

        console.log('🕒 Horario del grupo:', grupo);

        document.getElementById('nueva-hora-inicio').value = grupo.hora_inicio ?? '';
        document.getElementById('nueva-hora-fin').value = grupo.hora_fin ?? '';
    } catch (error) {
        console.error('❌ Error al cargar horario del grupo:', error);
    }
}



async function loadCompetenciasByFicha() {
    const codFicha = document.getElementById('nueva-ficha').value;
    
    if (!codFicha) {
        // Limpiar competencias y resultados
        const competenciaSelect = document.getElementById('nueva-competencia');
        const resultadoSelect = document.getElementById('nueva-resultado');
        
        competenciaSelect.innerHTML = '<option value="">Seleccionar competencia...</option>';
        resultadoSelect.innerHTML = '<option value="">Seleccionar resultado...</option>';
        return;
    }
    
    try {
        console.log('📚 Cargando competencias por ficha...');
        
        const competencias = await programacionService.getCompetenciasByFicha(parseInt(codFicha));
        
        const competenciaSelect = document.getElementById('nueva-competencia');
        competenciaSelect.innerHTML = '<option value="">Seleccionar competencia...</option>';
        
        if (competencias.length === 0) {
            competenciaSelect.innerHTML = '<option value="">No hay competencias disponibles</option>';
        } else {
            competencias.forEach(competencia => {
                const option = document.createElement('option');
                option.value = competencia.cod_competencia;
                option.textContent = `${competencia.cod_competencia} - ${competencia.nombre}`;
                competenciaSelect.appendChild(option);
            });
        }
        
        // Limpiar resultados
        document.getElementById('nueva-resultado').innerHTML = '<option value="">Seleccionar resultado...</option>';
        
    } catch (error) {
        console.error('❌ Error al cargar competencias:', error);
        const competenciaSelect = document.getElementById('nueva-competencia');
        competenciaSelect.innerHTML = '<option value="">Error al cargar competencias</option>';
    }
}

async function loadResultadosByCompetencia() {
    const codCompetencia = document.getElementById('nueva-competencia').value;
    
    if (!codCompetencia) {
        const resultadoSelect = document.getElementById('nueva-resultado');
        resultadoSelect.innerHTML = '<option value="">Seleccionar resultado...</option>';
        return;
    }
    
    try {
        console.log('🎯 Cargando resultados por competencia...');
        
        const resultados = await programacionService.getResultadosByCompetencia(parseInt(codCompetencia));
        
        const resultadoSelect = document.getElementById('nueva-resultado');
        resultadoSelect.innerHTML = '<option value="">Seleccionar resultado...</option>';
        
        if (resultados.length === 0) {
            resultadoSelect.innerHTML = '<option value="">No hay resultados disponibles</option>';
        } else {
            resultados.forEach(resultado => {
                const option = document.createElement('option');
                option.value = resultado.cod_resultado;
                option.textContent = `${resultado.cod_resultado} - ${resultado.nombre}`;
                resultadoSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('❌ Error al cargar resultados:', error);
        const resultadoSelect = document.getElementById('nueva-resultado');
        resultadoSelect.innerHTML = '<option value="">Error al cargar resultados</option>';
    }
}

function resetNuevaProgramacionForm() {
    const form = document.getElementById('nueva-programacion-form');
    if (form) form.reset();
    
    hideNuevaModalError();
    
    // Restaurar selects
    const selects = ['nueva-ficha', 'nueva-competencia', 'nueva-resultado'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Seleccionar...</option>';
            select.disabled = false;
        }
    });
}

function showNuevaModalError(message) {
    const errorDiv = document.getElementById('nueva-modal-error');
    const errorText = document.getElementById('nueva-modal-error-text');
    
    if (errorText) errorText.textContent = message;
    if (errorDiv) errorDiv.classList.remove('d-none');
}

function hideNuevaModalError() {
    const errorDiv = document.getElementById('nueva-modal-error');
    if (errorDiv) errorDiv.classList.add('d-none');
}

// --- EXPORTAR FUNCIÓN INIT ---

export { init }; 
