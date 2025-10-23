const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PedidoDetalle = sequelize.define('PedidoDetalle', {
  pedidoId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
  tableName: 'pedido_detalle',
  timestamps: false
});

module.exports = PedidoDetalle;
