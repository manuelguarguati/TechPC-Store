document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("otpForm");
  const inputs = Array.from(document.querySelectorAll(".code-input"));
  const msg = document.getElementById("msg");

  // Auto-focus y limpiar caracteres no numéricos
  inputs.forEach((input, i) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
      if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0) inputs[i - 1].focus();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const codigo = inputs.map(i => i.value).join("");
    const email = sessionStorage.getItem("registeredEmail");

    console.log("👉 Código ingresado:", codigo);
    console.log("👉 Correo obtenido del sessionStorage:", email);

    if (codigo.length !== 6) {
      msg.textContent = "Introduce los 6 dígitos";
      msg.style.color = "red";
      return;
    }

    if (!email) {
      msg.textContent = "Correo no encontrado";
      msg.style.color = "red";
      console.warn("⚠️ No se encontró 'registeredEmail' en sessionStorage");
      return;
    }

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Verificando...";

    try {
      console.log("📤 Enviando solicitud a /auth/verificar-codigo...");
      const res = await fetch("/auth/verificar-codigo", { // ✅ ruta corregida
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codigo })
      });

      console.log("📥 Respuesta cruda del servidor:", res);

      const data = await res.json();
      console.log("📦 Respuesta JSON recibida:", data);

      if (data.success) {
        msg.textContent = "✅ Verificación exitosa";
        msg.style.color = "green";
        console.log("🎉 Usuario verificado correctamente.");
        setTimeout(() => window.location.href = "/login", 1500);
      } else {
        msg.textContent = data.message;
        msg.style.color = "red";
        console.warn("⚠️ Mensaje del servidor:", data.message);
      }

    } catch (err) {
      console.error("💥 Error durante la verificación:", err);
      msg.textContent = "Error del servidor";
      msg.style.color = "red";
    } finally {
      btn.disabled = false;
      btn.textContent = "Verificar";
    }
  });
});
