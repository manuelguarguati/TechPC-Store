// --------------------------------------------------------------
// routes/main.js — Rutas principales de páginas públicas
// --------------------------------------------------------------
const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// 🌐 Rutas públicas HTML
router.get('/', mainController.home);
router.get('/home', mainController.home);
router.get('/login', mainController.login);
router.get('/registro', mainController.registro);
router.get('/verificar', mainController.verificar);
router.get('/perfil', mainController.perfil);
router.get('/cambiar-password', mainController.cambiarPassword);
router.get('/admin', mainController.admin);
router.get('/carrito', mainController.carrito);
router.get('/producto/:id', mainController.detalleProducto);


module.exports = router;
