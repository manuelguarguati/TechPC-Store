// ------------------------------------------------------------
// 🧠 pedidoController.js
// ------------------------------------------------------------
const Pedido = require('../models/Pedido');
const PedidoDetalle = require('../models/PedidoDetalle');
const Product = require('../models/Product');
const { Op } = require('sequelize');

const pedidoController = {
  // ✅ Crear un pedido (checkout)
  crearPedido: async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ success: false, message: 'Debes iniciar sesión para comprar.' });

    try {
      const { productos, direccion_entrega_id } = req.body;

      if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'No hay productos en el pedido.' });
      }

      let subtotal = 0;

      // Verificar stock y calcular subtotal
      for (const item of productos) {
        const producto = await Product.findByPk(item.id);
        if (!producto || producto.stock < item.cantidad) {
          return res.status(400).json({
            success: false,
            message: `El producto "${producto?.name || 'desconocido'}" no tiene stock suficiente.`
          });
        }
        subtotal += producto.price * item.cantidad;
      }

      const impuestos = subtotal * 0.19;
      const total = subtotal + impuestos;

      // 🕓 Fecha de expiración: 24 horas desde ahora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Crear pedido
      const pedido = await Pedido.create({
        userId: user.id,
        subtotal,
        impuestos,
        total,
        direccion_entrega_id,
        status: 'pending',
        expiresAt
      });

      // Crear detalles y reducir stock
      for (const item of productos) {
        const producto = await Product.findByPk(item.id);

        await PedidoDetalle.create({
          pedidoId: pedido.id,
          productId: producto.id,
          cantidad: item.cantidad,
          precio: producto.price
        });

        producto.stock -= item.cantidad;
        await producto.save();
      }

      res.json({ success: true, message: 'Pedido creado correctamente', pedidoId: pedido.id });

    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      res.status(500).json({ success: false, message: 'Error interno al crear pedido.' });
    }
  },

  // ✅ Ver pedidos del usuario
  misPedidos: async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ success: false, message: 'Debes iniciar sesión.' });

    try {
      // Cancelar pedidos expirados antes de mostrar
      await pedidoController.cancelarPedidosExpirados();

      const pedidos = await Pedido.findAll({
        where: { userId: user.id },
        include: PedidoDetalle,
        order: [['createdAt', 'DESC']]
      });

      res.json(pedidos);
    } catch (error) {
      console.error('❌ Error al obtener pedidos del usuario:', error);
      res.status(500).json({ success: false, message: 'Error al cargar tus pedidos.' });
    }
  },

  // ✅ Ver todos los pedidos (solo admin)
  todosLosPedidos: async (req, res) => {
    if (!req.session.admin) return res.status(403).json({ success: false, message: 'Acceso denegado.' });

    try {
      // Cancelar pedidos expirados antes de mostrar
      await pedidoController.cancelarPedidosExpirados();

      const pedidos = await Pedido.findAll({
        include: PedidoDetalle,
        order: [['createdAt', 'DESC']]
      });

      res.json(pedidos);
    } catch (error) {
      console.error('❌ Error al obtener todos los pedidos:', error);
      res.status(500).json({ success: false, message: 'Error al obtener pedidos.' });
    }
  },

  // ✅ Cambiar estado del pedido (admin)
  actualizarEstado: async (req, res) => {
    if (!req.session.admin) return res.status(403).json({ success: false, message: 'Acceso denegado.' });

    try {
      const { id } = req.params;
      const { status } = req.body;

      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });

      pedido.status = status;
      await pedido.save();

      res.json({ success: true, message: `Pedido ${id} actualizado a ${status}.` });
    } catch (error) {
      console.error('❌ Error al actualizar pedido:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar pedido.' });
    }
  },

  // 🕓 Cancelar pedidos pendientes expirados y restaurar stock
  cancelarPedidosExpirados: async () => {
    try {
      const pedidos = await Pedido.findAll({
        where: {
          status: 'pending',
          expiresAt: { [Op.lt]: new Date() } // ya expiraron
        }
      });

      for (const pedido of pedidos) {
        pedido.status = 'cancelled';
        await pedido.save();

        // Restaurar stock
        const detalles = await PedidoDetalle.findAll({ where: { pedidoId: pedido.id } });
        for (const detalle of detalles) {
          const producto = await Product.findByPk(detalle.productId);
          if (producto) {
            producto.stock += detalle.cantidad;
            await producto.save();
          }
        }
      }

      if (pedidos.length > 0) {
        console.log(`✅ Se cancelaron ${pedidos.length} pedidos expirados.`);
      }
    } catch (error) {
      console.error('❌ Error al cancelar pedidos expirados:', error);
    }
  }
};

module.exports = pedidoController;
