// routes/main.js
const express = require('express');
const router = express.Router();
const main = require('../controllers/mainController');

// 🏠 Páginas principales
router.get('/', main.home);
router.get('/home', main.home);
router.get('/login', main.login);
router.get('/registro', main.registro);
router.get('/verificar', main.verificar);
router.get('/perfil', main.perfil);
router.get('/cambiar-password', main.cambiarPassword);
router.get('/admin', main.admin);

// 🛒 Carrito
router.get('/carrito', main.carrito);
router.get('/carrito/session', main.carritoSession);
router.post('/carrito/agregar', main.agregarAlCarrito);
router.post('/carrito/eliminar', main.eliminarDelCarrito);
router.post('/finalizar-compra', main.finalizarCompra);

// 🧩 Productos
router.get('/producto/:id', main.detalleProducto);
router.get('/subir-producto', main.subirProducto);
router.post('/subir-producto', main.subirProductoPost);
router.get('/api/producto/:id/stock', main.getStock);

// 📄 Otras vistas
router.get('/terminos', main.terminos);
router.get('/completar', main.completarRegistroView);

// ⚙️ Perfil
router.post('/perfil/guardar', main.guardarPerfil);

module.exports = router;
