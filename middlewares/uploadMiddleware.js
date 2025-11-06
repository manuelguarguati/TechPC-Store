// ======================================================
// 🧰 Middleware para subir imágenes con Multer
// ======================================================
const multer = require('multer');
const path = require('path');

// Configuración de Multer (subida de imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // Carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único con extensión original
  }
});

// Middleware listo para usar
const upload = multer({ storage });

module.exports = upload;
