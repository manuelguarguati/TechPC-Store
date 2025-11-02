// controllers/authController.js
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "1009394864655-mtbfugom0ephlheoau1i91osd1bcvl1m.apps.googleusercontent.com");

// Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

const authController = {
  register: async (req, res) => {
    const { name, lastname, email, phone, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.json({ success: false, message: 'El correo ya está registrado.' });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      req.session.tempUser = { name, lastname, email, phone, password, code, expires };

      await transporter.sendMail({
        from: `"TechPC Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Código de verificación - TechPC Store',
        html: `<h2>¡Hola ${name}!</h2><p>Tu código de verificación es:</p><h1>${code}</h1><p>Expira en 10 minutos.</p>`
      });

      res.json({ success: true, message: 'Código enviado a tu correo.', email });
    } catch (err) {
      console.error('❌ Error en registro:', err);
      res.json({ success: false, message: 'Error al registrar usuario.' });
    }
  },

  verifyCode: async (req, res) => {
    const { email, code } = req.body;
    try {
      const tempUser = req.session.tempUser;
      if (!tempUser || tempUser.email !== email) {
        return res.json({ success: false, message: 'No hay registro pendiente o el correo no coincide.' });
      }
      if (new Date() > new Date(tempUser.expires)) return res.json({ success: false, message: 'Código expirado, regístrate nuevamente.' });
      if (code !== tempUser.code) return res.json({ success: false, message: 'Código incorrecto.' });

      const hashedPassword = await bcrypt.hash(tempUser.password, 10);
      const created = await User.create({
        name: tempUser.name,
        lastname: tempUser.lastname,
        email: tempUser.email,
        phone: tempUser.phone,
        password: hashedPassword,
        email_verified: true
      });

      delete req.session.tempUser;

      // iniciar sesión automáticamente
      req.session.user = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role || 'user',
        lastname: created.lastname || '',
        phone: created.phone || ''
      };

      res.json({ success: true, message: 'Cuenta verificada y creada correctamente.' });
    } catch (err) {
      console.error('❌ Error en verifyCode:', err);
      res.json({ success: false, message: 'Error al verificar el código.' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.json({ success: false, message: 'Usuario no encontrado.' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.json({ success: false, message: 'Contraseña incorrecta.' });

      if (!user.email_verified) return res.json({ success: false, message: 'Verifica tu correo antes de iniciar sesión.' });

      // Guardar info completa en sesión (evita inconsistencias)
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        lastname: user.lastname || '',
        phone: user.phone || ''
      };

      const redirect = user.role === 'admin' ? '/admin' : '/home';
      res.json({ success: true, message: 'Inicio de sesión exitoso.', redirect });
    } catch (err) {
      console.error('❌ Error en login:', err);
      res.json({ success: false, message: 'Error al iniciar sesión.' });
    }
  },

  // recibe { id_token } desde frontend
  googleLogin: async (req, res) => {
    try {
      const { id_token } = req.body;
      if (!id_token) return res.status(400).json({ success: false, message: 'Token Google faltante.' });

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID || "1009394864655-mtbfugom0ephlheoau1i91osd1bcvl1m.apps.googleusercontent.com",
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.given_name || '';
      const lastname = payload.family_name || '';
      const picture = payload.picture || null;

      let user = await User.findOne({ where: { email } });

      if (user) {
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          lastname: user.lastname || '',
          phone: user.phone || ''
        };
        const redirect = user.role === 'admin' ? '/admin' : '/home';
        return res.json({ success: true, redirect });
      }

      // nuevo usuario: guardar info temporal en sesión y pedir completar
      req.session.googleUser = { name, lastname, email, picture };
      return res.json({ success: false, redirect: '/completar' });
    } catch (err) {
      console.error('❌ Error Google login:', err);
      res.status(500).json({ success: false, message: 'Error al iniciar sesión con Google' });
    }
  },

  completarRegistro: async (req, res) => {
    try {
      const temp = req.session.googleUser;
      if (!temp) return res.json({ success: false, message: 'No hay sesión de Google activa.' });

      const { phone, password } = req.body;
      if (!phone || !password) return res.json({ success: false, message: 'Faltan datos.' });

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: temp.name,
        lastname: temp.lastname,
        email: temp.email,
        phone,
        password: hashed,
        email_verified: true,
        google_id: temp.email,
        profile_picture: temp.picture
      });

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        lastname: user.lastname || '',
        phone: user.phone || ''
      };
      delete req.session.googleUser;

      res.json({ success: true, redirect: '/home' });
    } catch (err) {
      console.error('❌ Error al completar registro Google:', err);
      res.json({ success: false, message: 'Error al completar registro.' });
    }
  },

  changePassword: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'No autorizado.' });

    const { actual, nueva } = req.body;
    if (!actual || !nueva) return res.status(400).json({ success: false, message: 'Campos incompletos.' });

    try {
      const userDB = await User.findByPk(usuario.id);
      const match = await bcrypt.compare(actual, userDB.password);
      if (!match) return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta.' });

      const hashed = await bcrypt.hash(nueva, 10);
      await User.update({ password: hashed }, { where: { id: usuario.id } });

      res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  session: (req, res) => {
    if (req.session && req.session.user) {
      // devolver user como objeto (frontend espera data.name, data.email, etc.)
      return res.json({ loggedIn: true, user: req.session.user });
    } else {
      return res.json({ loggedIn: false });
    }
  },

  sessionRole: (req, res) => {
    if (req.session && req.session.user) {
      res.json({ loggedIn: true, role: req.session.user.role || 'user' });
    } else res.json({ loggedIn: false, role: null });
  },

  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('❌ Error al cerrar sesión:', err);
        return res.status(500).json({ success: false, message: 'Error al cerrar sesión.' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Sesión cerrada correctamente.' });
    });
  }
};

module.exports = authController;
