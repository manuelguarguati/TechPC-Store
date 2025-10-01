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
