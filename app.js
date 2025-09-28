const express = require('express');
const session = require('express-session')
const path = require('path');
const sequelize = require('./config/database');
const User = require('./models/user');
const authRoutes = require('./routes/auth');


const bcrypt = require('bcryptjs');
const app = express();
const Port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret:'secret', resave:false, saveUninitialized:true}));


//  Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

//  Rutas principales
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'registro.html'));
});

// rutas a la logica de auntetificacion
app.use('/auth',authRoutes);

//  Iniciar el servidor
app.listen(Port, () => {
    console.log(` Servidor en http://localhost:${Port}/home`);
});
