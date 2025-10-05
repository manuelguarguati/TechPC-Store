// --------------------------------------------------------------
// routes/admin.js
// Panel de administración para gestionar usuarios y productos
// --------------------------------------------------------------
const express = require('express');
const router = express.Router();

// ✅ Importar modelos individuales correctamente
const Product = require('../models/product'); // Modelo de productos
const User = require('../models/user');       // Modelo de usuarios (asegúrate de tenerlo)

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

// Crear nuevo producto
router.post('/products', isAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category } = req.body;

    // 🧩 Verificación básica
    if (!name || !price) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const product = await Product.create({ name, description, price, stock, image_url, category });
    res.json({ success: true, product });
  } catch (err) {
    console.error('Error creando producto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Editar producto existente
router.put('/products/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url, category } = req.body;

    await Product.update({ name, description, price, stock, image_url, category }, { where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error editando producto:', err);
    res.status(500).json({ error: 'Error al editar producto' });
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
