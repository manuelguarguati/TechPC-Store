// routes/admin.js
const express = require('express');
const router = express.Router();
const { adminController, upload } = require('../controllers/adminController');
const verificarAdmin = require('../middlewares/verificarAdmin'); // middleware de verificación

// Todas las rutas aquí estarán protegidas por verificarAdmin
router.use(verificarAdmin);

// ------------------- DASHBOARD -------------------
router.get('/', adminController.dashboard);

// ------------------- USUARIOS -------------------
router.get('/usuarios', adminController.getUsuarios);
router.delete('/usuarios/:id', adminController.eliminarUsuario);

// ------------------- PRODUCTOS -------------------
router.get('/products', adminController.getProductos);
router.get('/products/:id', adminController.getProductoById);
router.post('/products', upload.single('imagen'), adminController.crearProducto);
router.put('/products/:id', upload.single('imagen'), adminController.editarProducto);
router.delete('/products/:id', adminController.eliminarProducto);

// ------------------- PEDIDOS -------------------
router.get('/pedidos', adminController.getPedidos);
router.put('/pedidos/:id', adminController.actualizarEstadoPedido);

// ------------------- LOGOUT -------------------
router.post('/logout', adminController.logout);

module.exports = router;
