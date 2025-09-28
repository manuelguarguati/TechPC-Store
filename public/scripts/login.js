async function loguear() {
    const email = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.error) {
            alert(result.error);
        } else if (result.redirect) {
            alert(result.message); // "Inicio de sesión correcto"
            window.location.href = result.redirect;
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor');
    }
}

