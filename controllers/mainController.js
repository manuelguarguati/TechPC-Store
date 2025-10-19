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
