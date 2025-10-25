const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Páginas públicas
router.get('/', mainController.home);
router.get('/home', mainController.home);
router.get('/login', mainController.login);
router.get('/registro', mainController.registro);
router.get('/verificar', mainController.verificar);
router.get('/perfil', mainController.perfil); // Render EJS
router.get('/cambiar-password', mainController.cambiarPassword);
router.get('/admin', mainController.admin);
router.get('/completar-registro', mainController.completarRegistro);

// Carrito
router.get('/carrito', mainController.carrito);
router.post('/carrito/finalizar', mainController.finalizarCompra);
router.post('/carrito/agregar', mainController.agregarAlCarrito);
router.get('/carrito/session', mainController.miniCarrito);

// Términos y condiciones
router.get('/terminos', (req, res) => {
  res.render('terminos', { titulo: 'Términos y Condiciones - TechPC Store' });
});

module.exports = router;
