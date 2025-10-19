// --------------------------------------------------------------
// login.js — Manejo del login normal y login con Google
// --------------------------------------------------------------

// Espera que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');

  if (form) {
    // 📤 Evento al enviar el formulario de login normal
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Evita recargar la página

      // ✉️ Obtenemos los valores del formulario
      const email = document.getElementById('usuario').value.trim();
      const password = document.getElementById('clave').value;

      try {
        // 🔥 Enviamos los datos al backend
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include' // Guarda la cookie de sesión
        });

        const data = await res.json();

        // ⚠️ Si hay error, lo mostramos
        if (data.error) {
          alert(data.error);
        } else if (data.success) {
          alert(data.message);

          // 👑 Si es admin, lo mandamos al panel
          if (data.role === 'admin') {
            window.location.href = '/admin';
          } else {
            // 👤 Usuario normal
            window.location.href = data.redirect || '/home';
          }
        } else {
          alert('Error al iniciar sesión');
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
// Esta función es llamada automáticamente por el botón de Google
// (definido en el HTML con data-callback="handleCredentialResponse")
window.handleCredentialResponse = async (response) => {
  try {
    // 🔑 Token JWT de Google
   const id_token = response.credential; 

    // 🚀 Enviamos el token al backend
    const res = await fetch('/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
      credentials: 'include'
    });

    const data = await res.json();

    // 📢 Resultado
    if (data.error) {
      alert(data.error);
    } else {
      alert('Inicio de sesión con Google exitoso');

      // Redirigir según el rol
      if (data.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = data.redirect || '/home';
      }
    }
  } catch (err) {
    console.error('Error Google login:', err);
    alert('Error iniciando sesión con Google');
  }
};
