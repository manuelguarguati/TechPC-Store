const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();


// registro
router.post('/register', async(req , res) => {
    const {name , lastname , email , phone, password} = req.body;

    const hashedpassword = await bcrypt.hash(password, 10);

    try{
        const user = await User.create({
            name,
            lastname,
            email,
            phone,
            password: hashedpassword
        });

        res.status(201).json({ message: 'Usuario registrado'});
    }catch (err){
        res.status(400).json({error:'Error al registrar usuario'});
    }
});


// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

  req.session.userId = user.id;
  res.json({ message: 'Login exitoso', userId: user.id });
});

module.exports = router;
