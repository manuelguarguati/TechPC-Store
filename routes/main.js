const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');


// Páginas públicas
router.get('/', mainController.home);
router.get('/home', mainController.home);
router.get('/login', mainController.login);
router.get('/registro', mainController.registro);
router.get('/verificar', mainController.verificar);
router.get('/cambiar-password', mainController.cambiarPassword);
router.get('/perfil', mainController.perfil);
router.get('/admin', mainController.admin);
router.get('/completar-registro', mainController.completarRegistro);

// Detalle de producto
router.get('/producto/:id', mainController.detalleProducto);
router.get('/subir-producto', mainController.subirProducto);

// Carrito
router.get('/carrito', mainController.carrito);
router.post('/carrito/finalizar', mainController.finalizarCompra);
router.post('/carrito/agregar', mainController.agregarAlCarrito);
router.get('/carrito/session', mainController.miniCarrito);
router.post('/carrito/eliminar', mainController.eliminarDelCarrito);

// Términos y condiciones
router.get('/terminos', mainController.terminos);



module.exports = router;
