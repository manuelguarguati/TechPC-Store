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

// post 
app.post('/registro', async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      lastname,
      email,
      phone,
      password: hashedPassword
    });

    res.redirect('/login');
  } catch (err) {
    res.status(400).send('Error al registrar usuario');
  }
});


// rutas a la logica de auntetificacion
app.use('/auth',authRoutes);



//  Iniciar el servidor
app.listen(Port, () => {
    console.log(` Servidor en http://localhost:${Port}/home`);
});
