// --------------------------------------------------------------
// routes/auth.js — Autenticación y manejo de sesión
// --------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // ✅ Modelo Sequelize de usuario
const router = express.Router();

// --------------------------------------------------------------
// LOGIN NORMAL (POST /auth/login)
// --------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Buscar usuario por correo
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // 🔑 Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    // ⚠️ Verificar si el número está confirmado (opcional)
    if (!user.phone_verified) {
      return res.status(403).json({ error: 'Debes verificar tu número antes de iniciar sesión 📱' });
    }

    // 💾 Guardar datos de sesión
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    };

    // ✅ Enviar respuesta
    return res.json({
      success: true,
      message: 'Inicio de sesión correcto',
      role: user.role,
      redirect: user.role === 'admin' ? '/admin' : '/home'
    });

  } catch (err) {
    console.error('Error en /auth/login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------------------------------------------------------------
// LOGIN CON GOOGLE (POST /auth/google-login)
// --------------------------------------------------------------
router.post('/google-login', async (req, res) => {
  try {
    const { id_token } = req.body;

    // ⚙️ Aquí normalmente se verifica el token de Google.
    // Por ahora, simulamos un correo de usuario de Google:
    const googleEmail = '1009394864655-mtbfugom0ephlheoau1i91osd1bcvl1m.apps.googleusercontent.com';

    // 🔍 Buscar o crear usuario
    let user = await User.findOne({ where: { email: googleEmail } });
    if (!user) {
      user = await User.create({
        name: 'Usuario Google',
        lastname: '',
        email: googleEmail,
        phone: '',
        password: '',
        role: 'user'
      });
    }

    // 💾 Guardar sesión
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Inicio de sesión con Google exitoso',
      role: user.role,
      redirect: user.role === 'admin' ? '/admin' : '/home'
    });

  } catch (err) {
    console.error('Error en /auth/google-login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión con Google' });
  }
});

// --------------------------------------------------------------
// SESIÓN ACTUAL (GET /auth/session)
// --------------------------------------------------------------
router.get('/session', (req, res) => {
  try {
    if (req.session.user) {
      res.json({
        loggedIn: true,
        name: req.session.user.name,
        email: req.session.user.email,
        role: req.session.user.role,
        id: req.session.user.id
      });
    } else {
      res.json({ loggedIn: false });
    }
  } catch (err) {
    console.error('Error en /auth/session:', err);
    res.status(500).json({ error: 'Error obteniendo sesión' });
  }
});

// --------------------------------------------------------------
// LOGOUT (POST /auth/logout)
// --------------------------------------------------------------
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destruyendo sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }

    // ✅ Eliminar cookie de sesión
    res.clearCookie('connect.sid', { path: '/' });
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
});

// --------------------------------------------------------------
// EXPORTACIÓN
// --------------------------------------------------------------
module.exports = router;
