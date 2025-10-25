const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Obtener datos del perfil (GET /api/perfil)
router.get('/', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'No autorizado' });
  res.json({ success: true, usuario: req.session.user });
});

// Actualizar perfil (PUT /api/perfil)
router.put('/actualizar', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'No autorizado' });

  const { name, lastname, phone } = req.body;
  if (!name || !lastname || !phone) return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

  try {
    await User.update(
      { name, lastname, phone },
      { where: { id: req.session.user.id } }
    );

    req.session.user.name = name;
    req.session.user.lastname = lastname;
    req.session.user.phone = phone;

    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ success: false, message: 'Error interno al actualizar perfil' });
  }
});

module.exports = router;
