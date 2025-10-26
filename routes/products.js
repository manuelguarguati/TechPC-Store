// routes/products.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/product');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Obtener todos los productos activos (público)
router.get('/', async (req, res) => {
  try {
    const productos = await Product.findAll({ where: { activo: true } });
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Subir producto por usuario normal
router.post('/usuario', upload.single('imagen'), async (req, res) => {
  const usuario = req.session.user;
  if (!usuario) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : '/images/default.png';

    const product = await Product.create({
      name: nombre,
      description: descripcion,
      price: parseFloat(precio),
      stock: parseInt(stock),
      image_url,
      category: 'Usuario',
      activo: true,
      userId: usuario.id
    });

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
