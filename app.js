// --------------------------------------------------------------
// app.js — Servidor principal con panel admin, autenticación y productos públicos
// --------------------------------------------------------------


require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------------------
// ⚙️ CONFIGURACIÓN DE HTTPS LOCAL
// --------------------------------------------------------------
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
};

// --------------------------------------------------------------
// 🧩 MIDDLEWARES
// --------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💾 Manejo de sesiones (login persistente)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mi_secreto_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hora
      secure: false, // true si usas HTTPS real
      sameSite: 'lax',
    },
  })
);

// 📁 Archivos estáticos públicos
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------------------
// 🌐 RUTAS HTML PÚBLICAS Y API
// --------------------------------------------------------------
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productsRoutes = require('./routes/products');


// 📌 Usar las rutas
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);

// --------------------------------------------------------------
// 🚀 INICIAR SERVIDOR HTTPS
// --------------------------------------------------------------
https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Servidor corriendo en https://localhost:${PORT}/home`);
});
