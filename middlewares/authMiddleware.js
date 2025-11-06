const multer = require('multer');
const path = require('path');

// Middleware para verificar si el usuario tiene rol de administrador
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next(); // ✅ continúa a la siguiente función
  } else {
    res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
};

module.exports = { isAdmin };
