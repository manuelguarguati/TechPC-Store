document.addEventListener("DOMContentLoaded", async () => {
  const nombreSpan = document.getElementById("nombre-usuario");
  const correoSpan = document.getElementById("correo-usuario");
  const nombreBienvenida = document.getElementById("nombre-bienvenida");
  const loginLink = document.getElementById("login-link");
  const registroLink = document.getElementById("registro-link");
  const logoutBtn = document.getElementById("logout-btn");
  const verPerfilBtn = document.getElementById("ver-perfil");
  const cambiarPassBtn = document.getElementById("cambiar-pass");

  //  Verificar si hay sesión activa
  try {
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      // Usuario logueado
      nombreSpan.textContent = data.name || "Usuario";
      correoSpan.textContent = data.email || "correo@correo.com";
      nombreBienvenida.textContent = data.name || "Usuario";

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
    console.error("Error al obtener la sesión:", err);
  }

  //  Mostrar / ocultar menú al hacer clic
  document.getElementById("usuario-btn").addEventListener("click", () => {
    document.getElementById("menu-usuario").classList.toggle("mostrar");
  });

  //  Cerrar menú si se hace clic fuera
  window.addEventListener("click", (e) => {
    const menu = document.getElementById("menu-usuario");
    const boton = document.getElementById("usuario-btn");
    if (!menu.contains(e.target) && !boton.contains(e.target)) {
      menu.classList.remove("mostrar");
    }
  });

  //  Cerrar sesión
  logoutBtn.addEventListener("click", async () => {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
    location.reload();
  });

  // Ver perfil 
  verPerfilBtn.addEventListener("click", () => {
    window.location.href = "/perfil"; //  perfil.html 
  });

  //  Cambiar contraseña 
  cambiarPassBtn.addEventListener("click", () => {
    window.location.href = "/cambiar-password"; //  cambiar-password.html
  });
});
