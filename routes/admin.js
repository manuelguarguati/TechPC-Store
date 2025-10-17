// --------------------------------------------------------------
// routes/admin.js
// Panel de administración para gestionar usuarios y productos
// --------------------------------------------------------------
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ✅ Importar modelos individuales correctamente
const Product = require('../models/product'); // Modelo de productos
const User = require('../models/user');       // Modelo de usuarios (asegúrate de tenerlo)

// 🧠 Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// --------------------------------------------------------------
// 🧠 Middleware: validar que el usuario logueado sea administrador
// --------------------------------------------------------------
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acceso no autorizado. Solo para administradores.' });
  }
};

// ======================================================
// 👥 GESTIÓN DE USUARIOS
// ======================================================

// Obtener todos los usuarios
router.get('/usuarios', isAdmin, async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'name', 'lastname', 'email', 'phone', 'role', 'phone_verified'],
      order: [['id', 'ASC']]
    });
    res.json(usuarios);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// ======================================================
// 🛒 GESTIÓN DE PRODUCTOS
// ======================================================

// Obtener todos los productos
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
router.get('/products/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error obteniendo producto:', err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear nuevo producto
router.post('/products', upload.single('imagen'), isAdmin, async (req, res) => {
  try {
    console.log('Cuerpo de la solicitud:', req.body);
    console.log('Archivo subido:', req.file);

    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const image_url = req.file ? `/images/${req.file.filename}` : null;

    // 🧩 Verificación básica
    if (!nombre || !precio) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const product = await Product.create({ 
      name: nombre,           // ✅ Mapear a "name"
      description: descripcion, // ✅ Mapear a "description"
      price: parseFloat(precio), 
      stock: parseInt(stock), 
      image_url, 
      category: categoria     // ✅ Mapear a "category"
    });

    res.json({ success: true, product });
  } catch (err) {
    console.error('Error creando producto:', err);
    res.status(500).json({ 
      error: 'Error al crear producto', 
      details: err.message,
      stack: err.stack
    });
  }
});

// Editar producto existente
router.put('/products/:id', upload.single('imagen'), isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, image_url_anterior } = req.body;

    // Si se subió una nueva imagen, usamos su ruta; si no, mantenemos la anterior
    const image_url = req.file ? `/images/${req.file.filename}` : image_url_anterior;

    await Product.update({ 
      name: nombre,
      description: descripcion,
      price: parseFloat(precio),
      stock: parseInt(stock),
      image_url,
      category: categoria
    }, { where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error('Error editando producto:', err);
    res.status(500).json({ error: 'Error al editar producto', details: err.message });
  }
});

// Eliminar producto
router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Product.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error eliminando producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;