// ======================================================================
//  FRONTEND ADMIN — admin.js (con switch activar/desactivar funcional)
// ======================================================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // ==========================
    // 1️⃣ Verificar sesión admin
    // ==========================
    const sessionRoleRes = await fetch('/auth/session-role', { credentials: 'include' });
    const sessionRoleData = await sessionRoleRes.json();
    if (!sessionRoleData.loggedIn || sessionRoleData.role !== 'admin') {
      alert('Acceso restringido. Solo para administradores.');
      window.location.href = '/home';
      return;
    }
    console.log('Bienvenido al panel de admin');

    // ==========================
    // 2️⃣ Cargar usuarios
    // ==========================
    async function cargarUsuarios() {
      try {
        const res = await fetch('/api/admin/usuarios', { credentials: 'include' });
        const usuarios = await res.json();
        const tbody = document.querySelector('#tablaUsuarios tbody');
        tbody.innerHTML = '';

        usuarios.forEach(u => {
          const verificadoBadge = u.email_verified
            ? '<span class="badge badge-success">Verificado</span>'
            : '<span class="badge badge-danger">No verificado</span>';
          const estadoBadge = u.estadoCuenta
            ? '<span class="badge badge-info">Activo</span>'
            : '<span class="badge badge-warning">Inactivo</span>';
          const googleBadge = u.google_id ? ' <span class="badge badge-google">Google</span>' : '';

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.lastname}</td>
            <td>${u.email}</td>
            <td>${u.phone || '—'}</td>
            <td>${u.role}</td>
            <td>${verificadoBadge}${googleBadge}</td>
            <td>${estadoBadge}</td>
            <td>
              <label class="switch">
                <input type="checkbox" class="toggle-estado" data-id="${u.id}" ${u.estadoCuenta ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
              <button class="eliminar" data-id="${u.id}">🗑️</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('❌ Error cargando usuarios:', err);
        alert('❌ No se pudieron cargar los usuarios.');
      }
    }

    await cargarUsuarios();

    // ==========================
    // 2.1️⃣ Activar / Desactivar usuario
    // ==========================
    document.querySelector('#tablaUsuarios tbody').addEventListener('change', async e => {
      if (e.target.classList.contains('toggle-estado')) {
        const id = e.target.dataset.id;
        const nuevoEstado = e.target.checked ? 1 : 0;

        try {
          const res = await fetch(`/api/admin/usuarios/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estadoCuenta: nuevoEstado }),
            credentials: 'include'
          });

          const result = await res.json();

          if (!res.ok) {
            // ⚠️ Si backend devuelve 403, significa que es admin
            if (res.status === 403) {
              alert(result.error || 'No tienes permiso para desactivar esta cuenta.');
            } else {
              alert(result.error || '❌ Error al actualizar estado de cuenta');
            }

            // 🔁 Restaurar el switch al estado anterior (ya que falló)
            e.target.checked = !nuevoEstado;
            return;
          }

          if (result.success) {
            alert(result.message);
            cargarUsuarios();
          }
        } catch (err) {
          console.error('❌ Error al cambiar estado:', err);
          alert('❌ No se pudo cambiar el estado de la cuenta.');
          e.target.checked = !nuevoEstado;
        }
      }
    });

    // ==========================
    // 🧹 Eliminar usuario
    // ==========================
    document.querySelector('#tablaUsuarios tbody').addEventListener('click', async e => {
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
          } else {
            alert('❌ Error al eliminar usuario.');
          }
        }
      }
    });

    // ==========================
    // 3️⃣ Cargar productos
    // ==========================
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
            <button class="editar" data-id="${p.id}">Editar</button>
            <button class="eliminar-producto" data-id="${p.id}">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    await cargarProductos();

    // ==========================
    // 4️⃣ Agregar producto
    // ==========================
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

    // ==========================
    // 5️⃣ Editar / eliminar producto
    // ==========================
    const tbodyProductos = document.querySelector('#tablaProductos tbody');
    tbodyProductos.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      if (!id) return;

      // Eliminar
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

      // Editar
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

    // ==========================
    // 6️⃣ Guardar edición producto
    // ==========================
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

    document.getElementById('cancelar-edicion').addEventListener('click', () => {
      document.getElementById('form-editar-producto-container').style.display = 'none';
    });

    // ==========================
    // 7️⃣ Logout
    // ==========================
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
  } catch (err) {
    console.error('Error en panel admin:', err);
    alert('❌ Error cargando el panel de administración');
  }
});
