// --------------------------------------------------------------
// controllers/mainController.js
// Controlador principal que renderiza las páginas HTML públicas
// --------------------------------------------------------------

const path = require('path');

const mainController = {
    // Página principal
    home: (req, res) => res.sendFile(path.join(__dirname, '../public/html/home.html')),

    // Autenticación
    login: (req, res) => res.sendFile(path.join(__dirname, '../public/html/login.html')),
    registro: (req, res) => res.sendFile(path.join(__dirname, '../public/html/registro.html')),
    verificar: (req, res) => res.sendFile(path.join(__dirname, '../public/html/verificar.html')),

    // Usuario autenticado
    perfil: (req, res) => res.sendFile(path.join(__dirname, '../public/html/perfil.html')),
    cambiarPassword: (req, res) => res.sendFile(path.join(__dirname, '../public/html/cambiar-password.html')),

    // Panel de administración
    admin: (req, res) => res.sendFile(path.join(__dirname, '../public/html/admin.html')),
};

module.exports = mainController;

exports.home = (req, res) => {
  res.render('home', {
    user: req.session.user || null
  });
};

// 🔐 Página de login
exports.login = (req, res) => {
  // Si ya está logueado, redirigir a home
  if (req.session.user) {
    return res.redirect('/home');
  }
  
  res.render('login', {
    googleClientId: process.env.GOOGLE_CLIENT_ID
  });
};

// 📝 Página de registro
exports.registro = (req, res) => {
  // Si ya está logueado, redirigir a home
  if (req.session.user) {
    return res.redirect('/home');
  }
  
  res.render('registro');
};

// ✅ Página de verificación OTP
exports.verificar = (req, res) => {
  // Podría verificar si hay un registro pendiente
  res.render('verificacion');
};

// 👤 Página de perfil (requiere autenticación)
exports.perfil = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('perfil', {
    user: req.session.user
  });
};

// 🔑 Página de cambiar contraseña (requiere autenticación)
exports.cambiarPassword = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('password', {
    user: req.session.user
  });
};

// 👑 Página de administración (requiere rol admin)
exports.admin = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  if (req.session.user.role !== 'admin') {
    return res.redirect('/home');
  }
  
  res.render('admin', {
    user: req.session.user
  });
};