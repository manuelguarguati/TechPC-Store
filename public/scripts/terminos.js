// terminos.js

document.addEventListener("DOMContentLoaded", () => {
  const btnVolver = document.getElementById("btnVolver");

  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      // Leer el parámetro "from" de la URL
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");

      // Redirigir según el origen
      if (from === "google") {
        window.location.href = "/completar";
      } else {
        window.location.href = "/registro";
      }
    });
  }
});
