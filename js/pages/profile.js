export function init() {
  conectarListenerModal();
  const userInfoDiv = document.getElementById("perfil-user-info");
  if (!userInfoDiv) return;

  const form = document.getElementById("editarPerfilForm");
  const nombreInput = document.getElementById("nombre_completo");
  const contratoInput = document.getElementById("tipo_contrato");
  const telefonoInput = document.getElementById("telefono");
  const correoInput = document.getElementById("correo");

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      userInfoDiv.innerHTML = `<div class="alert alert-warning">No se encontró información del usuario.</div>`;
      return;
    }

    userInfoDiv.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 text-center border-end d-flex flex-column align-items-center justify-content-center">
              <i class="material-symbols-rounded mb-3" style="font-size: 4rem; color: #4caf50;">account_circle</i>
              <h5 class="text-success">${user.nombre_completo}</h5>
              <span class="text-muted small">${user.rol}</span>
            </div>
            <div class="col-md-8">
              <div class="row mb-2"><div class="col-6"><strong>ID:</strong></div><div class="col-6 text-muted">${user.id_usuario}</div></div>
              <div class="row mb-2"><div class="col-6"><strong>Identificación:</strong></div><div class="col-6 text-muted">${user.identificacion}</div></div>
              <div class="row mb-2"><div class="col-6"><strong>Correo:</strong></div><div class="col-6 text-muted">${user.correo}</div></div>
              <div class="row mb-2"><div class="col-6"><strong>Teléfono:</strong></div><div class="col-6 text-muted">${user.telefono}</div></div>
              <div class="row mb-2"><div class="col-6"><strong>Tipo de Contrato:</strong></div><div class="col-6 text-muted">${user.tipo_contrato}</div></div>
              <div class="row mb-2">
                <div class="col-6"><strong>Estado:</strong></div>
                <div class="col-6">
                    <span class="badge bg-${user.estado ? 'success' : 'secondary'}">
                    ${user.estado ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
              </div>

              <div class="row mb-2"><div class="col-6"><strong>Centro Formación:</strong></div><div class="col-6 text-muted">${user.cod_centro}</div></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Actualizar usuario en el modal
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      const updatedUser = {
        ...user,
        nombre_completo: nombreInput.value.trim(),
        tipo_contrato: contratoInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        correo: correoInput.value.trim(),
      };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        const modal = bootstrap.Modal.getInstance(document.getElementById("editarPerfilModal"));
        modal.hide();

        // 🚨 SOLUCIÓN TEMPORAL SEGURA:
        location.reload(); // ✅ recarga toda la app sin romper módulos


    });

    // Mostrar datos actualizados al abrir el modal
    const modalElement = document.getElementById("editarPerfilModal");
    modalElement.addEventListener("show.bs.modal", () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        nombreInput.value = user.nombre_completo || "";
        contratoInput.value = user.tipo_contrato || "";
        telefonoInput.value = user.telefono || "";
        correoInput.value = user.correo || "";
      }
    });

  } catch (err) {
    userInfoDiv.innerHTML = `<div class="alert alert-danger">Error al cargar el perfil del usuario.</div>`;
    console.error("Error cargando perfil:", err);
  }
}

function conectarListenerModal() {
  const modalElement = document.getElementById("editarPerfilModal");
  if (!modalElement) return;

  modalElement.addEventListener("show.bs.modal", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      nombreInput.value = user.nombre_completo || "";
      contratoInput.value = user.tipo_contrato || "";
      telefonoInput.value = user.telefono || "";
      correoInput.value = user.correo || "";
    }
  });
}




// Escuchar cuando el DOM esté listo y luego ejecutar init()
document.addEventListener("DOMContentLoaded", () => {
  init();
});
