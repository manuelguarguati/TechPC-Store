document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("otpForm");
  const inputs = Array.from(document.querySelectorAll('.code-input'));
  const msg = document.getElementById('msg');

  // auto focus / move to next input
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = inputs.map(i => i.value).join('');
    if (code.length !== 6) {
      msg.textContent = 'Introduce los 6 dígitos';
      return;
    }

    try {
      const res = await fetch('/auth/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: code })
      });

      const data = await res.json();
      msg.textContent = data.message || (data.success ? 'Verificado' : 'Error');

      if (data.success) {
        setTimeout(() => window.location.href = '/login', 1000);
      }
    } catch (err) {
      console.error('Error verificar:', err);
      msg.textContent = 'Error en el servidor';
    }
  });
});
