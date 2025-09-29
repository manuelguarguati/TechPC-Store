document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/auth/session', {
      credentials: 'include' //  Importante para leer sesión
    });
    const data = await res.json();

    const nombreSpan = document.getElementById('nombre-usuario');
    const correoSpan = document.getElementById('correo-usuario');
    const loginLink = document.getElementById('login-link');
    const registroLink = document.getElementById('registro-link');
    const logoutBtn = document.getElementById('logout-btn');

    if (data.loggedIn) {
      // ✅ Usuario logueado
      if (nombreSpan) nombreSpan.textContent = data.name || '';
      if (correoSpan) correoSpan.textContent = data.email || '';

      // Ocultar login y registro
      loginLink.style.display = 'none';
      registroLink.style.display = 'none';

      // Mostrar botón de cerrar sesión
      logoutBtn.style.display = 'inline-block';
    } else {
      // 👤 Visitante sin sesión
      if (nombreSpan) nombreSpan.textContent = 'Visitante ';
      if (correoSpan) correoSpan.textContent = '';
      logoutBtn.style.display = 'none';
    }

    // Cerrar sesión
    logoutBtn.addEventListener('click', async () => {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
      location.reload(); // recarga la página como visitante
    });

  } catch (err) {
    console.error('Error al obtener la sesión:', err);
  }
});
