require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const session = require('express-session');

const app = express();

// Motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// HTTPS local
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
};

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'mi_secreto_seguro',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60, secure: false, sameSite: 'lax' }
}));
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 IMPORTAR RUTAS
const mainRoutes = require('./routes/main');       // <--- Asegúrate de tener esto
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productsRoutes = require('./routes/products');
const perfilRoutes = require('./routes/perfil');

// 🔹 USAR RUTAS
const subirProductoRoutes = require('./routes/subirProducto');

app.use('/', subirProductoRoutes); // ahora GET /subir-producto funciona
app.use('/', mainRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Servidor
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Servidor corriendo en https://localhost:${PORT}/home`);
});
