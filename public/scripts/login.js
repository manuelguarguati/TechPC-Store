// --------------------------------------------------------------
// login.js — Manejo del login normal y login con Google
// --------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');
  const msgBox = document.getElementById('loginMessage');

  const showMessage = (text, success = false) => {
    msgBox.textContent = text;
    msgBox.style.display = 'block';
    msgBox.style.background = success ? '#28a745' : '#dc3545';
    msgBox.style.color = '#fff';
    msgBox.style.padding = '10px';
    msgBox.style.borderRadius = '6px';
    msgBox.style.marginTop = '10px';
    msgBox.style.fontWeight = '600';
    msgBox.style.transition = 'opacity 0.3s ease';
  };

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
        showMessage(data.message, data.success);

        // Redirigir si hay URL
        if (data.success && data.redirect) {
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 1200);
        }

      } catch (err) {
        console.error('Error en login:', err);
        showMessage('Error de conexión con el servidor', false);
      }
    });
  }
});

// --------------------------------------------------------------
// LOGIN CON GOOGLE
// --------------------------------------------------------------
window.handleCredentialResponse = async (response) => {
  try {
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
      credentials: 'include'
    });

    const data = await res.json();
    console.log('Respuesta Google login:', data);

    if (data.success) {
      window.location.href = data.redirect || '/home';
    } else {
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
