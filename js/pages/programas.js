// programas.js
import { programaService } from "../api/programa.service.js";

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}


let currentPage = 1; // Página actual
const pageSize = 5; // Número de programas por página
let totalPages = 1;
let modoBusqueda = false; // Indica si estamos en modo búsqueda

export const init = async () => {
  currentPage = 1; // Reinicia siempre
  modoBusqueda = false;
  await cargarProgramas();
  configurarBuscadorPrograma(); 
};

const cargarProgramas = async () => {
  try {
    const offset = (currentPage - 1) * pageSize;
    const response = await programaService.getAll(pageSize, offset);
    const programas = response.data || response;
    totalPages = Math.ceil(response.total / pageSize);
    renderizarTabla(programas);
    renderizarPaginador();
  } catch (error) {
    console.error("Error al cargar programas:", error);
  }
};

const renderizarTabla = (programas) => {
  const tbody = document.getElementById("programas-table-body");
  tbody.innerHTML = "";

  programas.forEach((p) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cod_programa}</td>
      <td>${p.la_version}</td>
      <td>${p.horas_lectivas}</td>
      <td>${p.horas_productivas}</td>
      <td class="px-0 text-end">
        <button 
          class="btn btn-sm btn-success editar-btn"
          data-cod="${p.cod_programa}"
          data-version="${p.la_version}"
          data-lectivas="${p.horas_lectivas}"
          data-productivas="${p.horas_productivas}"
        >
          Editar
        </button>
        <button 
          class="btn btn-sm btn-secondary ver-competencias-btn ms-1"
          data-cod="${p.cod_programa}"
          data-version="${p.la_version}"
        >
          Ver Competencias
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });


  // Agrega el listener a cada botón de editar
  document.querySelectorAll(".editar-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
        const cod = btn.getAttribute("data-cod");
        const version = btn.getAttribute("data-version");
        const lectivas = btn.getAttribute("data-lectivas");
        const productivas = btn.getAttribute("data-productivas");

        // Llenar los inputs del modal
        document.getElementById("edit-horas-lectivas").value = lectivas;
        document.getElementById("edit-horas-productivas").value = productivas;

        // Guardar los IDs en dataset del formulario
        const form = document.getElementById("edit-programa-form");
        form.dataset.codPrograma = cod;
        form.dataset.laVersion = version;

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById("edit-programa-modal"));
        modal.show();
        });
    });

    document.querySelectorAll(".ver-competencias-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
        const cod = btn.getAttribute("data-cod");
        const version = btn.getAttribute("data-version");

        // Guardar datos en localStorage
        localStorage.setItem("cod_programa", cod);
        localStorage.setItem("la_version", version);

        // Navegar a la vista de competencias
        loadContent("competencias"); // ← función global en main.js
        });
    });

};


const renderizarPaginador = () => {
  const paginador = document.getElementById("paginador");
  paginador.innerHTML = "";

  const maxVisible = 5;
  const botones = [];

  const btnAnterior = document.createElement("button");
  btnAnterior.textContent = "Anterior";
  btnAnterior.className = "btn btn-sm btn-outline-secondary mx-1";
  btnAnterior.disabled = modoBusqueda || currentPage === 1;
  btnAnterior.addEventListener("click", () => {
    if (!modoBusqueda && currentPage > 1) {
      currentPage--;
      cargarProgramas();
    }
  });
  botones.push(btnAnterior);

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    botones.push(crearBotonPagina(1));
    if (startPage > 2) botones.push(crearElipsis());
  }

  for (let i = startPage; i <= endPage; i++) {
    botones.push(crearBotonPagina(i));
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) botones.push(crearElipsis());
    botones.push(crearBotonPagina(totalPages));
  }

  const btnSiguiente = document.createElement("button");
  btnSiguiente.textContent = "Siguiente";
  btnSiguiente.className = "btn btn-sm btn-outline-secondary mx-1";
  btnSiguiente.disabled = modoBusqueda || currentPage === totalPages;
  btnSiguiente.addEventListener("click", () => {
    if (!modoBusqueda && currentPage < totalPages) {
      currentPage++;
      cargarProgramas();
    }
  });
  botones.push(btnSiguiente);

  botones.forEach(btn => paginador.appendChild(btn));
};



function crearBotonPagina(num) {
  const btn = document.createElement("button");
  btn.textContent = num;
  btn.className = `btn btn-sm ${num === currentPage ? "btn-primary" : "btn-outline-primary"} mx-1`;
  btn.disabled = modoBusqueda; // ← desactiva en búsqueda si no hay paginación real
  btn.addEventListener("click", () => {
    if (!modoBusqueda) {
      currentPage = num;
      cargarProgramas();
    }
  });
  return btn;
}


function crearElipsis() {
  const span = document.createElement("span");
  span.textContent = "...";
  span.className = "mx-1 text-muted";
  return span;
}


document.getElementById("edit-programa-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const codPrograma = this.dataset.codPrograma;
  const laVersion = this.dataset.laVersion;

  const horasLectivas = parseInt(document.getElementById("edit-horas-lectivas").value, 10);
  const horasProductivas = parseInt(document.getElementById("edit-horas-productivas").value, 10);

  try {
    await programaService.updateHorasPrograma(codPrograma, laVersion, {
      horas_lectivas: horasLectivas,
      horas_productivas: horasProductivas
    });

    // Cierra el modal
    const modalEl = document.getElementById("edit-programa-modal");
    bootstrap.Modal.getInstance(modalEl).hide();

    // Mostrar alerta
    mostrarAlertaPrograma("Programa actualizado exitosamente", "success");

    // Recarga los datos
    cargarProgramas();

  } catch (error) {
    console.error("Error al actualizar programa:", error);
    alert("Ocurrió un error al actualizar el programa.");
  }
});


const configurarBuscadorPrograma = () => {
  const inputBusqueda = document.getElementById("busqueda-programa");

  const manejarBusqueda = async (event) => {
    const valor = event.target.value.trim().toLowerCase();

    if (valor === "") {
      modoBusqueda = false;
      currentPage = 1;
      await cargarProgramas(); // 👈 Se asegura que el paginador se actualice bien
      return;
    }

    try {
      modoBusqueda = true;
      currentPage = 1;
      const resultados = await programaService.buscarPorNombre(valor);
      renderizarTabla(resultados);
      totalPages = 1;
      renderizarPaginador();
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  inputBusqueda.addEventListener("input", debounce(manejarBusqueda, 300)); // ← Espera 300ms
};



function mostrarAlertaPrograma(mensaje, tipo = "success") {
  const contenedor = document.getElementById("alert-container");
  if (!contenedor) return;

  const alerta = document.createElement("div");
  alerta.className = `alert alert-${tipo}`;
  alerta.role = "alert";
  alerta.textContent = mensaje;

  contenedor.appendChild(alerta);

  setTimeout(() => {
    alerta.remove();
  }, 4000); // 4 segundos
}
