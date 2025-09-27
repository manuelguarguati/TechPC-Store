const express = require('express');
const path = require('path');
const app = express();
const Port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//  Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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

//  Iniciar el servidor
app.listen(Port, () => {
    console.log(` Servidor en http://localhost:${Port}/home`);
});
