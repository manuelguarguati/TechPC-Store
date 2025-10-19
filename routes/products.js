// --------------------------------------------------------------
// routes/products.js — Productos públicos (accesibles sin login)
// --------------------------------------------------------------
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// 🛍️ Obtener todos los productos (sin autenticación)
router.get('/', async (req, res) => {
  try {
    const productos = await Product.findAll(); // Trae todos los productos de la BD
    res.json(productos);
  } catch (err) {
    console.error('❌ Error obteniendo productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

module.exports = router;
