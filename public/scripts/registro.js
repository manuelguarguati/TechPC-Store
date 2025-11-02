document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const pass1 = document.getElementById("contraseña1").value;
    const pass2 = document.getElementById("contraseña2").value;

    if (!nombre || !apellido || !correo || !celular || !pass1 || !pass2) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    if (pass1 !== pass2) {
      alert("❌ Las contraseñas no coinciden.");
      return;
    }

    const data = { name: nombre, lastname: apellido, email: correo, phone: celular, password: pass1 };

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Creando cuenta...";

    try {
      const res = await fetch("/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.error) {
        alert(result.error);
      } else {
        alert("✅ Cuenta creada. Te enviamos un código de verificación al correo.");
        sessionStorage.setItem("registeredEmail", correo);
        window.location.href = "/verificar";
      }
    } catch (err) {
      console.error(err);
      alert("🚫 Error de conexión con el servidor.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Crear cuenta";
    }
  });
});
