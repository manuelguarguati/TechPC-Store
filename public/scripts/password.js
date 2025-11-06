document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("guardar-pass").addEventListener("click", async () => {
    const actual = document.getElementById("actual").value;
    const nueva = document.getElementById("nueva").value;
    const confirmar = document.getElementById("confirmar").value;

    if (!actual || !nueva || !confirmar) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (nueva !== confirmar) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }

    try {
      const res = await fetch("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
        credentials: "include"
      });

      const data = await res.json();

      if (data.success) {
        alert("Contraseña cambiada correctamente");
        window.location.href = "/home";
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Error de conexión");
      console.error(err);
    }
  });
});
