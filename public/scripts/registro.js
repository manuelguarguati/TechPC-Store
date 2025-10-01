document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    let celular = document.getElementById("celular").value.trim();
    const contraseña1 = document.getElementById("contraseña1").value;
    const contraseña2 = document.getElementById("contraseña2").value;

    if (contraseña1 !== contraseña2) {
      alert(" Las contraseñas no coinciden");
      return;
    }

    // Normalizar telefono: si el usuario no puso + o 57, asumimos Colombia
    if (!celular.startsWith("+")) {
      if (/^[0-9]{10}$/.test(celular)) {
        celular = "+57" + celular;
      } else {
        alert(" Ingresa un número válido (10 dígitos) o con código internacional.");
        return;
      }
    }

    const data = {
      name: nombre,
      lastname: apellido,
      email: correo,
      phone: celular,
      password: contraseña1
    };

    try {
      const res = await fetch("/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (result.error) {
        alert("" + result.error);
      } else {
        alert(" " + result.message);
        // guardamos el teléfono en sessionStorage para uso posterior si quieres
        sessionStorage.setItem('registeredPhone', celular);
        window.location.href = result.redirect || '/verificar';
      }
    } catch (err) {
      console.error("Error registrar:", err);
      alert(" Error de conexión con el servidor");
    }
  });
});
