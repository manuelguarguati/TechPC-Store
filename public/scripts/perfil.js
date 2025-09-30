document.addEventListener("DOMContentLoaded", async () => {
  const nombre = document.getElementById("nombre");
  const apellido = document.getElementById("apellido");
  const correo = document.getElementById("correo");
  const telefono = document.getElementById("telefono");
  const editarBtn = document.getElementById("editar-btn");
  const guardarBtn = document.getElementById("guardar-btn");

  //  Obtener datos de sesión del backend
  try {
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      nombre.value = data.name || "";
      correo.value = data.email || "";
      telefono.value = data.phone || "";
      // Puedes añadir apellido si lo guardas en sesión
    } else {
      alert("No has iniciado sesión");
      window.location.href = "/login";
    }
  } catch (err) {
    console.error("Error al obtener perfil:", err);
  }

  //  Permitir edición
  editarBtn.addEventListener("click", () => {
    [nombre, apellido, correo, telefono].forEach(input => input.removeAttribute("readonly"));
    editarBtn.style.display = "none";
    guardarBtn.style.display = "inline-block";
  });

  // Guardar cambios (ejemplo, aún no conecta con base de datos)
  guardarBtn.addEventListener("click", async () => {
    const datosActualizados = {
      name: nombre.value,
      lastname: apellido.value,
      email: correo.value,
      phone: telefono.value
    };

    const res = await fetch("/auth/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados),
      credentials: "include"
    });

    if (res.ok) {
      alert(" Perfil actualizado correctamente");
      location.reload();
    } else {
      alert(" Error al actualizar el perfil");
    }
  });
});
