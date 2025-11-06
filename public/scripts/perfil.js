document.addEventListener('DOMContentLoaded', () => {
  const editarBtn = document.getElementById('editar-btn');
  const guardarBtn = document.getElementById('guardar-btn');
  const nombreInput = document.getElementById('nombre');
  const apellidoInput = document.getElementById('apellido');
  const telefonoInput = document.getElementById('telefono');

  editarBtn.addEventListener('click', () => {
    nombreInput.removeAttribute('readonly');
    apellidoInput.removeAttribute('readonly');
    telefonoInput.removeAttribute('readonly');
    editarBtn.style.display = 'none';
    guardarBtn.style.display = 'inline-block';
  });

  guardarBtn.addEventListener('click', async () => {
    const data = {
      name: nombreInput.value,
      lastname: apellidoInput.value,
      phone: telefonoInput.value
    };

    try {
      const res = await fetch('/api/perfil/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await res.json();
      if (result.success) {
        alert('Perfil actualizado correctamente');
        nombreInput.setAttribute('readonly', true);
        apellidoInput.setAttribute('readonly', true);
        telefonoInput.setAttribute('readonly', true);
        editarBtn.style.display = 'inline-block';
        guardarBtn.style.display = 'none';
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error de conexión al actualizar perfil');
      console.error(err);
    }
  });
});
