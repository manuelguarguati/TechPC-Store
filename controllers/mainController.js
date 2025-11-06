const Cart = require('../models/cart');
const Product = require('../models/Product');
const Pedido = require('../models/Pedido');
const User = require('../models/User');
const path = require('path');
const multer = require('multer');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const mainController = {
  home: (req, res) => {
    const usuario = req.session.user || null;
    res.render('home', { titulo: 'Home - TechPC Store', usuario });
  },

  login: (req, res) => res.render('login', { titulo: 'Iniciar sesión - TechPC Store' }),
  registro: (req, res) => res.render('registro', { titulo: 'Registro - TechPC Store' }),
  verificar: (req, res) => res.render('verificar', { titulo: 'Verificar cuenta - TechPC Store' }),

  perfil: (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');
    res.render('perfil', { titulo: 'Mi perfil - TechPC Store', usuario });
  },

  cambiarPassword: (req, res) => {
    const usuario = req.session.user || null;
    if (!usuario) return res.redirect('/login');
    res.render('cambiar-password', { titulo: 'Cambiar contraseña - TechPC Store', usuario });
  },

  admin: (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');
    if (usuario.role !== 'admin') return res.status(403).send('No autorizado');
    res.render('admin', { titulo: 'Panel de administración - TechPC Store', user: usuario });
  },

  carrito: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    try {
      const items = await Cart.findAll({ where: { userId: usuario.id }, include: [{ model: Product }] });
      res.render('carrito', { titulo: 'Mi Carrito - TechPC Store', usuario, items });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  },

  carritoSession: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

    try {
      const items = await Cart.findAll({ where: { userId: usuario.id }, include: [{ model: Product }] });
      const total = items.reduce((acc, i) => acc + parseFloat(i.Product.price) * i.cantidad, 0);

      res.json({
        success: true,
        carrito: items.map(i => ({
          id: i.id,
          nombre: i.Product.name,
          precio: parseFloat(i.Product.price),
          cantidad: i.cantidad
        })),
        total
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error al obtener el carrito' });
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
        await Cart.create({ userId: usuario.id, productId, cantidad: parseInt(cantidad) });
      }

      const items = await Cart.findAll({ where: { userId: usuario.id } });
      const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

      res.json({ success: true, message: 'Producto agregado al carrito', cantidad: cantidadTotal });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: err.message });
    }
  },

  eliminarDelCarrito: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.json({ success: false, message: 'Debes iniciar sesión' });

    const { cartId } = req.body;
    try {
      await Cart.destroy({ where: { id: cartId, userId: usuario.id } });
      res.json({ success: true, message: 'Producto eliminado del carrito' });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: err.message });
    }
  },

  finalizarCompra: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.redirect('/login');

    try {
      const items = await Cart.findAll({ where: { userId: usuario.id } });
      if (!items || items.length === 0) return res.json({ success: false, message: 'Carrito vacío' });

      let total = 0;
      for (const item of items) {
        const producto = await Product.findByPk(item.productId);
        total += parseFloat(producto.price) * item.cantidad;
      }

      const pedido = await Pedido.create({ userId: usuario.id, total });
      await Cart.destroy({ where: { userId: usuario.id } });

      res.json({ success: true, message: 'Compra realizada con éxito' });
    } catch (err) {
      console.error(err);
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
      console.error(err);
      res.json({ cantidad: 0 });
    }
  },

  detalleProducto: async (req, res) => {
    const productId = req.params.id;
    const usuario = req.session.user || null;

    try {
      const producto = await Product.findByPk(productId);
      if (!producto) return res.status(404).send('Producto no encontrado');

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

  subirProducto: async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
      const usuario = req.session.user;
      const productos = await Product.findAll({ where: { userId: usuario.id, activo: true } });
      res.render('subir-producto', { titulo: 'Subir Producto', usuario, productos });
    } catch (err) {
      console.error(err);
      res.render('subir-producto', { titulo: 'Subir Producto', usuario: req.session.user, productos: [] });
    }
  },

  subirProductoPost: [
    upload.single('imagen'),
    async (req, res) => {
      if (!req.session.user) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

      try {
        const usuario = req.session.user;
        const { nombre, descripcion, precio, stock } = req.body;
        const image_url = req.file ? '/images/' + req.file.filename : null;

        const nuevoProducto = await Product.create({
          name: nombre,
          description: descripcion,
          price: parseFloat(precio),
          stock: parseInt(stock),
          image_url,
          userId: usuario.id,
          activo: true
        });

        res.json({ success: true, product: nuevoProducto });
      } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Error al crear producto' });
      }
    }
  ],

  terminos: (req, res) => res.render('terminos', { titulo: 'Términos y Condiciones - TechPC Store' }),

  completarRegistroView: (req, res) => {
    if (!req.session.googleUser) return res.redirect('/login');
    res.render('completar-registro', {
      email: req.session.googleUser.email,
      name: req.session.googleUser.name,
      lastname: req.session.googleUser.lastname
    });
  },

  getStock: async (req, res) => {
    const productId = req.params.id;
    try {
      const producto = await Product.findByPk(productId);
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      res.json({ stock: producto.stock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
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
