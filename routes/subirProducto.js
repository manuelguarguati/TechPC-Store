// routes/subirproducto.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Middleware para verificar sesión
const isLoggedIn = (req, res, next) => {
  if (req.session.user) next();
  else res.status(401).json({ success: false, message: 'Debes iniciar sesión' });
};

// Configuración Multer (carpeta public/images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ POST: Crear producto
router.post('/usuario', isLoggedIn, upload.single('imagen'), async (req, res) => {
  try {
    const usuario = req.session.user;
    const { nombre, descripcion, precio, stock, categoria_id } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : '/images/default.png';

    const nuevoProducto = await Product.create({
      name: nombre,
      description: descripcion,
      price: parseFloat(precio),
      stock: parseInt(stock),
      image_url,
      category_id: categoria_id || null,
      userId: usuario.id,
      activo: true
    });

    res.json({ success: true, product: nuevoProducto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
});

// ✅ GET: Obtener producto por ID (solo usuario dueño)
router.get('/usuario/:id', isLoggedIn, async (req, res) => {
  try {
    const producto = await Product.findOne({
      where: { id: req.params.id, userId: req.session.user.id }
    });
    if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado o no autorizado' });
    res.json(producto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// ✅ PUT: Actualizar producto
router.put('/usuario/:id', isLoggedIn, upload.single('imagen'), async (req, res) => {
  try {
    const producto = await Product.findOne({
      where: { id: req.params.id, userId: req.session.user.id }
    });
    if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado o no autorizado' });

    const { nombre, descripcion, precio, stock, image_url_anterior, categoria_id } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : image_url_anterior;

    await producto.update({
      name: nombre,
      description: descripcion,
      price: parseFloat(precio),
      stock: parseInt(stock),
      image_url,
      category_id: categoria_id || producto.category_id
    });

    res.json({ success: true, product: producto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
});

// ✅ DELETE: Eliminar producto
router.delete('/usuario/:id', isLoggedIn, async (req, res) => {
  try {
    const producto = await Product.findOne({
      where: { id: req.params.id, userId: req.session.user.id }
    });
    if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado o no autorizado' });

    await producto.destroy();
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
});

module.exports = router;
