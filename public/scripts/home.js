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
  const carritoBtn = document.getElementById("carrito-btn");
  const btnPanel = document.getElementById("btn-panel");
  const btnSubirProducto = document.getElementById("btn-subir-producto");

  let usuario = null;
  let miniCarrito = { cantidad: 0 };

  // ===================== 1️⃣ Verificar sesión =====================
  try {
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      usuario = { id: data.id, name: data.name, email: data.email, role: data.role };
      nombreSpan.textContent = data.name;
      correoSpan.textContent = data.email;
      nombreBienvenida.textContent = data.name;

      if (loginLink) loginLink.style.display = "none";
      if (registroLink) registroLink.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";

      await actualizarMiniCarrito();
    } else {
      nombreSpan.textContent = "Visitante";
      nombreBienvenida.textContent = "Visitante";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Error al obtener la sesión:", err);
  }

  // ===================== 2️⃣ Menú de usuario =====================
  if(usuarioBtn && menuUsuario){
    usuarioBtn.addEventListener("click", e => {
      e.stopPropagation();
      menuUsuario.classList.toggle("mostrar");
    });

    window.addEventListener("click", e => {
      if (!menuUsuario.contains(e.target) && !usuarioBtn.contains(e.target)) {
        menuUsuario.classList.remove("mostrar");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/auth/logout", { method: "POST", credentials: "include" });
        window.location.reload();
      } catch (err) { console.error(err); }
    });
  }

  if (verPerfilBtn) verPerfilBtn.addEventListener("click", () => window.location.href = "/perfil");
  if (cambiarPassBtn) cambiarPassBtn.addEventListener("click", () => window.location.href = "/cambiar-password");

  // ===================== 3️⃣ Redirecciones según rol =====================
  if (btnPanel) btnPanel.addEventListener("click", () => window.location.href = "/admin");
  if (btnSubirProducto) btnSubirProducto.addEventListener("click", () => window.location.href = "/subir-producto");

  // ===================== 4️⃣ Cargar productos =====================
  async function cargarProductos() {
    try {
      const res = await fetch("/api/products");
      const productos = await res.json();
      const contenedor = document.getElementById("lista-productos");
      contenedor.innerHTML = "";

      if (!productos || !productos.length) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
      }

      productos.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.style.cursor = "pointer";

        div.innerHTML = `
          <img src="${p.image_url || '/img/default.png'}" alt="${p.name}">
          <h3>${p.name}</h3>
          <div class="precio">$${parseFloat(p.price).toLocaleString()}</div>
          <div class="envio">${p.envio_gratis ? "Envío GRATIS" : "Envío NO gratis"}</div>
        `;

        div.addEventListener("click", () => window.location.href = `/producto/${p.id}`);
        contenedor.appendChild(div);
      });

    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }

  cargarProductos();

  // ===================== 5️⃣ Mini-carrito =====================
  function actualizarContador() {
    if(carritoBtn) carritoBtn.textContent = `🛒 (${miniCarrito.cantidad})`;
  }

  async function actualizarMiniCarrito() {
    try {
      const res = await fetch("/carrito/session", { credentials: "include" });
      const data = await res.json();
      miniCarrito.cantidad = data.cantidad || 0;
      actualizarContador();
    } catch (err) {
      console.error("Error al actualizar mini-carrito:", err);
    }
  }
});
