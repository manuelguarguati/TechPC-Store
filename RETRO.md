🧩 Proyecto TechPC Store — Retro y Evaluación Técnica
📝 Resumen General
El proyecto TechPC Store es una aplicación web desarrollada con Node.js, Express y EJS, orientada a la venta y gestión de productos tecnológicos.
Incluye módulos de autenticación, gestión de usuarios, vistas dinámicas, y manejo de productos públicos.

⚙️ Estructura y Componentes Principales
1. Servidor principal (app.js)
Configura Express, EJS y sesiones.
Usa HTTPS con certificados locales (key.pem, cert.pem).
Define middlewares para JSON, formularios y archivos estáticos.
Enruta hacia módulos específicos:
/ → rutas principales (main)
/auth → autenticación
/api/admin → panel administrador
/api/products → productos públicos
📌 Fortalezas:

Buena separación de responsabilidades.
Uso correcto de variables de entorno y sesiones.
Implementación segura de HTTPS local.
🔧 Oportunidades de mejora:

Centralizar configuración de sesión y seguridad.
Permitir ejecución en modo HTTP (útil para desarrollo sin certificados).
Agregar control de errores global.
2. Rutas
/routes/products.js
Devuelve todos los productos desde el modelo Product.
Endpoint público, sin necesidad de autenticación.
✅ Fortalezas:

Endpoint simple y claro.
Uso correcto de async/await y manejo de errores.
⚠️ Oportunidad:

Actualmente depende de la base de datos (Product.findAll()).
Si se migra a JSON, se requerirá un módulo de lectura/escritura con fs.
3. Vistas (EJS)
🧍 perfil.ejs
Muestra datos del usuario autenticado.
Permite alternar entre modo lectura y edición.
🔐 password.ejs
Formulario para cambiar la contraseña.
Validaciones en cliente mediante password.js.
🧾 registro.ejs
Formulario limpio y moderno para crear cuenta.
Sección de aceptación de términos.
🔑 login.ejs
Manejo de login por correo/contraseña.
Integración con Google Identity Services para autenticación OAuth.
🛒 productos.ejs
Listado dinámico de productos.
Permite agregar al carrito mediante JS (cart.js).
✅ Fortalezas:

Diseño consistente entre vistas.
Uso correcto de plantillas EJS.
Separación limpia entre lógica del cliente y servidor.
⚠️ Oportunidades:

Falta layout global (encabezado y pie comunes).
No hay validaciones visuales ni retroalimentación de error en formularios.
No se indica estado del usuario (logeado/no logeado) en las vistas.
4. Front-end Scripts
login.js, registro.js, perfil.js, password.js y cart.js administran la lógica de interacción en cliente.
Se usan fetch() y addEventListener correctamente para peticiones y manejo de formularios.
✅ Fortalezas:

Código limpio, moderno y modular.
Se evita el uso de librerías externas innecesarias.