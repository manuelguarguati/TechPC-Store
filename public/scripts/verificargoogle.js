document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("completarForm");
  const msg = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Capturar valores de inputs por id (más seguro)
    const correo = document.getElementById("email").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    let celular = document.getElementById("celular").value.trim();
    const contraseña1 = document.getElementById("contraseña1").value;
    const contraseña2 = document.getElementById("contraseña2").value;

    // Validaciones básicas
    if (!celular || !contraseña1 || !contraseña2) {
      msg.textContent = "⚠️ Todos los campos son obligatorios.";
      msg.style.color = "#ff5252";
      return;
    }

    if (contraseña1 !== contraseña2) {
      msg.textContent = "🔒 Las contraseñas no coinciden.";
      msg.style.color = "#ff5252";
      return;
    }

    if (contraseña1.length < 8) {
      msg.textContent = "🔒 La contraseña debe tener al menos 8 caracteres.";
      msg.style.color = "#ff5252";
      return;
    }

    // Normalizar teléfono
    if (!celular.startsWith("+")) {
      if (/^\d{10}$/.test(celular)) {
        celular = "+57" + celular;
      } else {
        msg.textContent = "📱 Ingresa un número válido (10 dígitos) o con código internacional (+57...).";
        msg.style.color = "#ff5252";
        return;
      }
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const data = { phone: celular, password: contraseña1 };

    try {
      const res = await fetch("/auth/completar-registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"  // ✅ enviar cookies para mantener la sesión
      });

      const result = await res.json();

      if (!result.success) {
        msg.textContent = "❌ " + result.message;
        msg.style.color = "#ff5252";
      } else {
        sessionStorage.setItem("registeredPhone", celular);
        msg.textContent = "✅ Registro completado. Redirigiendo...";
        msg.style.color = "#00e676";
        setTimeout(() => window.location.href = result.redirect || "/home", 1000);
      }
    } catch (err) {
      console.error("Error al enviar datos:", err);
      msg.textContent = "🚫 Error de conexión con el servidor.";
      msg.style.color = "#ff5252";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Continuar";
    }
  });
});
