// --------------------------------------------------------------
// routes/main.js — Rutas principales de páginas públicas y carrito
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

// 🛒 Rutas del carrito
router.get('/carrito', mainController.carrito);              // ver carrito
router.post('/carrito/finalizar', mainController.finalizarCompra);  // finalizar compra
// POST /carrito/agregar
router.post('/carrito/agregar', mainController.agregarAlCarrito);
router.get("/carrito/session", mainController.miniCarrito);


module.exports = router;
