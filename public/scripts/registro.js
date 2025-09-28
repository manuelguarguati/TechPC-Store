async function registrar() {
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const correo = document.getElementById('correo').value;
  const celular = document.getElementById('celular').value;
  const contraseña1 = document.getElementById('contraseña1').value;
  const contraseña2 = document.getElementById('contraseña2').value;

  if (contraseña1 !== contraseña2) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const data = {
    name: nombre,
    lastname: apellido,
    email: correo,
    phone: celular,
    password: contraseña1
  };

  try {
    const response = await fetch('/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.error) {
      alert(result.error);
    } else if (result.redirect) {
      alert(result.message); // "Usuario registrado correctamente"
      window.location.href = result.redirect; // redirige a /login
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    alert('Error de conexión con el servidor');
  }
}
