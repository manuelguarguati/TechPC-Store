// ======================================================================
// 📦 PANEL DE ADMINISTRACIÓN — admin.js
// ======================================================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // ---------------------------------------------------------------
    // 🔒 1️⃣ Verificar sesión y rol de administrador
    // ---------------------------------------------------------------
    const sessionRoleRes = await fetch('/auth/session-role', { credentials: 'include' });
    const sessionRoleData = await sessionRoleRes.json();

    if (!sessionRoleData.loggedIn || sessionRoleData.role !== 'admin') {
      alert('Acceso restringido. Solo para administradores.');
      window.location.href = '/home';
      return;
    }

    console.log('Bienvenido al panel de admin');

    // ---------------------------------------------------------------
    // 👥 2️⃣ Cargar lista de usuarios
    // ---------------------------------------------------------------
    async function cargarUsuarios() {
      const res = await fetch('/api/admin/usuarios', { credentials: 'include' });
      const usuarios = await res.json();
      const tbody = document.querySelector('#tablaUsuarios tbody');
      tbody.innerHTML = '';

      usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.lastname}</td>
          <td>${u.email}</td>
          <td>${u.phone || '—'}</td>
          <td>${u.role}</td>
          <td>
            <button class="eliminar" data-id="${u.id}">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.addEventListener('click', async e => {
        if (e.target.classList.contains('eliminar')) {
          const id = e.target.dataset.id;
          if (confirm('¿Seguro que deseas eliminar este usuario?')) {
            const res = await fetch(`/api/admin/usuarios/${id}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            const result = await res.json();
            if (result.success) {
              alert('✅ Usuario eliminado.');
              cargarUsuarios();
            } else alert('❌ Error al eliminar usuario.');
          }
        }
      });
    }

    await cargarUsuarios();

    // ---------------------------------------------------------------
    // 🛍️ 3️⃣ Cargar lista de productos
    // ---------------------------------------------------------------
    async function cargarProductos() {
      const res = await fetch('/api/admin/products', { credentials: 'include' });
      const productos = await res.json();
      const tbody = document.querySelector('#tablaProductos tbody');
      tbody.innerHTML = '';

      productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.description || '—'}</td>
          <td>$${p.price}</td>
          <td>${p.stock}</td>
          <td>${p.category || 'General'}</td>
          <td>${p.image_url ? `<img src="${p.image_url}" width="50">` : '—'}</td>
          <td>
            <button class="editar" data-id="${p.id}">✏️</button>
            <button class="eliminar-producto" data-id="${p.id}">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    await cargarProductos();

    // ---------------------------------------------------------------
    // ➕ 4️⃣ Agregar nuevo producto
    // ---------------------------------------------------------------
    const formNuevo = document.getElementById('form-nuevo-producto');
    if (formNuevo) {
      formNuevo.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(formNuevo);
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        const result = await res.json();
        if (result.success) {
          alert('✅ Producto agregado correctamente');
          formNuevo.reset();
          cargarProductos();
        } else alert('❌ Error al agregar producto');
      });
    }

    // ---------------------------------------------------------------
    // 🗑️ 5️⃣ Eliminar y ✏️ Editar producto (delegado)
    // ---------------------------------------------------------------
    const tbodyProductos = document.querySelector('#tablaProductos tbody');
    tbodyProductos.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      if (!id) return;

      // Eliminar producto
      if (e.target.classList.contains('eliminar-producto')) {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const result = await res.json();
          if (result.success) {
            alert('✅ Producto eliminado');
            cargarProductos();
          } else alert('❌ Error al eliminar producto');
        }
      }

      // Editar producto
      if (e.target.classList.contains('editar')) {
        const res = await fetch(`/api/admin/products/${id}`, { credentials: 'include' });
        const p = await res.json();

        document.getElementById('edit-id').value = p.id;
        document.getElementById('edit-nombre').value = p.name;
        document.getElementById('edit-descripcion').value = p.description || '';
        document.getElementById('edit-precio').value = p.price;
        document.getElementById('edit-stock').value = p.stock;
        document.getElementById('edit-categoria').value = p.category || '';
        document.getElementById('edit-image_url_anterior').value = p.image_url;

        document.getElementById('form-editar-producto-container').style.display = 'block';
      }
    });

    // ---------------------------------------------------------------
    // ✏️ 6️⃣ Guardar edición de producto
    // ---------------------------------------------------------------
    const formEditar = document.getElementById('form-editar-producto');
    formEditar.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(formEditar);
      const res = await fetch(`/api/admin/products/${formData.get('id')}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ Producto actualizado');
        document.getElementById('form-editar-producto-container').style.display = 'none';
        cargarProductos();
      } else alert('❌ Error al actualizar producto');
    });

    // ---------------------------------------------------------------
    // ❌ 7️⃣ Cancelar edición
    // ---------------------------------------------------------------
    document.getElementById('cancelar-edicion').addEventListener('click', () => {
      document.getElementById('form-editar-producto-container').style.display = 'none';
    });

    // ---------------------------------------------------------------
    // 🚪 8️⃣ Cerrar sesión
    // ---------------------------------------------------------------
    document.getElementById('logout-admin').addEventListener('click', async e => {
      e.preventDefault();
      try {
        const res = await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
        const result = await res.json();
        if (result.success) window.location.href = '/login';
        else alert('❌ Error al cerrar sesión');
      } catch (err) {
        console.error(err);
        alert('❌ No se pudo cerrar sesión');
      }
    });

    // ---------------------------------------------------------------
    // 📦 9️⃣ Cargar lista de pedidos
    // ---------------------------------------------------------------
    const tbodyPedidos = document.querySelector('#tablaPedidos tbody');
    async function cargarPedidos() {
      const res = await fetch('/api/admin/pedidos', { credentials: 'include' });
      const pedidos = await res.json();
      tbodyPedidos.innerHTML = '';

      pedidos.forEach(p => {
        const fechaCreado = new Date(p.createdAt).toLocaleString();
        const fechaExpira = new Date(p.expiresAt).toLocaleString();
        const estadoClases = {
          pending: 'pendiente',
          paid: 'pagado',
          shipped: 'enviado',
          delivered: 'entregado',
          cancelled: 'cancelado'
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.userId}</td>
          <td>$${p.total}</td>
          <td class="${estadoClases[p.status] || ''}">${p.status}</td>
          <td>${fechaCreado}</td>
          <td>${fechaExpira}</td>
          <td>
            ${p.status === 'pending' ? `<button class="btn-enviar" data-id="${p.id}">Marcar como enviado</button>` : ''}
            ${p.status === 'pending' ? `<button class="btn-cancelar" data-id="${p.id}">Cancelar</button>` : ''}
            <button class="btn-detalle" data-id="${p.id}">Ver detalle</button>
          </td>
        `;
        tbodyPedidos.appendChild(tr);
      });
    }

    await cargarPedidos();

    tbodyPedidos.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      if (!id) return;

      // Marcar como enviado
      if (e.target.classList.contains('btn-enviar')) {
        const res = await fetch(`/api/admin/pedidos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'shipped' }),
          credentials: 'include'
        });
        const result = await res.json();
        if (result.success) {
          alert('✅ Pedido marcado como enviado');
          cargarPedidos();
        }
      }

      // Cancelar pedido
      if (e.target.classList.contains('btn-cancelar')) {
        if (confirm('¿Seguro que deseas cancelar este pedido?')) {
          const res = await fetch(`/api/admin/pedidos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
            credentials: 'include'
          });
          const result = await res.json();
          if (result.success) {
            alert('❌ Pedido cancelado');
            cargarPedidos();
          }
        }
      }

      // Ver detalle
      if (e.target.classList.contains('btn-detalle')) {
        const res = await fetch(`/api/pedidos/${id}`, { credentials: 'include' });
        const detalle = await res.json();
        let info = `Pedido #${id}\n\nProductos:\n`;
        detalle.forEach(d => {
          info += `- Producto ID: ${d.productId} | Cantidad: ${d.cantidad} | Precio: $${d.precio}\n`;
        });
        alert(info);
      }
    });

  } catch (err) {
    console.error('Error en panel admin:', err);
    alert('❌ Error cargando el panel de administración');
  }
});
