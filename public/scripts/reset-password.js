document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const action = form.getAttribute('action');

    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.text(); // recibe el HTML renderizado
      document.open();
      document.write(data);
      document.close();
    } catch (err) {
      console.error('❌ Error al actualizar la contraseña:', err);
      alert('Error al actualizar la contraseña. Intenta de nuevo.');
    }
  });
});
