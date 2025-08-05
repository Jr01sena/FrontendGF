// competencias.js
import { request } from "../api/apiClient.js";
import { resultadoService } from "../api/resultado.service.js";

let competencias = [];         // ← Se mantiene global para paginación
let currentPage = 1;
const pageSize = 5;            // ← Número de competencias por página

export const init = async () => {
  const codPrograma = localStorage.getItem("cod_programa");
  const laVersion = localStorage.getItem("la_version");

  if (!codPrograma || !laVersion) {
    document.getElementById("titulo-programa").textContent = "Programa no especificado";
    return;
  }

  try {
    competencias = await request(`/programa-competencia/get-competencias-by-programa/${codPrograma}/${laVersion}`);

    if (competencias.length > 0) {
      document.getElementById("titulo-programa").textContent = `Competencias del programa: ${competencias[0].nombre_programa}`;
    } else {
      document.getElementById("titulo-programa").textContent = "No se encontraron competencias";
    }

    renderizarCompetencias();         // ← ya no se pasa la lista completa
    renderizarPaginador();
  } catch (error) {
    console.error("Error al obtener competencias:", error);
    document.getElementById("competencias-table-body").innerHTML = `
      <tr><td colspan="3">Error al cargar datos</td></tr>
    `;
  }

  document.getElementById("btn-volver").addEventListener("click", () => {
    localStorage.removeItem("cod_programa");
    localStorage.removeItem("la_version");
    window.loadContent("programas");
  });

};

const renderizarCompetencias = () => {
  const tbody = document.getElementById("competencias-table-body");
  tbody.innerHTML = "";

  if (competencias.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay competencias registradas.</td></tr>`;
    return;
  }

  const inicio = (currentPage - 1) * pageSize;
  const fin = inicio + pageSize;
  const paginaActual = competencias.slice(inicio, fin);

  paginaActual.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.cod_competencia}</td>
      <td>${c.nombre_competencia}</td>
      <td>${c.horas !== null && c.horas !== undefined ? c.horas : '-'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center rounded-pill fw-semibold btn-ver-resultados" data-cod="${c.cod_competencia}">
          <i class="bi bi-bar-chart-line"></i> Ver Resultados
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".btn-ver-resultados").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const codCompetencia = btn.getAttribute("data-cod");
      try {
        const resultados = await resultadoService.getByCompetencia(codCompetencia);
        mostrarResultadosModal(resultados);
      } catch (error) {
        console.error("Error al obtener resultados:", error);
        mostrarResultadosModal([], "Error al cargar resultados.");
      }
    });
  });
};

function mostrarResultadosModal(resultados) {
  const tbody = document.getElementById("tablaResultadosBody");
  tbody.innerHTML = "";

  resultados.forEach(resultado => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${resultado.cod_resultado}</td>
      <td>${resultado.nombre}</td>
    `;
    tbody.appendChild(fila);
  });

  const modal = new bootstrap.Modal(document.getElementById("resultadosModal"));
  modal.show();
}

// -----------------------------
// Paginador
// -----------------------------
const renderizarPaginador = () => {
  const totalPages = Math.ceil(competencias.length / pageSize);
  const paginador = document.getElementById("paginador");
  paginador.innerHTML = "";

  if (totalPages <= 1) return;

  const ul = document.createElement("ul");
  ul.className = "pagination justify-content-center my-3";

  const crearItem = (label, page, disabled = false, active = false) => {
    const li = document.createElement("li");
    li.className = "page-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = label;
    btn.className = `btn btn-sm rounded-pill mx-1 fw-semibold ${
      active
        ? "btn-success text-white shadow border border-2 border-success"
        : "btn-outline-success"
    }`;
    btn.disabled = disabled || active;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!disabled && !active && currentPage !== page) {
        currentPage = page;
        renderizarCompetencias();
        renderizarPaginador();
      }
    });

    li.appendChild(btn);
    return li;
  };

  // ← Anterior
  ul.appendChild(crearItem("«", currentPage - 1, currentPage === 1));

  // ← Páginas visibles (solo 5 máx)
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

  // ← Siguiente
  ul.appendChild(crearItem("»", currentPage + 1, currentPage === totalPages));

  paginador.appendChild(ul);
};
