# Retroalimentación - TechPC Store

**Fecha:** 6 de noviembre de 2025  
**Proyecto:** TechPC Store  
**Stack:** Node.js, Express, Sequelize, EJS, HTML, CSS, JavaScript, HTTPS local  

---

## ✅ Puntos fuertes

1. **Estructura modular y organizada**
   - Separación clara de rutas (`routes/`), modelos (`models/`) y scripts frontend (`public/scripts/`).
   - Uso de carpetas para vistas (`views/`) y estilos (`css/`).

2. **Uso adecuado de EJS**
   - Templates dinámicos con `<%= %>` para mostrar información del usuario, productos y carrito.
   - Manejo de condicionales para mostrar botones según el estado de sesión o permisos (`admin`, `usuario`).

3. **Funcionalidades implementadas**
   - Registro, login y recuperación de contraseña.
   - Integración con Google Sign-In y verificación por correo.
   - Gestión de perfil, cambio de contraseña y edición de información.
   - Carrito de compras con cálculo de subtotales y total.
   - CRUD completo para productos, incluyendo subida de imágenes.
   - Checkout de pedidos y tareas automáticas con cron job para expirar pedidos.

4. **Seguridad básica**
   - Uso de `express-session` con `httpOnly` y `sameSite`.
   - HTTPS local configurado para desarrollo seguro.
   - Validaciones mínimas en formularios (email, teléfono, contraseñas).

5. **Frontend consistente**
   - Diseño responsive usando CSS personalizado.
   - Formularios claros y accesibles, con placeholders y labels.
   - Uso de mensajes de feedback (`mensaje` y `error`) en login, registro y recuperación de contraseña.

---

## ⚠️ Áreas de mejora

1. **Seguridad**
   - Las cookies están en `secure: false`, lo cual no es seguro en producción.
   - No se observan limitaciones de intentos de login o protección contra fuerza bruta.
   - No se manejan roles de usuario de manera centralizada (solo condicionales en EJS).

2. **Validaciones**
   - Las contraseñas podrían validarse más fuerte (mínimo una mayúscula, un número, un carácter especial).
   - Falta validación en el backend de los inputs del carrito y productos antes de la inserción en la DB.

3. **Manejo de errores**
   - No hay middleware global para errores 404 o 500.
   - Posibles fallas silenciosas en la conexión con la base de datos o en rutas no existentes.

4. **Optimización y escalabilidad**
   - Servir imágenes directamente desde la carpeta pública podría no ser escalable; considerar almacenamiento en la nube.
   - El cron job expira pedidos cada cierto tiempo, pero no hay logging detallado de las acciones realizadas.

5. **Frontend / UX**
   - Algunos formularios no muestran validaciones en tiempo real (ej. verificar contraseñas coincidentes al escribir).
   - Los botones de eliminar y editar productos podrían tener confirmaciones para evitar errores accidentales.
   - El mini-carrito en el header podría actualizarse dinámicamente sin recargar la página.

---

## 💡 Recomendaciones

1. Implementar **middleware de manejo de errores** y rutas 404 para mejorar la robustez.
2. En producción, activar `secure: true` en cookies y usar HTTPS real con certificados válidos.
3. Mejorar **validaciones del lado del servidor** para entradas de usuario críticas (contraseñas, precios, stock).
4. Agregar **logs y monitoreo** para cron jobs y transacciones de pedidos.
5. Considerar el uso de **AJAX / Fetch API** para actualizar carrito y mini-carrito sin recargar.
6. Añadir pruebas unitarias y de integración para endpoints críticos (login, registro, checkout).

---

## 🌟 Conclusión

El proyecto **TechPC Store** está muy bien estructurado y funcional, cubriendo la mayoría de las funcionalidades esperadas para un e-commerce básico: autenticación, gestión de productos, carrito, checkout y perfiles.  
Las principales mejoras se centran en **seguridad, validaciones y experiencia de usuario**, lo cual permitirá que la aplicación sea más robusta y escalable en producción.

---

