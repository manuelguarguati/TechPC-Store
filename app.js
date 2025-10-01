require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
  })
);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'home.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'login.html')));
app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'registro.html')));
app.get('/verificar', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'verificar.html')));
app.get('/perfil', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'perfil.html')));
app.get('/cambiar-password', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'cambiar-passowrd.html')));
// API de autenticación
app.use('/auth', authRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/home`);
});
