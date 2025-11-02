// --------------------------------------------------------------
// login.js — Manejo del login normal y login con Google
// --------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('usuario').value.trim();
      const password = document.getElementById('clave').value;

      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        const data = await res.json();

        // Mostrar mensaje
        alert(data.message);

        // Redirigir si hay URL
        if (data.success && data.redirect) {
          window.location.href = data.redirect;
        }

      } catch (err) {
        console.error('Error en login:', err);
        alert('Error de conexión con el servidor');
      }
    });
  }
});

// --------------------------------------------------------------
// LOGIN CON GOOGLE
// --------------------------------------------------------------
window.handleCredentialResponse = async (response) => {
  try {
    // ✅ Validación de response
    if (!response || !response.credential) {
      console.error('⚠️ Google login falló, response inválido:', response);
      alert('No se pudo iniciar sesión con Google. Intenta de nuevo.');
      return;
    }

    const id_token = response.credential;

    const res = await fetch('/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
      credentials: 'include' // importante para mantener sesión
    });

    const data = await res.json();

    // ✅ Debug: ver respuesta del backend
    console.log('Respuesta Google login:', data);

    if (data.success) {
      // Usuario existente → redirige normalmente
      window.location.href = data.redirect || '/home';
    } else {
      // Usuario nuevo → redirige a completar registro
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        alert(data.message || 'Error al iniciar sesión con Google.');
      }
    }

  } catch (err) {
    console.error('Error Google login:', err);
    alert('Error iniciando sesión con Google');
  }
};
