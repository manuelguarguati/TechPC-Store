// --------------------------------------------------------------
// home.js — Carga de productos, usuario y mini-carrito
// --------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // ELEMENTOS DEL DOM
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

  let miniCarrito = { cantidad: 0 }; // Contador de productos

  // -------------------------------
  // 1. VERIFICAR SESIÓN
  // -------------------------------
  let usuario = null;
  try {
    const res = await fetch("/auth/session", { credentials: "include" });
    const data = await res.json();
    if (data.loggedIn) {
      usuario = { id: data.id, nombre: data.name, correo: data.email };
      nombreSpan.textContent = data.name;
      correoSpan.textContent = data.email;
      nombreBienvenida.textContent = data.name;
      loginLink.style.display = "none";
      registroLink.style.display = "none";
      logoutBtn.style.display = "inline-block";
      await actualizarMiniCarrito();
    } else {
      nombreSpan.textContent = "Visitante";
      nombreBienvenida.textContent = "Visitante";
      logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Error al obtener la sesión:", err);
  }

  // -------------------------------
  // 2. MENÚ DE USUARIO
  // -------------------------------
  usuarioBtn.addEventListener("click", e => {
    e.stopPropagation();
    menuUsuario.classList.toggle("mostrar");
  });

  window.addEventListener("click", e => {
    if (!menuUsuario.contains(e.target) && !usuarioBtn.contains(e.target)) {
      menuUsuario.classList.remove("mostrar");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    } catch (err) { console.error(err); }
  });

  verPerfilBtn.addEventListener("click", () => window.location.href = "/perfil");
  cambiarPassBtn.addEventListener("click", () => window.location.href = "/cambiar-password");

  // -------------------------------
  // 3. CARGAR PRODUCTOS Y BOTONES AGREGAR
  // -------------------------------
  async function cargarProductos() {
    try {
      const res = await fetch("/api/products");
      const productos = await res.json();

      const contenedor = document.getElementById("lista-productos");
      contenedor.innerHTML = "";

      if (!productos.length) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
      }

      productos.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
          <img src="${p.image_url || '/img/default.png'}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>${p.description || 'Sin descripción'}</p>
          <div class="precio">$${parseFloat(p.price).toLocaleString()}</div>
          <button class="btn-agregar" data-id="${p.id}">Añadir al carrito 🛒</button>
        `;
        contenedor.appendChild(div);
      });

      // Botones de agregar
      document.querySelectorAll(".btn-agregar").forEach(btn => {
        btn.addEventListener("click", async e => {
          if (!usuario) return alert("Debes iniciar sesión");
          const productId = e.target.dataset.id;
          await fetch("/carrito/agregar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, cantidad: 1 }),
            credentials: "include"
          });
          miniCarrito.cantidad++;
          actualizarContador();
        });
      });

    } catch (err) { console.error(err); }
  }

  cargarProductos();

  // -------------------------------
  // 4. MINI-CARRITO
  // -------------------------------
  function actualizarContador() {
    carritoBtn.textContent = `🛒 (${miniCarrito.cantidad})`;
  }

  async function actualizarMiniCarrito() {
    try {
      const res = await fetch("/carrito/session", { credentials: "include" });
      const data = await res.json();
      miniCarrito.cantidad = data.cantidad || 0;
      actualizarContador();
    } catch (err) { console.error(err); }
  }

});
