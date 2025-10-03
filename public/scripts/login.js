document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('usuario').value.trim();
    const password = document.getElementById('clave').value;

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        // Guardar en sessionStorage si quieres mostrar algo en home
        sessionStorage.setItem('showPassword', password);
        window.location.href = data.redirect || '/home';
      }
    } catch (err) {
      console.error('Error login:', err);
      alert('Error de conexión');
    }
  });
});

///7
window.handleCredentialResponse = async (response) => {
  try {
    // Token de Google JWT (ID Token)
    const id_token = response.credential;

    // Lo enviamos al backend para validarlo
    const res = await fetch('/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
      credentials: 'include'
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      alert('Inicio de sesión con Google correcto ');
      window.location.href = data.redirect || '/home';
    }
  } catch (err) {
    console.error('Error Google login:', err);
    alert('Error iniciando sesión con Google');
  }
};
