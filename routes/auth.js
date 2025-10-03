require('dotenv').config(); // Carga las variables de entorno desde .env (como claves de Twilio)
const express = require('express'); // Importa Express (framework de servidor)
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas
const twilio = require('twilio'); // Cliente oficial de Twilio (para enviar SMS)
const User = require('../models/user'); // Modelo User (tabla usuarios en la BD)


const { OAuth2Client } = require('google-auth-library');
const clients = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router(); // Crea un enrutador de Express
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); // Inicializa Twilio con tus credenciales

//  Función auxiliar: Normaliza el teléfono al formato internacional (+57 para Colombia)
function normalizePhone(phone) {
  if (!phone) return null;
  phone = phone.trim(); // Elimina espacios
  if (phone.startsWith('+')) return phone; // Si ya empieza con +, lo devuelve igual
  if (/^[0-9]{10}$/.test(phone)) return `+57${phone}`; // Si son 10 dígitos, añade +57
  return phone; // En otros casos, lo devuelve como está
}

//  Ruta: REGISTRO DE USUARIO
router.post('/registro', async (req, res) => {
  try {
    let { name, lastname, email, phone, password } = req.body; // Extrae datos del cuerpo de la petición
    phone = normalizePhone(phone); // Normaliza el número

    //  Validación: Todos los campos son obligatorios
    if (!name || !lastname || !email || !phone || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    //  Encripta la contraseña antes de guardarla en la BD
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Guarda el usuario en la base de datos
    await User.create({
      name,
      lastname,
      email,
      phone,
      password: hashedPassword,
      phone_verified: false // Por defecto no verificado
    });

    //  Genera un código OTP de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = String(code); // Guarda OTP en sesión
    req.session.phone = phone; // Guarda teléfono en sesión
    req.session.lastPlainPassword = password; // Guarda contraseña en texto plano solo temporalmente (NO recomendable en producción)

    //  Envía el OTP por SMS usando Twilio
    await client.messages.create({
      body: `Tu código de verificación es: ${code}`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phone
    });

    //  Responde al cliente
    return res.json({ redirect: '/verificar', message: 'Usuario registrado. Código enviado por SMS 📲' });
  } catch (err) {
    console.error('Error /auth/registro:', err);
    return res.status(400).json({ error: 'Error al registrar usuario' });
  }
});

//  Ruta: VERIFICAR OTP
router.post('/verificar', async (req, res) => {
  try {
    const { codigo } = req.body; // Código ingresado por el usuario
    const phone = req.session.phone; // Número guardado en sesión

    //  Validar que haya sesión y OTP activos
    if (!phone || !req.session.otp) {
      return res.status(400).json({ success: false, message: 'No hay código activo. Regístrate nuevamente.' });
    }

    // Si el código es correcto, marca el usuario como verificado
    if (String(codigo) === String(req.session.otp)) {
      await User.update({ phone_verified: true }, { where: { phone } });
      delete req.session.otp; // Elimina OTP de la sesión
      delete req.session.phone; // Elimina teléfono de la sesión

      return res.json({ success: true, message: 'Número verificado correctamente' });
    } else {
      return res.status(400).json({ success: false, message: 'Código incorrecto' });
    }
  } catch (err) {
    console.error('Error /auth/verificar:', err);
    return res.status(500).json({ error: 'Error al verificar el código' });
  }
});

//  Ruta: LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Obtiene email y contraseña
    const user = await User.findOne({ where: { email } }); // Busca el usuario en la BD
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    //  Compara la contraseña ingresada con la encriptada
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    //  Si no ha verificado su teléfono, no deja iniciar sesión
    if (!user.phone_verified) {
      return res.status(403).json({ error: 'Verifica tu número antes de iniciar sesión 📱' });
    }

    //  Guarda datos importantes en la sesión del usuario
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userPlainPassword = password;

    return res.json({ message: 'Inicio de sesión correcto', redirect: '/home' });
  } catch (err) {
    console.error('Error /auth/login:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

//  Ruta: SESIÓN ACTUAL
router.get('/session', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      name: req.session.userName,
      email: req.session.userEmail,
      password: req.session.userPlainPassword || null
    });
  } else {
    res.json({ loggedIn: false });
  }
});

//  Ruta: CERRAR SESIÓN
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Sesión cerrada' });
  });
});

//  Ruta: CAMBIAR CONTRASEÑA
router.put('/change-password', async (req, res) => {
  try {
    // 1️ Verificar si hay sesión activa
    if (!req.session.userId) {
      return res.status(401).send('No autorizado. Inicia sesión.');
    }

    const { actual, nueva } = req.body; // Contraseña actual y nueva

    if (!actual || !nueva) {
      return res.status(400).send('Faltan campos obligatorios.');
    }

    // 2️ Buscar usuario por ID
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).send('Usuario no encontrado.');
    }

    // 3️ Verificar si la contraseña actual es correcta
    const isMatch = await bcrypt.compare(actual, user.password);
    if (!isMatch) {
      return res.status(400).send('La contraseña actual no es correcta.');
    }

    // 4️ Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva, 10);

    // 5️ Actualizar contraseña en la BD
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    // 6️ Eliminar contraseña en texto plano de la sesión por seguridad
    delete req.session.userPlainPassword;

    res.status(200).send('Contraseña actualizada correctamente ');
  } catch (err) {
    console.error('Error en /auth/change-password:', err);
    res.status(500).send('Error interno del servidor.');
  }
});

// Login con Google
router.post('/google-login', async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: 'Falta token de Google' });

    // Validar el token con Google
    const ticket = await clients.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.given_name || '';
    const lastname = payload.family_name || '';

    // Buscar usuario en DB
    let user = await User.findOne({ where: { email } });

    // Si no existe, lo creamos automáticamente
    if (!user) {
      user = await User.create({
        name,
        lastname,
        email,
        phone: '',
        password: '',
        phone_verified: true
      });
    }

    // Guardamos sesión
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    return res.json({ message: 'Login con Google exitoso', redirect: '/home' });
  } catch (err) {
    console.error('Error /auth/google-login:', err);
    return res.status(500).json({ error: 'Error en Google login' });
  }
});

module.exports = router; // Exporta el enrutador para usarlo en el servidor principal
