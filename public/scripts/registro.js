// Esperar a que todo el DOM esté cargado antes de ejecutar
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1️⃣ Capturar los valores del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    let celular = document.getElementById("celular").value.trim();
    const contraseña1 = document.getElementById("contraseña1").value;
    const contraseña2 = document.getElementById("contraseña2").value;

    // 2️⃣ Validar campos vacíos antes de continuar
    if (!nombre || !apellido || !correo || !celular || !contraseña1 || !contraseña2) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    // 3️⃣ Validar formato básico de correo electrónico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      alert("📧 Ingresa un correo electrónico válido.");
      return;
    }

    // 4️⃣ Verificar si las contraseñas coinciden
    if (contraseña1 !== contraseña2) {
      alert("🔒 Las contraseñas no coinciden.");
      return;
    }

    // 5️⃣ Validar que la contraseña sea segura
    const regexSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,;:_\-]).{8,}$/;
    const prohibidas = ["12345", "password", "contraseña", "abc123", "qwerty", "admin", "user"];

    if (prohibidas.includes(contraseña1.toLowerCase())) {
      alert("🚫 La contraseña es demasiado común, elige otra más segura.");
      return;
    }

    if (!regexSegura.test(contraseña1)) {
      alert("⚠️ La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.");
      return;
    }

    // 6️⃣ Normalizar teléfono (agregar +57 si no lo tiene)
    if (!celular.startsWith("+")) {
      if (/^[0-9]{10}$/.test(celular)) {
        celular = "+57" + celular;
      } else {
        alert("📱 Ingresa un número válido (10 dígitos) o con código internacional (+57...).");
        return;
      }
    }

    // 7️⃣ Crear objeto con datos listos para enviar
    const data = {
      name: nombre,
      lastname: apellido,
      email: correo,
      phone: celular,
      password: contraseña1
    };

    // 8️⃣ Deshabilitar botón temporalmente mientras se envía
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    try {
      // 9️⃣ Enviar datos al backend (ruta /auth/registro)
      const res = await fetch("/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      // 10️⃣ Mostrar mensajes según respuesta del backend
      if (result.error) {
        alert("❌ " + result.error);
      } else {
        alert("✅ " + result.message);
        // Guardar el teléfono en sessionStorage para uso futuro (por ejemplo, reenviar código)
        sessionStorage.setItem('registeredPhone', celular);
        // Redirigir a la página de verificación
        window.location.href = result.redirect || '/verificar';
      }
    } catch (err) {
      console.error("Error al registrar:", err);
      alert("🚫 Error de conexión con el servidor. Intenta nuevamente.");
    } finally {
      // 🔁 Restaurar el botón siempre
      submitBtn.disabled = false;
      submitBtn.textContent = "Crear cuenta";
    }
  });
});
