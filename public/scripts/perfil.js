// --------------------------------------------------------------
// PERFIL Y CIERRE DE SESIÓN
// --------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const nombreSpan = document.getElementById("nombre-usuario");
  const correoSpan = document.getElementById("correo-usuario");
  const nombreBienvenida = document.getElementById("nombre-bienvenida");
  const loginLink = document.getElementById("login-link");
  const registroLink = document.getElementById("registro-link");
  const logoutBtn = document.getElementById("logout-btn");
  const verPerfilBtn = document.getElementById("ver-perfil");
  const cambiarPassBtn = document.getElementById("cambiar-pass");

  try {
    //  Verificar sesión
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      nombreSpan.textContent = data.name || "Usuario";
      correoSpan.textContent = data.email || "correo@correo.com";
      nombreBienvenida.textContent = data.name || "Usuario";
      loginLink.style.display = "none";
      registroLink.style.display = "none";
    } else {
      nombreSpan.textContent = "Visitante";
      correoSpan.textContent = "";
      nombreBienvenida.textContent = "Visitante";
      logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Error al obtener la sesión:", err);
  }

  // Menú desplegable
  document.getElementById("usuario-btn").addEventListener("click", () => {
    document.getElementById("menu-usuario").classList.toggle("mostrar");
  });

  // Cerrar menú al hacer clic fuera
  window.addEventListener("click", (e) => {
    const menu = document.getElementById("menu-usuario");
    const boton = document.getElementById("usuario-btn");
    if (!menu.contains(e.target) && !boton.contains(e.target)) {
      menu.classList.remove("mostrar");
    }
  });

  // 🚪 CERRAR SESIÓN — cambiado a POST
  logoutBtn.addEventListener("click", async () => {
    const res = await fetch("/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    if (res.ok) {
      alert("Sesión cerrada correctamente");
      location.href = "/login";
    }
  });

  // Ver perfil 
  verPerfilBtn.addEventListener("click", () => {
    window.location.href = "/perfil";
  });

  // Cambiar contraseña 
  cambiarPassBtn.addEventListener("click", () => {
    window.location.href = "/cambiar-password";
  });
});
