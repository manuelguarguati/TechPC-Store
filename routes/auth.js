// --------------------------------------------------------------
// routes/auth.js — Registro, login y verificación OTP unificado
// --------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user'); // Modelo Sequelize
const twilio = require('twilio');
const authController = require('../controllers/authController');

const router = express.Router();

// 🟢 Configuración de Twilio (para enviar SMS)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_FROM_NUMBER;

// 🟢 Cliente OAuth de Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --------------------------------------------------------------
// REGISTRO CON VERIFICACIÓN (POST /auth/registro)
// --------------------------------------------------------------
router.post('/registro', async (req, res) => {
  try {
    const { name, lastname, email, phone, password } = req.body;

    if (!name || !lastname || !email || !phone || !password)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: 'El correo ya está registrado' });

    const codigo = Math.floor(100000 + Math.random() * 900000);

    req.session.tempUser = { name, lastname, email, phone, password, codigo };
    await req.session.save();

    await twilioClient.messages.create({
      from: FROM,
      to: '+57' + phone.replace(/\D/g, ''),
      body: `Tu código de verificación es: ${codigo}`
    });

    res.json({
      success: true,
      message: 'Código enviado al número proporcionado',
      redirect: '/verificar'
    });
  } catch (err) {
    console.error('Error en /auth/registro:', err);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
});

// --------------------------------------------------------------
// LOGIN NORMAL (POST /auth/login)
// --------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    if (!user.password) return res.status(400).json({ error: 'Cuenta de Google sin contraseña local' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    req.session.user = {
      id: user.id,
      name: user.name,
      lastname: user.lastname || '',
      email: user.email,
      phone: user.phone || '',
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

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name || 'Usuario Google';

    let user = await User.findOne({ where: { email: googleEmail } });

    // No existe → completar registro
    if (!user) {
      req.session.tempGoogleUser = { name: googleName, lastname: '', email: googleEmail };
      await req.session.save();

      return res.json({
        success: true,
        message: 'Completa tu registro agregando teléfono y contraseña',
        redirect: '/completar-registro'
      });
    }

    // Existe pero sin teléfono o contraseña
    if (!user.phone || !user.password) {
      req.session.tempGoogleUser = {
        id: user.id,
        name: user.name,
        lastname: user.lastname || '',
        email: user.email
      };
      await req.session.save();

      return res.json({
        success: true,
        message: 'Debes completar tu perfil con teléfono y contraseña',
        redirect: '/completar-registro'
      });
    }

    // Todo correcto → iniciar sesión
    req.session.user = {
      id: user.id,
      name: user.name,
      lastname: user.lastname || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user'
    };

    res.json({
      success: true,
      message: 'Inicio de sesión con Google exitoso',
      redirect: user.role === 'admin' ? '/admin' : '/home'
    });
  } catch (err) {
    console.error('Error en /auth/google-login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión con Google' });
  }
});

// --------------------------------------------------------------
// COMPLETAR REGISTRO GOOGLE (POST /auth/completar-registro)
// --------------------------------------------------------------
router.post('/completar-registro', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!req.session.tempGoogleUser)
      return res.status(400).json({ error: 'Sesión no encontrada' });

    const temp = req.session.tempGoogleUser;
    const codigo = Math.floor(100000 + Math.random() * 900000);

    temp.phone = phone;
    temp.password = password;
    temp.codigo = codigo;
    await req.session.save();

    await twilioClient.messages.create({
      from: FROM,
      to: phone.replace(/\D/g, ''),
      body: `Tu código de verificación es: ${codigo}`
    });

    res.json({ success: true, message: 'Código enviado al número', redirect: '/verificar' });
  } catch (err) {
    console.error('Error en /auth/completar-registro:', err);
    res.status(500).json({ error: 'Error al completar registro con Google' });
  }
});

// --------------------------------------------------------------
// VERIFICAR CÓDIGO (POST /auth/verificar)
// --------------------------------------------------------------
router.post('/verificar', async (req, res) => {
  try {
    const { codigo, phone } = req.body;

    let temp = req.session.tempUser || req.session.tempGoogleUser;
    if (!temp)
      return res.status(400).json({ success: false, message: 'Sesión no encontrada o expirada' });

    if (parseInt(codigo) !== temp.codigo)
      return res.status(400).json({ success: false, message: 'Código incorrecto' });

    const hashedPassword = await bcrypt.hash(temp.password, 10);

    let user = await User.findOne({ where: { email: temp.email } });
    if (user) {
      await user.update({
        phone: temp.phone || phone,
        password: hashedPassword,
        phone_verified: true
      });
    } else {
      user = await User.create({
        name: temp.name,
        lastname: temp.lastname || '',
        email: temp.email,
        phone: temp.phone || phone,
        password: hashedPassword,
        phone_verified: true,
        role: 'user'
      });
    }

    // Guardar sesión completa
    req.session.user = {
      id: user.id,
      name: user.name,
      lastname: user.lastname || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user'
    };

    delete req.session.tempUser;
    delete req.session.tempGoogleUser;

    res.json({ success: true, message: 'Cuenta verificada y completada correctamente' });
  } catch (err) {
    console.error('Error en /auth/verificar:', err);
    res.status(500).json({ success: false, message: 'Error interno al verificar código' });
  }
});

// --------------------------------------------------------------
// SESIÓN ACTUAL (GET /auth/session)
// --------------------------------------------------------------
router.get('/session', (req, res) => {
  if (req.session.user) {
    const { name, lastname, email, phone, role } = req.session.user;
    res.json({ loggedIn: true, name, lastname, email, phone, role });
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
// CAMBIAR CONTRASEÑA
// --------------------------------------------------------------
router.put('/change-password', authController.changePassword);

module.exports = router;
