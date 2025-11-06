const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Crear reseña
router.post('/', reviewController.create);

// Listar reseñas por producto
router.get('/:productId', reviewController.list);

// Editar reseña
router.put('/:id', reviewController.update);

// Eliminar reseña
router.delete('/:id', reviewController.delete);

module.exports = router;
