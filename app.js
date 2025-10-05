// --------------------------------------------------------------
// app.js — Servidor principal con panel admin y autenticación
// --------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const https = require('https');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------------------
//  CONFIGURACIÓN DE HTTPS LOCAL
// --------------------------------------------------------------
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
};

// --------------------------------------------------------------
//  MIDDLEWARES
// --------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mi_secreto_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hora
      secure: false, // true si usas HTTPS real
      sameSite: 'lax'
    }
  })
);

// Archivos estáticos (públicos)
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------------------
// 🌐 RUTAS HTML PÚBLICAS
// --------------------------------------------------------------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'home.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'login.html')));
app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'registro.html')));
app.get('/verificar', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'verificar.html')));
app.get('/perfil', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'perfil.html')));
app.get('/cambiar-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'cambiar-password.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'admin.html')));

// --------------------------------------------------------------
// 🧩 RUTAS BACKEND (API)
// --------------------------------------------------------------
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// ✅ Rutas correctas
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// --------------------------------------------------------------
// 🚀 INICIAR SERVIDOR HTTPS
// --------------------------------------------------------------
https.createServer(options, app).listen(PORT, () => {
  console.log(` Servidor corriendo en https://localhost:${PORT}/home`);
});
