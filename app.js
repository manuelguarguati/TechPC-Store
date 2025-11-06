// ------------------------------------------------------------
// 🌐 TechPC Store - Servidor Principal (app.js)
// ------------------------------------------------------------

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const session = require('express-session');
const cron = require('node-cron');
const { Op } = require('sequelize');
const sequelize = require('./config/database');

// ------------------------------------------------------------
// 📦 MODELOS
// ------------------------------------------------------------
const Pedido = require('./models/Pedido');
const PedidoDetalle = require('./models/PedidoDetalle');
const Product = require('./models/Product');

// ------------------------------------------------------------
// 🚀 INICIALIZACIÓN DE EXPRESS
// ------------------------------------------------------------
const app = express();

// ------------------------------------------------------------
// ⚙️ CONFIGURACIÓN GENERAL
// ------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------
// 🔒 CONFIGURACIÓN DE SESIONES
// ------------------------------------------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'mi_secreto_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hora
    secure: false, // Cambia a true si usas HTTPS en producción
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// ------------------------------------------------------------
// 🗂️ ARCHIVOS ESTÁTICOS
// ------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------
// 📦 IMPORTAR RUTAS
// ------------------------------------------------------------
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productsRoutes = require('./routes/products');
const perfilRoutes = require('./routes/perfil');


const pedidosRoutes = require('./routes/pedidos'); // ✅ Nueva ruta de pedidos

// ------------------------------------------------------------
// 🚦 USO DE RUTAS
// ------------------------------------------------------------

app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/perfil', perfilRoutes);

app.use('/api/pedidos', pedidosRoutes); // ✅ API de pedidos (checkout)
//busqeuda
const searchRoutes = require('./routes/search');
app.use('/search', searchRoutes);

// ------------------------------------------------------------
// 🧠 CONEXIÓN CON BASE DE DATOS
// ------------------------------------------------------------
sequelize.authenticate()
  .then(() => console.log('💾 Conexión con la base de datos establecida correctamente.'))
  .catch(err => console.error('❌ Error al conectar con la base de datos:', err));

// ------------------------------------------------------------
// 🕒 CRON JOB: Cancelar pedidos pendientes de más de 24 h
// ------------------------------------------------------------
require('./tasks/expirarPedidos');


// ------------------------------------------------------------
// 🔐 CONFIGURACIÓN HTTPS LOCAL
// ------------------------------------------------------------
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
};

// ------------------------------------------------------------
// 🖥️ INICIO DEL SERVIDOR
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;

https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Servidor HTTPS activo en: https://localhost:${PORT}/home`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
