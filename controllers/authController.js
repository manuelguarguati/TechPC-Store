const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authController = {
  changePassword: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'No autorizado' });

    const { actual, nueva } = req.body;
    if (!actual || !nueva) return res.status(400).json({ success: false, message: 'Campos incompletos' });

    try {
      const userDB = await User.findByPk(usuario.id);
      const match = await bcrypt.compare(actual, userDB.password);
      if (!match) return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });

      const hashed = await bcrypt.hash(nueva, 10);
      await User.update({ password: hashed }, { where: { id: usuario.id } });

      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = authController;
