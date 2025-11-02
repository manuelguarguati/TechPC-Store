const cron = require('node-cron');
const { Op } = require('sequelize');
const Pedido = require('../models/Pedido');
const PedidoDetalle = require('../models/PedidoDetalle');
const Product = require('../models/Product');

// ⏰ Ejecutar cada hora
cron.schedule('0 * * * *', async () => {
  try {
    const ahora = new Date();

    const pedidosExpirados = await Pedido.findAll({
      where: {
        status: 'pending',
        expiresAt: { [Op.lt]: ahora }
      },
      include: PedidoDetalle
    });

    for (const pedido of pedidosExpirados) {
      // Restaurar stock
      for (const detalle of pedido.PedidoDetalles) {
        const producto = await Product.findByPk(detalle.productId);
        if (producto) {
          producto.stock += detalle.cantidad;
          await producto.save();
        }
      }

      // Cancelar pedido
      pedido.status = 'cancelled';
      await pedido.save();

      console.log(`🕓 Pedido #${pedido.id} cancelado automáticamente por expiración (24 h).`);
    }

    if (pedidosExpirados.length === 0) {
      console.log('✅ No hay pedidos pendientes expirados.');
    }

  } catch (error) {
    console.error('❌ Error al cancelar pedidos expirados:', error);
  }
});

console.log('✅ Cron job de expiración de pedidos iniciado.');
