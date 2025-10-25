document.addEventListener('DOMContentLoaded', () => {
  const completarForm = document.getElementById('completarForm');
  const msg = document.getElementById('msg');

  completarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone = document.getElementById('celular').value.trim();
    const password = document.getElementById('contraseña1').value.trim();
    const confirmPassword = document.getElementById('contraseña2').value.trim();

    // Validaciones básicas
    if (!/^\d{10}$/.test(phone)) {
      msg.textContent = 'Número inválido, debe tener 10 dígitos';
      msg.style.color = '#ff4757';
      return;
    }

    if (password.length < 8) {
      msg.textContent = 'La contraseña debe tener al menos 8 caracteres';
      msg.style.color = '#ff4757';
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = 'Las contraseñas no coinciden';
      msg.style.color = '#ff4757';
      return;
    }

    try {
      // Enviar datos al backend
      const res = await fetch('/auth/completar-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();

      if (data.success) {
        // Guardar el número temporalmente en sessionStorage
        sessionStorage.setItem('registeredPhone', phone);

        // Redirigir a la página de verificación
        window.location.href = '/verificar';
      } else {
        msg.textContent = data.message || 'Error al completar registro';
        msg.style.color = '#ff4757';
      }
    } catch (err) {
      msg.textContent = 'Error de conexión';
      msg.style.color = '#ff4757';
      console.error(err);
    }
  });
});
