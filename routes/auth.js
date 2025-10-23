// --------------------------------------------------------------
// routes/auth.js — Autenticación y manejo de sesión
// --------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user'); // Modelo Sequelize

const router = express.Router();

// 🟢 Cliente OAuth de Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --------------------------------------------------------------
// LOGIN NORMAL (POST /auth/login)
// --------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    };

    res.json({
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

    // 🔍 Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 📧 Extraer datos del usuario
    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name || 'Usuario Google';

    // 🔍 Buscar o crear usuario en la base de datos
    let user = await User.findOne({ where: { email: googleEmail } });
    if (!user) {
      user = await User.create({
        name: googleName,
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
  if (req.session.user) {
    res.json({
      loggedIn: true,
      ...req.session.user
    });
  } else {
    res.json({ loggedIn: false });
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
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
});

// --------------------------------------------------------------
// CAMBIAR CONTRASEÑA (PUT /auth/change-password)
// --------------------------------------------------------------
router.put('/change-password', async (req, res) => {
  try {
    const { actual, nueva } = req.body;

    // Verificar sesión
    if (!req.session.user) {
      return res.status(401).send('No hay sesión activa');
    }

    // Buscar usuario en la base de datos
    const user = await User.findOne({ where: { id: req.session.user.id } });
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Si el usuario no tiene contraseña (por ejemplo, login con Google)
    if (!user.password) {
      const nuevaHash = await bcrypt.hash(nueva, 10);
      await User.update({ password: nuevaHash }, { where: { id: user.id } });
      return res.status(200).send('Contraseña establecida correctamente');
    }

    // Verificar contraseña actual
    const coincide = await bcrypt.compare(actual, user.password);
    if (!coincide) {
      return res.status(400).send('La contraseña actual es incorrecta');
    }

    // Encriptar nueva contraseña
    const nuevaHash = await bcrypt.hash(nueva, 10);

    // Actualizar en BD
    await User.update({ password: nuevaHash }, { where: { id: user.id } });

    res.status(200).send('Contraseña cambiada correctamente');
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router;
