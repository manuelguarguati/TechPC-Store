const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Registro
router.post('/registro', async (req, res) => {
    const { name, lastname, email, phone, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            lastname,
            email,
            phone,
            password: hashedPassword
        });

        // Devuelve redirección para el frontend
        res.status(201).json({ redirect: '/home' });

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

        // Guardar sesión
        req.session.userId = user.id;
        req.session.userName = user.name;

        res.json({ message: 'Inicio de sesión correcto', redirect: '/home' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
