// ======================================================================
// 📦 PANEL DE ADMINISTRACIÓN — admin.js
// ======================================================================
// Este script controla toda la lógica del panel de administración:
// - Verifica que el usuario sea admin
// - Carga lista de usuarios y productos
// - Permite agregar y eliminar productos/usuarios
// ======================================================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // ---------------------------------------------------------------
    // 🔒 1️⃣ Verificar sesión y rol de administrador
    // ---------------------------------------------------------------
    const sessionRes = await fetch('/auth/session', { credentials: 'include' });
    const sessionData = await sessionRes.json();

    if (!sessionData.loggedIn || sessionData.role !== 'admin') {
      alert('Acceso restringido. Solo para administradores.');
      window.location.href = '/home';
      return;
    }

    // ---------------------------------------------------------------
    // 👥 2️⃣ Cargar lista de usuarios registrados
    // ---------------------------------------------------------------
    const usuariosRes = await fetch('/api/admin/usuarios', { credentials: 'include' });
    const usuarios = await usuariosRes.json();

    const tbodyUsuarios = document.querySelector('#tablaUsuarios tbody');
    if (tbodyUsuarios) {
      tbodyUsuarios.innerHTML = ''; // Limpiar antes de agregar
      usuarios.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.lastname}</td>
          <td>${user.email}</td>
          <td>${user.phone || '—'}</td>
          <td>${user.role}</td>
          <td>${user.phone_verified ? '✅' : '❌'}</td>
          <td><button class="eliminar" data-id="${user.id}">🗑️</button></td>
        `;
        tbodyUsuarios.appendChild(tr);
      });

      // 🗑️ Eliminar usuario
      tbodyUsuarios.addEventListener('click', async (e) => {
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
              location.reload();
            } else {
              alert('❌ Error al eliminar usuario.');
            }
          }
        }
      });
    }

    // ---------------------------------------------------------------
    // 🛍️ 3️⃣ Cargar lista de productos
    // ---------------------------------------------------------------
    const productosRes = await fetch('/api/admin/products', { credentials: 'include' });
    const productos = await productosRes.json();

    const tbodyProductos = document.querySelector('#tablaProductos tbody');
    if (tbodyProductos) {
      tbodyProductos.innerHTML = '';
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
        tbodyProductos.appendChild(tr);
      });
    }

    // ---------------------------------------------------------------
    // ➕ 4️⃣ Agregar nuevo producto
    // ---------------------------------------------------------------
    const formNuevo = document.getElementById('form-nuevo-producto');
    if (formNuevo) {
      formNuevo.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          name: formNuevo.nombre.value,
          description: formNuevo.descripcion.value,
          price: parseFloat(formNuevo.precio.value),
          stock: parseInt(formNuevo.stock.value),
          image_url: formNuevo.imagen.value, // 🧠 Debe coincidir con el campo del modelo Product
          category: formNuevo.categoria.value
        };

        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include'
        });

        const result = await res.json();
        if (result.success) {
          alert('✅ Producto agregado correctamente');
          location.reload();
        } else {
          alert('❌ Error al agregar producto');
        }
      });
    }

    // ---------------------------------------------------------------
    // 🗑️ 5️⃣ Eliminar producto
    // ---------------------------------------------------------------
    if (tbodyProductos) {
      tbodyProductos.addEventListener('click', async (e) => {
        if (e.target.classList.contains('eliminar-producto')) {
          const id = e.target.dataset.id;
          if (confirm('¿Seguro que deseas eliminar este producto?')) {
            const res = await fetch(`/api/admin/products/${id}`, {
              method: 'DELETE',
              credentials: 'include'
            });

            const result = await res.json();
            if (result.success) {
              alert('✅ Producto eliminado.');
              location.reload();
            } else {
              alert('❌ Error al eliminar producto.');
            }
          }
        }
      });
    }

  } catch (err) {
    console.error('Error en el panel admin:', err);
    alert('Error cargando el panel de administración');
  }
});
