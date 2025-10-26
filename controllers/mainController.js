// --------------------------------------------------------------
// controllers/mainController.js
// Controlador principal que renderiza las vistas EJS públicas, carrito y mini-carrito
// --------------------------------------------------------------

const Cart = require('../models/cart');
const Product = require('../models/Product');
const Pedido = require('../models/Pedido');
const PedidoDetalle = require('../models/PedidoDetalle');
const User = require('../models/User');
const ProductDetail = require('../models/ProductoDetalle');

const mainController = {
  // Página principal
  home: (req, res) => {
    const usuario = req.session.user
      ? { id: req.session.user.id, name: req.session.user.name, email: req.session.user.email }
      : null;

    res.render('home', { titulo: 'Home - TechPC Store', usuario });
  },

  login: (req, res) => res.render('login', { titulo: 'Iniciar sesión - TechPC Store' }),
  registro: (req, res) => res.render('registro', { titulo: 'Registro - TechPC Store' }),
  verificar: (req, res) => res.render('verificar', { titulo: 'Verificar cuenta - TechPC Store' }),

  perfil: (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    res.render('perfil', {
      titulo: 'Mi perfil - TechPC Store',
      usuario: { name: usuario.name || '', lastname: usuario.lastname || '', phone: usuario.phone || '' }
    });
  },

  cambiarPassword: (req, res) => {
    const usuario = req.session.user || null;
    if (!usuario) return res.redirect('/login');
    res.render('cambiar-password', { titulo: 'Cambiar contraseña - TechPC Store', usuario });
  },

  admin: (req, res) => {
    const usuario = req.session.user;

    // Si no hay sesión → redirigir a login
    if (!usuario) return res.redirect('/login');

    // Si no es admin → redirigir a login o mostrar mensaje
    if (usuario.role !== 'admin') return res.status(403).send('No autorizado');

    // Renderizar panel de admin
    res.render('admin', {
      titulo: 'Panel de administración - TechPC Store',
      user: usuario
    });
  },

  // 🔹 Carrito
  carrito: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    try {
      const items = await Cart.findAll({
        where: { userId: usuario.id },
        include: [{ model: Product }]
      });

      res.render('carrito', { titulo: 'Mi Carrito - TechPC Store', usuario, items });
    } catch (err) {
      res.send(err.message);
    }
  },

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

  eliminarDelCarrito: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.json({ success: false, message: 'Debes iniciar sesión' });

    const { cartId } = req.body;
    try {
      // Elimina solo si el carrito pertenece al usuario
      await Cart.destroy({ where: { id: cartId, userId: usuario.id } });
      res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  },

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

  detalleProducto: async (req, res) => {
    const productId = req.params.id;
    const usuario = req.session.user
      ? { id: req.session.user.id, name: req.session.user.name, email: req.session.user.email }
      : null;

    try {
      const producto = await Product.findByPk(productId);
      if (!producto) return res.status(404).send('Producto no encontrado');

      const detalles = await ProductDetail.findAll({ where: { productId } });
      producto.detalles = detalles;

      let cantidadCarrito = 0;
      if (usuario) {
        const items = await Cart.findAll({ where: { userId: usuario.id } });
        cantidadCarrito = items.reduce((acc, i) => acc + i.cantidad, 0);
      }

      res.render('detalleProducto', { producto, usuario, miniCarrito: { cantidad: cantidadCarrito } });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al cargar el producto');
    }
  },

  subirProducto: (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('subir-producto', { user: req.session.user });
  },

  terminos: (req, res) => res.render('terminos', { titulo: 'Términos y Condiciones - TechPC Store' }),

  completarRegistro: (req, res) => {
    if (!req.session.tempGoogleUser) return res.redirect('/login');

    res.render('completar-registro', {
      email: req.session.tempGoogleUser.email,
      name: req.session.tempGoogleUser.name,
      lastname: req.session.tempGoogleUser.lastname
    });
  },

  guardarPerfil: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'No autorizado' });

    const { name, lastname, phone } = req.body;

    try {
      await User.update({ name, lastname, phone }, { where: { id: usuario.id } });

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
