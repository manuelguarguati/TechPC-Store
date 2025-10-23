document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("carrito-contenedor");

    // Función para cargar carrito
    async function cargarCarrito() {
        try {
            const res = await fetch("/carrito", { credentials: "include" });
            const data = await res.json(); // Asegúrate que mainController.carrito devuelva JSON si se usa fetch
            const items = data.items || [];

            contenedor.innerHTML = "";

            if (!items.length) {
                contenedor.innerHTML = "<p>Tu carrito está vacío </p><a href='/home'>Ir a comprar</a>";
                return;
            }

            let total = 0;
            const tabla = document.createElement("table");
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            const tbody = tabla.querySelector("tbody");

            items.forEach(item => {
                const subtotal = item.cantidad * item.Product.price;
                total += subtotal;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <img src="${item.Product.image_url}" alt="${item.Product.name}" width="80">
                        ${item.Product.name}
                    </td>
                    <td>$${item.Product.price.toFixed(2)}</td>
                    <td>${item.cantidad}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button class="eliminar-btn" data-id="${item.id}">Eliminar</button></td>
                `;
                tbody.appendChild(tr);
            });

            contenedor.appendChild(tabla);

            const totalDiv = document.createElement("h2");
            totalDiv.textContent = `Total: $${total.toFixed(2)}`;
            contenedor.appendChild(totalDiv);

            const finalizarBtn = document.createElement("button");
            finalizarBtn.textContent = "Finalizar Compra";
            finalizarBtn.id = "finalizar-btn";
            contenedor.appendChild(finalizarBtn);

            // Eliminar producto
            tbody.querySelectorAll(".eliminar-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const cartId = btn.dataset.id;
                    const res = await fetch("/carrito/eliminar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cartId }),
                    });
                    const data = await res.json();
                    if (data.success) cargarCarrito();
                    else alert(data.message);
                });
            });

            // Finalizar compra
            finalizarBtn.addEventListener("click", async () => {
                const res = await fetch("/carrito/finalizar", { method: "POST", credentials: "include" });
                const data = await res.json();
                if (data.success) {
                    alert(data.message);
                    window.location.href = "/home";
                } else {
                    alert(data.message);
                }
            });

        } catch (err) {
            console.error("Error al cargar el carrito:", err);
        }
    }

    cargarCarrito();
});
