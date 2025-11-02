const Product = require('../models/Product');
const Categoria = require('../models/Categoria');
const { Op } = require('sequelize');

const productController = {
  // 📦 Obtener todos los productos activos
  obtenerProductos: async (req, res) => {
    try {
      const productos = await Product.findAll({
        where: { activo: true },
        include: [{ model: Categoria, attributes: ['id', 'nombre'] }]
      });
      res.json(productos);
    } catch (error) {
      console.error("💥 Error al obtener productos:", error);
      res.status(500).json({ success: false, message: "Error al obtener productos" });
    }
  },

  // 🔄 Obtener productos relacionados
  obtenerRelacionados: async (req, res) => {
    try {
      const { id } = req.params;
      const productoBase = await Product.findByPk(id, {
        include: [{ model: Categoria, attributes: ['id', 'nombre'] }]
      });
      if (!productoBase) return res.status(404).json({ success: false, message: "Producto no encontrado" });

      const relacionados = await Product.findAll({
        where: {
          category_id: productoBase.category_id,
          id: { [Op.ne]: id },
          activo: true
        },
        limit: 4,
        include: [{ model: Categoria, attributes: ['nombre'] }]
      });
      res.json(relacionados);
    } catch (error) {
      console.error("💥 Error al obtener productos relacionados:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  },

  // 🧍 Crear producto por usuario normal
  crearProductoUsuario: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

    try {
      const { nombre, descripcion, precio, stock, categoria_id } = req.body;
      const image_url = req.file ? `/images/${req.file.filename}` : '/images/default.png';

      const product = await Product.create({
        name: nombre,
        description: descripcion,
        price: parseFloat(precio),
        stock: parseInt(stock),
        image_url,
        category_id: categoria_id || null,
        activo: true,
        userId: usuario.id
      });

      res.json({ success: true, product });
    } catch (error) {
      console.error("💥 Error al crear producto:", error);
      res.status(500).json({ success: false, message: "Error al crear el producto" });
    }
  },

  // ✏️ Editar producto por usuario normal
  editarProductoUsuario: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

    try {
      const producto = await Product.findOne({
        where: { id: req.params.id, userId: usuario.id }
      });
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

      const { nombre, descripcion, precio, stock, categoria_id, image_url_anterior } = req.body;
      const image_url = req.file ? `/images/${req.file.filename}` : image_url_anterior;

      await producto.update({
        name: nombre,
        description: descripcion,
        price: parseFloat(precio),
        stock: parseInt(stock),
        image_url,
        category_id: categoria_id || producto.category_id
      });

      res.json({ success: true, product: producto });
    } catch (error) {
      console.error("💥 Error al editar producto:", error);
      res.status(500).json({ success: false, message: "Error al actualizar el producto" });
    }
  },

  // 🗑️ Eliminar producto por usuario normal
  eliminarProductoUsuario: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

    try {
      const producto = await Product.findOne({
        where: { id: req.params.id, userId: usuario.id }
      });
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

      await producto.destroy();
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
      console.error("💥 Error al eliminar producto:", error);
      res.status(500).json({ success: false, message: "Error al eliminar el producto" });
    }
  },

  // 🧾 Obtener producto por ID (usuario dueño)
  obtenerProductoPorId: async (req, res) => {
    const usuario = req.session.user;
    if (!usuario) return res.status(401).json({ success: false, message: 'Debes iniciar sesión' });

    try {
      const producto = await Product.findOne({
        where: { id: req.params.id, userId: usuario.id }
      });
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

      res.json(producto);
    } catch (error) {
      console.error("💥 Error al obtener producto:", error);
      res.status(500).json({ success: false, message: "Error al obtener producto" });
    }
  }
};

module.exports = productController;
