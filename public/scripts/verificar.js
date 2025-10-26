document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("otpForm");
  const inputs = Array.from(document.querySelectorAll(".code-input"));
  const msg = document.getElementById("msg");

  inputs.forEach((input, idx) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value.length === 1 && idx < inputs.length - 1) inputs[idx + 1].focus();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && idx > 0) inputs[idx - 1].focus();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = inputs.map(i => i.value).join("").trim();
    if (code.length !== 6) {
      msg.textContent = "⚠️ Introduce los 6 dígitos del código de verificación.";
      msg.style.color = "#ff5252";
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando...";

    try {
      const phone = sessionStorage.getItem("registeredPhone");

      const res = await fetch("/auth/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: code, phone })
      });

      const data = await res.json();
      if (data.success) {
        msg.textContent = "✅ Verificado correctamente. Redirigiendo...";
        msg.style.color = "#00e676";
        setTimeout(() => window.location.href = "/login", 1000);
      } else {
        msg.textContent = data.message || "❌ Código incorrecto o expirado.";
        msg.style.color = "#ff5252";
      }
    } catch (err) {
      console.error("Error al verificar:", err);
      msg.textContent = "🚫 Error de conexión con el servidor.";
      msg.style.color = "#ff5252";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Verificar código";
    }
  });
});
