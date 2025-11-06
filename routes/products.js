const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

// Configuración Multer para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware para sesión
const isLoggedIn = (req, res, next) => {
  if (req.session.user) next();
  else res.status(401).json({ success: false, message: 'Debes iniciar sesión' });
};

// ✅ Rutas públicas
router.get('/', productController.obtenerProductos);
router.get('/relacionados/:id', productController.obtenerRelacionados);

// 🧍 Rutas para usuarios normales
router.post('/usuario', isLoggedIn, upload.single('imagen'), productController.crearProductoUsuario);
router.get('/usuario/:id', isLoggedIn, productController.obtenerProductoPorId);
router.put('/usuario/:id', isLoggedIn, upload.single('imagen'), productController.editarProductoUsuario);
router.delete('/usuario/:id', isLoggedIn, productController.eliminarProductoUsuario);

module.exports = router;
