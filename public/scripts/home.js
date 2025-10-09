// --------------------------------------------------------------
// home.js — Carga de productos y gestión del usuario
// --------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // ----------------------------------------------------
  // 🔹 1. ELEMENTOS DEL DOM
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // 🔹 2. VERIFICAR SESIÓN DEL USUARIO
  // ----------------------------------------------------
  try {
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      // ✅ Usuario autenticado
      nombreSpan.textContent = data.name || "Usuario";
      correoSpan.textContent = data.email || "correo@correo.com";
      nombreBienvenida.textContent = data.name || "Usuario";

      // Ocultar botones de login y registro
      loginLink.style.display = "none";
      registroLink.style.display = "none";
    } else {
      // 🚫 Visitante (no autenticado)
      nombreSpan.textContent = "Visitante";
      correoSpan.textContent = "";
      nombreBienvenida.textContent = "Visitante";
      logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("❌ Error al obtener la sesión:", err);
  }

  // ----------------------------------------------------
  // 🔹 3. MENÚ DESPLEGABLE DE USUARIO
  // ----------------------------------------------------
  usuarioBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuUsuario.classList.toggle("mostrar");
  });

  window.addEventListener("click", (e) => {
    if (!menuUsuario.contains(e.target) && !usuarioBtn.contains(e.target)) {
      menuUsuario.classList.remove("mostrar");
    }
  });

  // ----------------------------------------------------
  // 🔹 4. ACCIONES DEL MENÚ
  // ----------------------------------------------------
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  });

  verPerfilBtn.addEventListener("click", () => {
    window.location.href = "/perfil";
  });

  cambiarPassBtn.addEventListener("click", () => {
    window.location.href = "/cambiar-password";
  });

  // ----------------------------------------------------
  // 🔹 5. CARGAR PRODUCTOS DINÁMICAMENTE
  // ----------------------------------------------------
  async function cargarProductos() {
    try {
      const res = await fetch("/api/products");
      const productos = await res.json();

      const contenedor = document.getElementById("lista-productos");
      if (!contenedor) return;

      contenedor.innerHTML = "";

      if (!productos.length) {
        contenedor.innerHTML = "<p>No hay productos disponibles por ahora.</p>";
        return;
      }

      productos.forEach((p) => {
        const div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
          <img src="${p.image_url || '/img/default.png'}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>${p.description || 'Sin descripción disponible'}</p>
          <div class="precio">$${parseFloat(p.price).toLocaleString()}</div>
          <button class="btn-agregar">Añadir al carrito 🛒</button>
        `;
        contenedor.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Error al cargar los productos:", err);
    }
  }

  cargarProductos();
});
