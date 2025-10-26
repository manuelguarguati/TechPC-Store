const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // importamos Product para consultar la BD

// Middleware para verificar sesión
const isLoggedIn = (req, res, next) => {
  if (req.session.user) next();
  else res.redirect('/login');
};

// GET /subir-producto — mostrar formulario y productos del usuario
router.get('/subir-producto', isLoggedIn, async (req, res) => {
  try {
    const usuario = req.session.user;
    // Traer productos del usuario logueado
    const productos = await Product.findAll({
      where: { userId: usuario.id, activo: true }
    });

    res.render('subir-producto', { 
      titulo: 'Subir Producto',
      usuario,
      productos // ✅ enviamos productos a la vista
    });
  } catch (err) {
    console.error(err);
    res.render('subir-producto', { 
      titulo: 'Subir Producto',
      usuario: req.session.user,
      productos: [] // fallback
    });
  }
});

module.exports = router;
