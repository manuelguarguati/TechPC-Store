// --------------------------------------------------------------
// routes/admin.js — Panel de administración (usuarios y productos)
// --------------------------------------------------------------
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ✅ Importar modelos
const Product = require('../models/Product');
const User = require('../models/User');

// ======================================================
// ⚙️ CONFIGURACIÓN DE MULTER (subida de imágenes)
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// ======================================================
// 🧠 MIDDLEWARE: verificar si el usuario es admin
// ======================================================
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo administradores.' });
  }
};

// ======================================================
// 👥 GESTIÓN DE USUARIOS
// ======================================================

// 🔹 Obtener todos los usuarios
router.get('/usuarios', isAdmin, async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'name', 'lastname', 'email', 'phone', 'role', 'phone_verified'],
      order: [['id', 'ASC']]
    });
    res.json(usuarios);
  } catch (err) {
    console.error('❌ Error obteniendo usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 🔹 Eliminar usuario
router.delete('/usuarios/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error eliminando usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ======================================================
// 🛒 GESTIÓN DE PRODUCTOS
// ======================================================

// 🔹 Obtener todos los productos
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({ where: { activo: true } });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});


// 🔹 Obtener producto por ID
router.get('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error('❌ Error obteniendo producto:', err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// 🔹 Crear producto nuevo
router.post('/products', upload.single('imagen'), isAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : null;

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const product = await Product.create({
      name: nombre,
      description: descripcion,
      price: parseFloat(precio),
      stock: parseInt(stock),
      image_url,
      category: categoria
    });

    res.json({ success: true, product });
  } catch (err) {
    console.error('❌ Error creando producto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// 🔹 Editar producto
router.put('/products/:id', upload.single('imagen'), isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, image_url_anterior } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : image_url_anterior;

    await Product.update(
      { name: nombre, description: descripcion, price: parseFloat(precio), stock: parseInt(stock), image_url, category: categoria },
      { where: { id } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error editando producto:', err);
    res.status(500).json({ error: 'Error al editar producto' });
  }
});

// 🔹 Eliminar producto (soft delete)
router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    await Product.update(
      { activo: false },
      { where: { id: req.params.id } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
