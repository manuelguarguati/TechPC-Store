document.addEventListener('DOMContentLoaded', () => {
  const formNuevo = document.getElementById('form-nuevo-producto');
  const tablaProductos = document.getElementById('tablaProductos')?.querySelector('tbody');
  const formEditarContainer = document.getElementById('form-editar-producto-container');
  const formEditar = document.getElementById('form-editar-producto');

  //  Subir producto
  if (formNuevo) {
    formNuevo.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(formNuevo);

      try {
        const res = await fetch('/api/products/usuario', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        const data = await res.json();

        if (data.product) {
          alert(' Producto agregado correctamente');
          if (tablaProductos) {
            const tr = document.createElement('tr');
            tr.dataset.id = data.product.id;
            tr.innerHTML = `
              <td>${data.product.id}</td>
              <td>${data.product.name}</td>
              <td class="descripcion">${data.product.description || '—'}</td>
              <td>$${data.product.price}</td>
              <td>${data.product.stock}</td>
              <td>${data.product.image_url ? `<img src="${data.product.image_url}" width="50"/>` : '—'}</td>
              <td>
                <button class="editar">✏️ Editar</button>
                <button class="eliminar">🗑️ Eliminar</button>
              </td>
            `;
            tablaProductos.appendChild(tr);
          }
          formNuevo.reset();
        } else {
          alert(' ' + (data.message || 'Error al subir producto'));
        }
      } catch (err) {
        console.error(err);
        alert(' Error al subir producto');
      }
    });
  }

  // 🗑️ Editar / Eliminar producto
  if (tablaProductos) {
    tablaProductos.addEventListener('click', async e => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const id = tr.dataset.id;

      // Eliminar
      if (e.target.classList.contains('eliminar')) {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
          const res = await fetch(`/api/products/usuario/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const data = await res.json();
          if (data.success) {
            alert('✅ Producto eliminado');
            tr.remove();
          } else alert('❌ ' + (data.message || 'Error al eliminar'));
        } catch (err) { console.error(err); }
      }

      // Editar
      if (e.target.classList.contains('editar')) {
        try {
          const res = await fetch(`/api/products/usuario/${id}`, { credentials: 'include' });
          const product = await res.json();
          document.getElementById('edit-id').value = product.id;
          document.getElementById('edit-nombre').value = product.name;
          document.getElementById('edit-descripcion').value = product.description || '';
          document.getElementById('edit-precio').value = product.price;
          document.getElementById('edit-stock').value = product.stock;
          document.getElementById('edit-image_url_anterior').value = product.image_url || '';
          formEditarContainer.style.display = 'block';
        } catch (err) { console.error(err); }
      }
    });
  }

  //  Guardar edición
  if (formEditar) {
    formEditar.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(formEditar);
      const id = formData.get('id');

      try {
        const res = await fetch(`/api/products/usuario/${id}`, {
          method: 'PUT',
          body: formData,
          credentials: 'include'
        });
        const data = await res.json();
        if (data.product) {
          alert(' Producto actualizado');
          if (tablaProductos) {
            const tr = tablaProductos.querySelector(`tr[data-id="${data.product.id}"]`);
            if (tr) {
              tr.innerHTML = `
                <td>${data.product.id}</td>
                <td>${data.product.name}</td>
                <td class="descripcion">${data.product.description || '—'}</td>
                <td>$${data.product.price}</td>
                <td>${data.product.stock}</td>
                <td>${data.product.image_url ? `<img src="${data.product.image_url}" width="50"/>` : '—'}</td>
                <td>
                  <button class="editar">✏️ Editar</button>
                  <button class="eliminar">🗑️ Eliminar</button>
                </td>
              `;
            }
          }
          formEditarContainer.style.display = 'none';
        } else alert(' ' + (data.message || 'Error al actualizar'));
      } catch (err) {
        console.error(err);
        alert(' Error al actualizar producto');
      }
    });
  }

  // Cancelar edición
  const btnCancelar = document.getElementById('cancelar-edicion');
  if (btnCancelar) btnCancelar.addEventListener('click', () => {
    formEditarContainer.style.display = 'none';
  });
});
