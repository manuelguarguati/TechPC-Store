// --------------------------------------------------------------
// controllers/mainController.js
// Controlador principal que renderiza las vistas EJS públicas, carrito y mini-carrito
// --------------------------------------------------------------

const Cart = require('../models/cart');
const Product = require('../models/product');
const Pedido = require('../models/pedido');
const PedidoDetalle = require('../models/pedido_detalle');

const mainController = {
  // 🏠 Página principal
  home: (req, res) => {
    const usuario = req.session.user
      ? { id: req.session.user.id, nombre: req.session.user.nombre, correo: req.session.user.correo }
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
    const usuario = req.session.user || null;
    if (!usuario) return res.redirect('/login');

    res.render('perfil', {
      titulo: 'Mi perfil - TechPC Store',
      usuario,
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
    if (!usuario || usuario.role !== 'admin') {
      return res.redirect('/login');
    }

    res.render('admin', {
      titulo: 'Panel de administración - TechPC Store',
      user: usuario, // se usa "user" para admin.ejs
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

      if (items.length === 0) {
        return res.json({ success: false, message: 'Carrito vacío' });
      }

      // Calcular total
      let total = 0;
      for (const item of items) {
        const producto = await Product.findByPk(item.productId);
        total += producto.price * item.cantidad;
      }

      // Crear pedido
      const pedido = await Pedido.create({ userId: usuario.id, total });

      // Crear detalle de pedido
      for (const item of items) {
        const producto = await Product.findByPk(item.productId);
        await PedidoDetalle.create({
          pedidoId: pedido.id,
          productId: producto.id,
          cantidad: item.cantidad,
          precio: producto.price
        });
      }

      // Limpiar carrito
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
  }
};

module.exports = mainController;
