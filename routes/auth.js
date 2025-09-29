require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const User = require('../models/user');

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Normalizar teléfono
function normalizePhone(phone) {
  if (!phone) return null;
  phone = phone.trim();
  if (phone.startsWith('+')) return phone;
  if (/^[0-9]{10}$/.test(phone)) return `+57${phone}`;
  return phone;
}

// REGISTRO
router.post('/registro', async (req, res) => {
  try {
    let { name, lastname, email, phone, password } = req.body;
    phone = normalizePhone(phone);

    if (!name || !lastname || !email || !phone || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      lastname,
      email,
      phone,
      password: hashedPassword,
      phone_verified: false
    });

    // OTP
    const code = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = String(code);
    req.session.phone = phone;
    req.session.lastPlainPassword = password;

    await client.messages.create({
      body: `Tu código de verificación es: ${code}`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone
    });

    return res.json({ redirect: '/verificar', message: 'Usuario registrado. Código enviado por SMS 📲' });
  } catch (err) {
    console.error('Error /auth/registro:', err);
    return res.status(400).json({ error: 'Error al registrar usuario' });
  }
});

// VERIFICAR OTP
router.post('/verificar', async (req, res) => {
  try {
    const { codigo } = req.body;
    const phone = req.session.phone;

    if (!phone || !req.session.otp) {
      return res.status(400).json({ success: false, message: 'No hay código activo. Regístrate nuevamente.' });
    }

    if (String(codigo) === String(req.session.otp)) {
      await User.update({ phone_verified: true }, { where: { phone } });
      delete req.session.otp;
      delete req.session.phone;

      return res.json({ success: true, message: 'Número verificado correctamente' });
    } else {
      return res.status(400).json({ success: false, message: 'Código incorrecto' });
    }
  } catch (err) {
    console.error('Error /auth/verificar:', err);
    return res.status(500).json({ error: 'Error al verificar el código' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    if (!user.phone_verified) {
      return res.status(403).json({ error: 'Verifica tu número antes de iniciar sesión 📱' });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email; //  Guardamos el correo aquí
    req.session.userPlainPassword = password;

    return res.json({ message: 'Inicio de sesión correcto', redirect: '/home' });
  } catch (err) {
    console.error('Error /auth/login:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// SESIÓN
router.get('/session', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      name: req.session.userName,
      email: req.session.userEmail, //  Ahora lo enviamos
      password: req.session.userPlainPassword || null
    });
  } else {
    res.json({ loggedIn: false });
  }
});
// CERRAR SESIÓN
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Sesión cerrada' });
  });
});


module.exports = router;
