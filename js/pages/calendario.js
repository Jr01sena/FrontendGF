
// 📅 CALENDARIO.JS - Refactorizado y Limpio
// Conserva estructura y estilos actuales
// Mejora: Click en días habilitados abre modal + alertas reactivas + limpieza de código

import { request } from "../api/apiClient.js";
import { programacionService } from '../api/programacion.service.js';
import { gruposService } from '../api/grupos.service.js';

let currentUser = null;
let currentRole = null;
let currentInstructorId = null;
let currentDate = new Date();
let currentProgramaciones = [];
let instructoresDisponibles = [];
let diasFestivos = [];

let elements = {};

// 🔄 INIT PRINCIPAL
async function init() {
  try {
    console.log('🚀 Inicializando módulo de calendario');

    loadUserInfo();
    initializeElements();
    setupYearSelector();
    setupEventListeners();

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
    console.log('👤 Usuario actual:', currentUser);
  }
}

function initializeElements() {
  elements = {
    calendarDays: document.getElementById('calendar-days'),
    calendarMonthYear: document.getElementById('calendar-month-year'),
    monthSelector: document.getElementById('month-selector'),
    yearSelector: document.getElementById('year-selector'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    addProgramacionBtn: document.getElementById('add-programacion-btn'),
    calendarContainer: document.getElementById('calendar-container'),
    calendarLoading: document.getElementById('calendar-loading'),
    calendarError: document.getElementById('calendar-error'),
    calendarSubtitle: document.getElementById('calendar-subtitle'),
    instructorSelector: document.getElementById('instructor-selector'),
    instructorSelectorContainer: document.getElementById('instructor-selector-container'),
    selectInstructorMessage: document.getElementById('select-instructor-message'),
    retryCalendarBtn: document.getElementById('retry-calendar'),
    programacionModal: document.getElementById('programacion-modal'),
    nuevaProgramacionModal: document.getElementById('nueva-programacion-modal')
  };
}

function setupYearSelector() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 2;
  const endYear = Math.max(currentYear + 3, 2030);
  elements.yearSelector.innerHTML = '';
  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    elements.yearSelector.appendChild(option);
  }
  elements.monthSelector.value = currentDate.getMonth();
}

function setupEventListeners() {
  elements.prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
  elements.nextMonthBtn.addEventListener('click', () => navigateMonth(1));
  elements.monthSelector.addEventListener('change', updateCalendarFromSelectors);
  elements.yearSelector.addEventListener('change', updateCalendarFromSelectors);
  elements.retryCalendarBtn.addEventListener('click', loadCalendar);
  elements.addProgramacionBtn.addEventListener('click', () => openNuevaProgramacionModal());
  if (elements.instructorSelector) {
    elements.instructorSelector.addEventListener('change', handleInstructorChange);
  }
}

function navigateMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
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
  const msg = document.getElementById('calendar-error-message');
  if (msg) msg.textContent = message;
}

function renderCalendar(programaciones = []) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  elements.calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  elements.calendarDays.innerHTML = '';

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);

    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    const isToday = isSameDay(day, today);
    const isOtherMonth = day.getMonth() !== month;
    const isSunday = day.getDay() === 0;
    const isHoliday = diasFestivos.includes(formatDateForAPI(day));

    if (isToday) dayEl.classList.add('today');
    if (isOtherMonth) dayEl.classList.add('other-month');
    if (isSunday || isHoliday) {
      dayEl.classList.add('dia-bloqueado', 'disabled');
      dayEl.title = isSunday ? 'Domingo no programable' : 'Festivo no programable';
    } else {
      dayEl.addEventListener('click', () => openNuevaProgramacionModal(day));
    }

    const numberEl = document.createElement('div');
    numberEl.className = 'day-number';
    numberEl.textContent = day.getDate();
    dayEl.appendChild(numberEl);

    const events = programaciones.filter(p => isSameDay(parseLocalDate(p.fecha_programada), day));
    for (const prog of events) {
      const btn = document.createElement('button');
      btn.className = 'programacion-event';
      btn.type = 'button';
      btn.innerHTML = `<span class="ficha-number">${prog.cod_ficha}</span><span class="horas">${prog.horas_programadas}h</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProgramacionModal(prog.id_programacion);
      });
      dayEl.appendChild(btn);
    }

    elements.calendarDays.appendChild(dayEl);
  }
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function formatDateForAPI(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export { init };
