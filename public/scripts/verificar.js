// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("otpForm"); // formulario principal
  const inputs = Array.from(document.querySelectorAll(".code-input")); // los 6 inputs del código
  const msg = document.getElementById("msg"); // mensaje de estado (éxito/error)

  // 🔹 Autoenfoque y salto automático entre los campos
  inputs.forEach((input, idx) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, ""); // solo números
      if (input.value.length === 1 && idx < inputs.length - 1) {
        inputs[idx + 1].focus(); // ir al siguiente input
      }
    });

    // 🔹 Retroceso para moverse al campo anterior
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  // 🔹 Enviar el código al servidor
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // unir todos los dígitos
    const code = inputs.map((i) => i.value).join("").trim();

    // Validar longitud del código
    if (code.length !== 6) {
      msg.textContent = "⚠️ Introduce los 6 dígitos del código de verificación.";
      msg.style.color = "#ff5252";
      return;
    }

    // Deshabilitar botón mientras se procesa
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando...";

    try {
      // Obtener el número guardado en sessionStorage
      const phone = sessionStorage.getItem("registeredPhone");

      // Enviar código y teléfono al backend
      const res = await fetch("/auth/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: code, phone })
      });

      const data = await res.json();

      // Mostrar mensaje según resultado
      if (data.success) {
        msg.textContent = "✅ Verificado correctamente. Redirigiendo...";
        msg.style.color = "#00e676";

        // Redirigir al login después de 1 segundo
        setTimeout(() => (window.location.href = "/login"), 1000);
      } else {
        msg.textContent = data.message || "❌ Código incorrecto o expirado.";
        msg.style.color = "#ff5252";
      }
    } catch (err) {
      console.error("Error al verificar:", err);
      msg.textContent = "🚫 Error de conexión con el servidor.";
      msg.style.color = "#ff5252";
    } finally {
      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.textContent = "Verificar código";
    }
  });
});
