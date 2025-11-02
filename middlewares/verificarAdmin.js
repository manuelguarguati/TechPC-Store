// middlewares/verificarAdmin.js

module.exports = (req, res, next) => {
  try {
    // 1️⃣ Verificar si hay sesión activa
    if (!req.session.user) {
      console.warn('⛔ No hay sesión activa');
      return res.status(401).json({ error: 'No autorizado. Inicia sesión primero.' });
    }

    // 2️⃣ Verificar si el usuario tiene rol de admin
    if (req.session.user.role !== 'admin') {
      console.warn('⛔ Acceso denegado. Rol no autorizado:', req.session.user.role);
      return res.status(403).json({ error: 'Acceso restringido solo para administradores.' });
    }

    // 3️⃣ Todo bien, continúa
    next();

  } catch (error) {
    console.error('❌ Error en middleware verificarAdmin:', error);
    res.status(500).json({ error: 'Error interno en verificación de administrador.' });
  }
};
