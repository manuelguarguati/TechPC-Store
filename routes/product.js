const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Obtener todos los productos (para el home)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Agregar producto (solo admin)
router.post('/add', async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;
    const product = await Product.create({ name, description, price, stock, image });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

module.exports = router;
