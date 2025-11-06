// public/scripts/recuperar.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const mensajeContainer = document.createElement('p');
  form.prepend(mensajeContainer);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    if (!email) return;

    try {
      const response = await fetch('/recuperar-cuenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        mensajeContainer.style.color = '#4cd137';
        mensajeContainer.textContent = data.message;
      } else {
        mensajeContainer.style.color = '#ff3f3f';
        mensajeContainer.textContent = data.message || 'Error al enviar el enlace';
      }
    } catch (err) {
      console.error(err);
      mensajeContainer.style.color = '#ff3f3f';
      mensajeContainer.textContent = 'Error al conectar con el servidor';
    }
  });
});
