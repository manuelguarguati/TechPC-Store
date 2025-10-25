// --------------------------------------------------------------
// controllers/mainController.js
// Controlador principal que renderiza las vistas EJS públicas, carrito y mini-carrito
// --------------------------------------------------------------

const Cart = require('../models/cart');
const Product = require('../models/product');
const Pedido = require('../models/pedido');
const PedidoDetalle = require('../models/pedido_detalle');
const User = require('../models/user'); // tu modelo User

const mainController = {
  // 🏠 Página principal
  home: (req, res) => {
    const usuario = req.session.user
      ? { id: req.session.user.id, name: req.session.user.name, email: req.session.user.email }
      : null;

    res.render('home', {
      titulo: 'Home - TechPC Store',
      usuario,
    });
  },

  // 🔐 Página de login
  login: (req, res) => {
    res.render('login', { titulo: 'Iniciar sesión - TechPC Store' });
  },

  // 🧾 Página de registro
  registro: (req, res) => {
    res.render('registro', { titulo: 'Registro - TechPC Store' });
  },

  // 🧠 Página de verificación
  verificar: (req, res) => {
    res.render('verificar', { titulo: 'Verificar cuenta - TechPC Store' });
  },

  // 👤 Página de perfil del usuario
   perfil: (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    res.render('perfil', {
      titulo: 'Mi perfil - TechPC Store',
      usuario: {
        name: usuario.name || '',
        lastname: usuario.lastname || '',
        phone: usuario.phone || ''
      }
    });
  },

  // 🔒 Página para cambiar contraseña
  cambiarPassword: (req, res) => {
    const usuario = req.session.user || null;
    if (!usuario) return res.redirect('/login');

    res.render('cambiar-password', {
      titulo: 'Cambiar contraseña - TechPC Store',
      usuario,
    });
  },

  // ⚙️ Panel de administración
  admin: (req, res) => {
    const usuario = req.session.user || null;
    if (!usuario || usuario.role !== 'admin') return res.redirect('/login');

    res.render('admin', {
      titulo: 'Panel de administración - TechPC Store',
      user: usuario,
    });
  },

  // 🛒 Ver carrito completo
  carrito: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    try {
      const items = await Cart.findAll({
        where: { userId: usuario.id },
        include: [{ model: Product }]
      });

      res.render('carrito', {
        titulo: 'Mi Carrito - TechPC Store',
        usuario,
        items
      });
    } catch (err) {
      res.send(err.message);
    }
  },

  // 🛍 Finalizar compra
  finalizarCompra: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    try {
      const items = await Cart.findAll({ where: { userId: usuario.id } });
      if (items.length === 0) return res.json({ success: false, message: 'Carrito vacío' });

      let total = 0;
      for (const item of items) {
        const producto = await Product.findByPk(item.productId);
        total += producto.price * item.cantidad;
      }

      const pedido = await Pedido.create({ userId: usuario.id, total });

      for (const item of items) {
        const producto = await Product.findByPk(item.productId);
        await PedidoDetalle.create({
          pedidoId: pedido.id,
          productId: producto.id,
          cantidad: item.cantidad,
          precio: producto.price
        });
      }

      await Cart.destroy({ where: { userId: usuario.id } });
      res.json({ success: true, message: 'Compra realizada con éxito' });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  },

  // 🛒 Mini-carrito (cantidad de productos)
  miniCarrito: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.json({ cantidad: 0 });

    try {
      const items = await Cart.findAll({ where: { userId: usuario.id } });
      const cantidad = items.reduce((acc, i) => acc + i.cantidad, 0);
      res.json({ cantidad });
    } catch (err) {
      res.json({ cantidad: 0 });
    }
  },

  // 🛒 Agregar producto al carrito
  agregarAlCarrito: async (req, res) => {
    const { productId, cantidad } = req.body;
    const usuario = req.session.user;
    if (!usuario) return res.json({ success: false, message: 'Debes iniciar sesión' });

    try {
      let item = await Cart.findOne({ where: { userId: usuario.id, productId } });
      if (item) {
        item.cantidad += parseInt(cantidad);
        await item.save();
      } else {
        await Cart.create({ userId: usuario.id, productId, cantidad });
      }
      res.json({ success: true, message: 'Producto agregado al carrito' });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  },

  // 📲 Página para completar registro tras Google Login
  completarRegistro: (req, res) => {
    if (!req.session.tempGoogleUser) return res.redirect('/login');

    res.render('completar-registro', {
      email: req.session.tempGoogleUser.email,
      name: req.session.tempGoogleUser.name,
      lastname: req.session.tempGoogleUser.lastname
    });
  },

 // ✏️ Guardar cambios de perfil (usuarios normales o Google)
guardarPerfil: async (req, res) => {
  const usuario = req.session.user;
  if (!usuario) return res.status(401).json({ success: false, message: 'No autorizado' });

  const { name, lastname, phone } = req.body; // <- mismo nombre que frontend

  try {
    await User.update(
      { name, lastname, phone },
      { where: { id: usuario.id } }
    );

    // Actualizar la sesión
    req.session.user.name = name;
    req.session.user.lastname = lastname;
    req.session.user.phone = phone;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
}
};
module.exports = mainController;
