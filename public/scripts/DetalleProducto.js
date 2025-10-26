document.addEventListener("DOMContentLoaded", async () => {
  const agregarBtn = document.getElementById("agregar-carrito");
  const cantidadInput = document.getElementById("cantidad");
  const miniCarritoBtn = document.getElementById("carrito-btn");

  // 1️⃣ Cambiar imagen principal al hacer click en miniatura
  document.querySelectorAll(".miniatura").forEach(m => {
    m.addEventListener("click", () => {
      document.getElementById("img-principal").src = m.src;
    });
  });

  // 2️⃣ Añadir al carrito con validación de stock
  agregarBtn.addEventListener("click", async () => {
    const productId = agregarBtn.dataset.id;
    const cantidad = parseInt(cantidadInput.value);

    if(cantidad < 1 || cantidad > parseInt(cantidadInput.max)){
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
      if(data.success){
        alert("Producto agregado al carrito ✅");
        miniCarritoBtn.textContent = `🛒 (${data.cantidad})`; // Actualiza mini-carrito
      } else {
        alert("No se pudo agregar el producto");
      }
    } catch (err) {
      console.error(err);
      alert("Error al agregar al carrito");
    }
  });

  // 3️⃣ Mostrar productos relacionados
  async function cargarRelacionados() {
    try {
      const res = await fetch("/api/products/relacionados/<%= producto.id %>");
      const productos = await res.json();
      const contenedor = document.getElementById("relacionados");
      contenedor.innerHTML = "";

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
        contenedor.appendChild(div);
      });
    } catch (err) { console.error(err); }
  }
  cargarRelacionados();

  // 4️⃣ Logout
  const logoutBtn = document.getElementById("logout-btn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", async () => {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      window.location.reload();
    });
  }

  // 5️⃣ Barra de búsqueda
  const busqueda = document.getElementById("busqueda");
  busqueda.addEventListener("keypress", e => {
    if(e.key === "Enter" && busqueda.value.trim() !== ""){
      window.location.href = `/search?q=${busqueda.value.trim()}`;
    }
  });
});
