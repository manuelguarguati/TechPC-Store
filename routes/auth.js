// --------------------------------------------------------------
// routes/auth.js — Registro, login y verificación OTP unificado
// --------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Modelo Sequelize
const twilio = require('twilio');
const authController = require('../controllers/authController');
const router = express.Router();

// 🟢 Configuración Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_FROM_NUMBER;

// 🟢 Cliente OAuth de Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --------------------------------------------------------------
// FUNCION AUXILIAR: normalizar teléfono a formato E.164 (+57xxxx)
// --------------------------------------------------------------
function formatPhone(phone) {
  let clean = phone.replace(/\D/g, ''); // eliminar todo lo que no sea número
  if (clean.length === 10) return '+57' + clean; // agregar +57 si tiene 10 dígitos
  if (clean.length === 12 && clean.startsWith('57')) return '+' + clean; // si ya tiene 57
  if (clean.startsWith('+') && clean.length >= 12) return clean; // ya con código internacional
  return null; // formato inválido
}

// --------------------------------------------------------------
// RUTA GET COMPLETAR REGISTRO (Google o temporal)
// --------------------------------------------------------------
router.get('/completar-registro', (req, res) => {
  if (!req.session.tempGoogleUser && !req.session.tempUser) return res.redirect('/login');

  const temp = req.session.tempGoogleUser || req.session.tempUser;
  const { name, lastname, email } = temp;

  res.render('completar-registro', { name, lastname, email });
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

    if (!user) {
      req.session.tempGoogleUser = { name: googleName, lastname: '', email: googleEmail };
      await req.session.save();
      return res.json({
        success: true,
        message: 'Completa tu registro agregando teléfono y contraseña',
        redirect: '/completar-registro'
      });
    }

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

    req.session.user = {
      id: user.id,
      name: user.name,
      lastname: user.lastname || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user'
    };

    // ✅ Enviar rol al frontend
    res.json({
      success: true,
      message: 'Inicio de sesión con Google exitoso',
      redirect: user.role === 'admin' ? '/admin' : '/home',
      role: user.role
    });

  } catch (err) {
    console.error('Error en /auth/google-login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión con Google' });
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

    // ✅ Enviar rol al frontend
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      redirect: user.role === 'admin' ? '/admin' : '/home',
      role: user.role
    });

  } catch (err) {
    console.error('Error en /auth/login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// --------------------------------------------------------------
// REGISTRO NORMAL (POST /auth/registro)
// --------------------------------------------------------------
router.post('/registro', async (req, res) => {
  try {
    const { name, lastname, email, phone, password } = req.body;

    const cleanPhone = formatPhone(phone);
    if (!cleanPhone) return res.status(400).json({ error: 'Número de teléfono inválido' });

    const codigo = Math.floor(100000 + Math.random() * 900000);

    req.session.tempUser = { name, lastname, email, phone: cleanPhone, password, codigo };
    await req.session.save();

    try {
      await twilioClient.messages.create({
        from: FROM,
        to: cleanPhone,
        body: `Tu código de verificación es: ${codigo}`
      });
    } catch (err) {
      console.error('Error enviando SMS:', err.message);
      return res.status(500).json({ error: 'No se pudo enviar el SMS. Revisa el número' });
    }

    res.json({ success: true, message: 'Código enviado al número', redirect: '/verificar' });

  } catch (err) {
    console.error('Error en /auth/registro:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// --------------------------------------------------------------
// COMPLETAR REGISTRO GOOGLE (POST /auth/completar-registro)
// --------------------------------------------------------------
router.post('/completar-registro', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const temp = req.session.tempGoogleUser || req.session.tempUser;
    if (!temp) return res.status(400).json({ error: 'Sesión no encontrada' });

    const cleanPhone = formatPhone(phone);
    if (!cleanPhone) return res.status(400).json({ error: 'Número de teléfono inválido' });

    const codigo = Math.floor(100000 + Math.random() * 900000);

    temp.phone = cleanPhone;
    temp.password = password;
    temp.codigo = codigo;
    await req.session.save();

    try {
      await twilioClient.messages.create({
        from: FROM,
        to: cleanPhone,
        body: `Tu código de verificación es: ${codigo}`
      });
    } catch (err) {
      console.error('Error enviando SMS:', err.message);
      return res.status(500).json({ error: 'No se pudo enviar el SMS. Revisa el número' });
    }

    res.json({ success: true, message: 'Código enviado al número', redirect: '/verificar' });

  } catch (err) {
    console.error('Error en /auth/completar-registro:', err);
    res.status(500).json({ error: 'Error al completar registro' });
  }
});

// --------------------------------------------------------------
// VERIFICAR CÓDIGO OTP (POST /auth/verificar)
// --------------------------------------------------------------
router.post('/verificar', async (req, res) => {
  try {
    const { codigo } = req.body;

    const temp = req.session.tempUser || req.session.tempGoogleUser;
    if (!temp) return res.status(400).json({ success: false, message: 'Sesión expirada' });

    if (parseInt(codigo) !== temp.codigo)
      return res.status(400).json({ success: false, message: 'Código incorrecto' });

    const hashedPassword = await bcrypt.hash(temp.password, 10);

    let user = await User.findOne({ where: { email: temp.email } });

    if (user) {
      // Actualizar usuario existente
      await user.update({
        phone: temp.phone,
        password: hashedPassword,
        phone_verified: true
      });
    } else {
      // Crear nuevo usuario
      user = await User.create({
        name: temp.name,
        lastname: temp.lastname || '',
        email: temp.email,
        phone: temp.phone,
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

    // Limpiar sesiones temporales
    delete req.session.tempUser;
    delete req.session.tempGoogleUser;

    res.json({ success: true, message: 'Cuenta verificada y completada', redirect: '/home' });

  } catch (err) {
    console.error('Error en /auth/verificar:', err);
    res.status(500).json({ success: false, message: 'Error interno al verificar código' });
  }
});

// --------------------------------------------------------------
// CERRAR SESIÓN
// --------------------------------------------------------------
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('No se pudo cerrar sesión');
    }
    // Borra la cookie de sesión y redirige al login
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

//cambiar contraseña
router.put('/change-password', authController.changePassword);



// Devuelve solo rol, usado por panel admin
router.get('/session-role', (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, role: req.session.user.role });
  }
  res.json({ loggedIn: false });
});


router.get('/session', (req, res) => {
  if (req.session.user) {
    const { id, name, lastname, email, phone, role } = req.session.user;
    return res.json({
      loggedIn: true,
      id,
      name,
      lastname,
      email,
      phone,
      role
    });
  }
  res.json({ loggedIn: false });
});

// GET /perfil — Renderizar la vista con datos de sesión
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login'); // redirige si no hay sesión

  // Pasa la sesión del usuario al EJS
  res.render('perfil', { usuario: req.session.user });
});


module.exports = router;
