import { userService } from '../api/user.service.js';

export function init() {
  const userInfoDiv = document.getElementById("perfil-user-info");
  if (!userInfoDiv) return;

  const form = document.getElementById("editarPerfilForm");
  const nombreInput = document.getElementById("nombre_completo");
  const contratoInput = document.getElementById("tipo_contrato");
  const telefonoInput = document.getElementById("telefono");
  const correoInput = document.getElementById("correo");

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    userInfoDiv.innerHTML = `<div class="alert alert-warning">No se encontró información del usuario.</div>`;
    return;
  }

  renderUserInfo(user);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const updatedData = {
      nombre_completo: nombreInput.value.trim(),
      tipo_contrato: contratoInput.value.trim(),
      telefono: telefonoInput.value.trim(),
    };

    const newEmail = correoInput.value.trim();
    if (newEmail !== user.correo) {
      updatedData.correo = newEmail;
    }

    try {
      // 🔁 1. Actualiza el usuario
      await userService.updateUser(user.id_usuario, updatedData);

      // 🔁 2. Obtiene los datos actualizados desde el backend
      const refreshedUser = await userService.getUserById(user.id_usuario);

      // 🔁 3. Guarda y renderiza el nuevo usuario
      localStorage.setItem("user", JSON.stringify(refreshedUser));
      cerrarModal();
      renderUserInfo(refreshedUser);
      alert("✅ Perfil actualizado exitosamente.");
    } catch (error) {
      console.error("❌ Error actualizando perfil:", error);
      alert(error.message || "No se pudo actualizar el perfil.");
    }
  });


  // Prellenar formulario al abrir el modal
  const modal = document.getElementById("editarPerfilModal");
  modal.addEventListener("show.bs.modal", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      nombreInput.value = user.nombre_completo || "";
      contratoInput.value = user.tipo_contrato || "";
      telefonoInput.value = user.telefono || "";
      correoInput.value = user.correo || "";
    }
  });
}

function renderUserInfo(user) {
  const userInfoDiv = document.getElementById("perfil-user-info");

  userInfoDiv.innerHTML = `
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 text-center border-end d-flex flex-column align-items-center justify-content-center">
          <div class="avatar bg-gradient-success text-white fw-bold rounded-circle d-flex align-items-center justify-content-center mb-3"
                style="width: 64px; height: 64px; font-size: 1.8rem;">
              ${getIniciales(user.nombre_completo)}
            </div>
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
                <span class="badge bg-${user.estado ? 'success' : 'secondary'}">${user.estado ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
            <div class="row mb-2"><div class="col-6"><strong>Centro Formación:</strong></div><div class="col-6 text-muted">${user.cod_centro}</div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function cerrarModal() {
  const modal = document.getElementById("editarPerfilModal");
  const modalInstance = bootstrap.Modal.getInstance(modal);
  if (modalInstance) modalInstance.hide();

  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
}

function getIniciales(nombreCompleto) {
  if (!nombreCompleto) return 'U';
  const partes = nombreCompleto.trim().split(" ");
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0][0].toUpperCase();
}
