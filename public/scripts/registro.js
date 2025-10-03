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

    // 1. Verificar si las contraseñas coinciden
    if (contraseña1 !== contraseña2) {
      alert(" Las contraseñas no coinciden");
      return;
    }

    //  2. Validar que la contraseña sea segura
    const regexSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const prohibidas = ["12345", "password", "contraseña", "abc123", "qwerty"];

    if (prohibidas.includes(contraseña1.toLowerCase())) {
      alert(" La contraseña es demasiado común, elige otra más segura.");
      return;
    }

    if (!regexSegura.test(contraseña1)) {
      alert(" La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.");
      return;
    }

    //  3. Normalizar teléfono (si no tiene +, agregar +57 si son 10 dígitos)
    if (!celular.startsWith("+")) {
      if (/^[0-9]{10}$/.test(celular)) {
        celular = "+57" + celular;
      } else {
        alert("📱 Ingresa un número válido (10 dígitos) o con código internacional.");
        return;
      }
    }

    //  4. Crear objeto con datos del formulario
    const data = {
      name: nombre,
      lastname: apellido,
      email: correo,
      phone: celular,
      password: contraseña1
    };

    //  5. Enviar datos al backend (ruta /auth/registro)
    try {
      const res = await fetch("/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (result.error) {
        alert(" " + result.error);
      } else {
        alert("✅ " + result.message);
        // Guardar el teléfono en sessionStorage para uso futuro
        sessionStorage.setItem('registeredPhone', celular);
        window.location.href = result.redirect || '/verificar';
      }
    } catch (err) {
      console.error("Error registrar:", err);
      alert(" Error de conexión con el servidor");
    }
  });
});
