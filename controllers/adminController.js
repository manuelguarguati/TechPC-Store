const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { User, Product, Pedido, PedidoDetalle } = require('../models');
const { Op } = require('sequelize');

// ===============================
// Configuración de Multer
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'images')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ===============================
// Helper: eliminar imagen
// ===============================
async function borrarImagenSiExiste(image_url) {
  if (!image_url) return;
  try {
    const filename = image_url.split('/').pop();
    const ruta = path.join(__dirname, '..', 'public', 'images', filename);
    if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
  } catch (err) {
    console.warn('⚠️ No se pudo borrar imagen anterior:', err.message);
  }
}

// ===============================
// Middleware admin
// ===============================
function verificarAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido al administrador.' });
  }
  next();
}

// ===============================
// Controlador
// ===============================
const adminController = {
  // Dashboard
  dashboard: async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    try {
      const usuariosCount = await User.count();
      const productosCount = await Product.count();
      const pedidosCount = await Pedido.count();
      const ventas = await Pedido.sum('total') || 0;

      res.render('admin', {
        titulo: 'Panel de administración - TechPC Store',
        stats: { usuariosCount, productosCount, pedidosCount, ventas },
        user: req.session.user
      });
    } catch (err) {
      console.error('❌ Error dashboard admin:', err);
      res.status(500).send('Error al cargar dashboard');
    }
  },

  // Usuarios
  getUsuarios: async (req, res) => {
    try {
      const usuarios = await User.findAll({
        attributes: ['id', 'name', 'lastname', 'email', 'phone', 'role'],
        order: [['id', 'ASC']]
      });
      res.json(usuarios);
    } catch (err) {
      console.error('❌ Error obteniendo usuarios:', err);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },
  eliminarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      await User.destroy({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error eliminando usuario:', err);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  },

  // Productos
  getProductos: async (req, res) => {
    try {
      const products = await Product.findAll();
      res.json(products);
    } catch (err) {
      console.error('❌ Error obteniendo productos:', err);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },
  getProductoById: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(product);
    } catch (err) {
      console.error('❌ Error obteniendo producto:', err);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },
  crearProducto: async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, categoria } = req.body;
      const image_url = req.file ? `/images/${req.file.filename}` : null;

      if (!nombre || !precio) return res.status(400).json({ error: 'Nombre y precio obligatorios.' });

      const product = await Product.create({
        name: nombre,
        description: descripcion,
        price: parseFloat(precio) || 0,
        stock: parseInt(stock) || 0,
        image_url,
        category: categoria
      });

      res.json({ success: true, product });
    } catch (err) {
      console.error('❌ Error creando producto:', err);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },
  editarProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, stock, categoria, image_url_anterior } = req.body;
      const image_url = req.file ? `/images/${req.file.filename}` : image_url_anterior;

      if (req.file && image_url_anterior) await borrarImagenSiExiste(image_url_anterior);

      await Product.update(
        { name: nombre, description: descripcion, price: parseFloat(precio), stock: parseInt(stock), image_url, category: categoria },
        { where: { id } }
      );

      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error editando producto:', err);
      res.status(500).json({ error: 'Error al editar producto' });
    }
  },
  eliminarProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Product.findByPk(id);
      if (product && product.image_url) await borrarImagenSiExiste(product.image_url);

      await Product.destroy({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error eliminando producto:', err);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  },

  // Pedidos
  getPedidos: async (req, res) => {
    try {
      const ahora = new Date();
      // Cancelar pedidos expirados
      const expirados = await Pedido.findAll({
        where: { status: 'pending', expiresAt: { [Op.lt]: ahora } }
      });
      for (const p of expirados) {
        p.status = 'cancelled';
        await p.save();
      }

      const pedidos = await Pedido.findAll({
        include: [
          { model: PedidoDetalle, include: [Product] } // detalles + producto
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(pedidos);
    } catch (err) {
      console.error('❌ Error obteniendo pedidos:', err);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  },

  actualizarEstadoPedido: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

      pedido.status = status;
      await pedido.save();
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error actualizando pedido:', err);
      res.status(500).json({ error: 'Error al actualizar pedido' });
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ success: false });
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  }
};

module.exports = { adminController, upload, verificarAdmin };
