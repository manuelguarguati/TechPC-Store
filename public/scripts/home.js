// home.js
document.addEventListener("DOMContentLoaded", async () => {
  // Elementos del DOM
  const nombreSpan = document.getElementById("nombre-usuario");
  const correoSpan = document.getElementById("correo-usuario");
  const nombreBienvenida = document.getElementById("nombre-bienvenida");
  const loginLink = document.getElementById("login-link");
  const registroLink = document.getElementById("registro-link");
  const logoutBtn = document.getElementById("logout-btn");
  const verPerfilBtn = document.getElementById("ver-perfil");
  const cambiarPassBtn = document.getElementById("cambiar-pass");
  const usuarioBtn = document.getElementById("usuario-btn");
  const menuUsuario = document.getElementById("menu-usuario");

  // ===========================
  // 🔹 1. Verificar sesión
  // ===========================
  try {
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      // Usuario autenticado
      nombreSpan.textContent = data.name || "Usuario";
      correoSpan.textContent = data.email || "correo@correo.com";
      nombreBienvenida.textContent = data.name || "Usuario";

      // Ocultar login y registro
      loginLink.style.display = "none";
      registroLink.style.display = "none";
    } else {
      // Visitante
      nombreSpan.textContent = "Visitante";
      correoSpan.textContent = "";
      nombreBienvenida.textContent = "Visitante";
      logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("❌ Error al obtener la sesión:", err);
  }

  // ===========================
  // 🔹 2. Menú desplegable de usuario
  // ===========================
  usuarioBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita cierre inmediato
    menuUsuario.classList.toggle("mostrar");
  });

  // Cerrar menú al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (!menuUsuario.contains(e.target) && !usuarioBtn.contains(e.target)) {
      menuUsuario.classList.remove("mostrar");
    }
  });

  // ===========================
  // 🔹 3. Acciones del menú
  // ===========================

  // Cerrar sesión
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
