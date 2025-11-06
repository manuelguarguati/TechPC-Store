// ------------------------------------------------------------
// 🚦 routes/pedidos.js
// ------------------------------------------------------------
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// ✅ Crear pedido (usuario)
router.post('/crear', pedidoController.crearPedido);

// ✅ Obtener pedidos del usuario logueado
router.get('/mis-pedidos', pedidoController.misPedidos);

// ✅ Obtener todos los pedidos (admin)
router.get('/admin', pedidoController.todosLosPedidos);

// ✅ Actualizar estado del pedido (admin)
router.put('/admin/:id', pedidoController.actualizarEstado);

module.exports = router;
