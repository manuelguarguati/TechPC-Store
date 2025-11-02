// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// registro / verify / login / google / completar / session / logout
router.post('/registro', auth.register);           // ← aquí cambio de "register" a "registro"
router.post('/verificar-codigo', auth.verifyCode); // ← opcional, coherente con idioma
router.post('/login', auth.login);
router.post('/google-login', auth.googleLogin);
router.post('/change-password', auth.changePassword);
router.get('/session', auth.session);
router.get('/session-role', auth.sessionRole);
router.post('/logout', auth.logout);
router.post('/completar-registro', auth.completarRegistro);

module.exports = router;
