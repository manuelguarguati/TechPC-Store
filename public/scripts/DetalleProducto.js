// scripts/DetalleProducto.js
document.addEventListener("DOMContentLoaded", async () => {
  const agregarBtn = document.getElementById("agregar-carrito");
  const cantidadInput = document.getElementById("cantidad");
  const miniCarritoBtn = document.getElementById("carrito-btn");
  const relacionadosContainer = document.getElementById("relacionados");
  const productoId = relacionadosContainer?.dataset.id;

  // Cambiar imagen principal al hacer click en miniatura
  document.querySelectorAll(".miniatura").forEach(m => {
    m.addEventListener("click", () => {
      document.getElementById("img-principal").src = m.src;
    });
  });

  // Función para actualizar stock visible
  async function actualizarStock() {
    try {
      const res = await fetch(`/api/producto/${productoId}/stock`);
      const data = await res.json();
      if (data.stock !== undefined) {
        const stockElement = document.querySelector(".stock");
        stockElement.innerHTML = `<strong>Stock:</strong> ${data.stock}`;
        cantidadInput.max = data.stock;

        if (data.stock === 0) {
          agregarBtn.disabled = true;
          cantidadInput.value = 0;
        } else if (parseInt(cantidadInput.value) > data.stock) {
          cantidadInput.value = data.stock;
        }
      }
    } catch (err) {
      console.error("Error al actualizar stock:", err);
    }
  }

  await actualizarStock();
  setInterval(actualizarStock, 15000); // refresco cada 15 segundos

  // Añadir al carrito con validación de stock
  if (agregarBtn) {
    agregarBtn.addEventListener("click", async () => {
      const productId = agregarBtn.dataset.id;
      const cantidad = parseInt(cantidadInput.value);

      if (cantidad < 1 || cantidad > parseInt(cantidadInput.max)) {
        alert("Cantidad inválida");
        return;
      }

      try {
        const res = await fetch("/carrito/agregar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, cantidad }),
          credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
          alert("Producto agregado al carrito ✅");
          if (miniCarritoBtn) {
            miniCarritoBtn.textContent = `🛒 (${data.cantidad})`;
          }
          await actualizarStock();
        } else {
          alert(data.message || "No se pudo agregar el producto");
        }
      } catch (err) {
        console.error(err);
        alert("Error al agregar al carrito");
      }
    });
  }

  // Cargar productos relacionados
  async function cargarRelacionados() {
    if (!productoId) return;
    try {
      const res = await fetch(`/api/products/relacionados/${productoId}`);
      const productos = await res.json();

      relacionadosContainer.innerHTML = "";

      productos.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("producto-rel");
        div.innerHTML = `
          <img src="${p.image_url || '/img/default.png'}" alt="${p.name}">
          <p>${p.name}</p>
          <p>$${parseFloat(p.price).toLocaleString()}</p>
        `;
        div.addEventListener("click", () => {
          window.location.href = `/producto/${p.id}`;
        });
        relacionadosContainer.appendChild(div);
      });
    } catch (err) {
      console.error(err);
    }
  }
  await cargarRelacionados();

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    });
  }

  // Barra de búsqueda
  const busqueda = document.getElementById("busqueda");
  const buscarBtn = document.getElementById("buscar-btn");

  function realizarBusqueda() {
    const q = busqueda.value.trim();
    if (q !== "") {
      window.location.href = `/search?q=${q}`;
    }
  }

  buscarBtn?.addEventListener("click", realizarBusqueda);
  busqueda?.addEventListener("keypress", e => {
    if (e.key === "Enter") realizarBusqueda();
  });
});
