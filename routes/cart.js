const Cart = require('../models/cart');
const Product = require('../models/product');
const Pedido = require('../models/pedido'); // lo crearemos
const PedidoDetalle = require('../models/pedido_detalle'); // lo crearemos

// Agregar producto al carrito
exports.agregarAlCarrito = async (req, res) => {
  const { productId, cantidad } = req.body;
  const userId = req.session.userId;

  try {
    let item = await Cart.findOne({ where: { userId, productId } });
    if (item) {
      item.cantidad += parseInt(cantidad);
      await item.save();
    } else {
      await Cart.create({ userId, productId, cantidad });
    }
    res.json({ success: true, message: 'Producto agregado al carrito' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Ver carrito
exports.verCarrito = async (req, res) => {
  const userId = req.session.userId;
  try {
    const items = await Cart.findAll({
      where: { userId },
      include: [{ model: Product }]
    });
    res.render('carrito', { items });
  } catch (err) {
    res.send(err.message);
  }
};

// Eliminar producto del carrito
exports.eliminarDelCarrito = async (req, res) => {
  const { cartId } = req.body;
  try {
    await Cart.destroy({ where: { id: cartId } });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Finalizar compra (crear pedido)
exports.finalizarCompra = async (req, res) => {
  const userId = req.session.userId;
  try {
    const items = await Cart.findAll({ where: { userId } });

    if (items.length === 0) return res.json({ success: false, message: 'Carrito vacío' });

    // Calcular total
    let total = 0;
    for (const item of items) {
      const producto = await Product.findByPk(item.productId);
      total += producto.price * item.cantidad;
    }

    // Crear pedido
    const pedido = await Pedido.create({ userId, total });

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
    await Cart.destroy({ where: { userId } });

    res.json({ success: true, message: 'Compra realizada con éxito' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
