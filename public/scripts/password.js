document.getElementById("guardar-pass").addEventListener("click", async () => {
  const actual = document.getElementById("actual").value;
  const nueva = document.getElementById("nueva").value;
  const confirmar = document.getElementById("confirmar").value;

  if (!actual || !nueva || !confirmar) {
    alert(" Todos los campos son obligatorios");
    return;
  }

  if (nueva !== confirmar) {
    alert(" Las contraseñas nuevas no coinciden");
    return;
  }

  const res = await fetch("/auth/change-password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actual, nueva }),
    credentials: "include"
  });

  if (res.ok) {
    alert(" Contraseña cambiada correctamente");
    window.location.href = "/home";
  } else {
    const error = await res.text();
    alert(" Error: " + error);
  }
});
