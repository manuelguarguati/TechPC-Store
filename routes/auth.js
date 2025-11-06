const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Registro, verificación, login, Google, completar registro
router.post('/registro', auth.register);
router.post('/verificar-codigo', auth.verifyCode);
router.post('/login', auth.login);
router.post('/google-login', auth.googleLogin);
router.post('/completar-registro', auth.completarRegistro);

// Cambio de contraseña
router.post('/change-password', auth.changePassword);

// Recuperar cuenta (envío de enlace)
router.get('/recuperar-cuenta', (req, res) => res.render('recuperar-cuenta', { mensaje: null, error: null, titulo: 'Recuperar contraseña' }));
router.post('/recuperar-cuenta', auth.recuperarCuenta);

// Mostrar formulario para restablecer contraseña
router.get('/reset-password/:token', auth.resetPasswordForm);

// Actualizar la contraseña
router.post('/reset-password/:token', auth.updatePassword);

// Sesión y logout
router.get('/session', auth.session);
router.get('/session-role', auth.sessionRole);
router.post('/logout', auth.logout);

module.exports = router;
