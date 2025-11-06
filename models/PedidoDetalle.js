const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pedido = require('./Pedido');
const Product = require('./Product');

const PedidoDetalle = sequelize.define('PedidoDetalle', {
  pedidoId: { type: DataTypes.INTEGER, allowNull: true },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  cantidad: { type: DataTypes.INTEGER, allowNull: true },
  precio: { type: DataTypes.DECIMAL(16,4), allowNull: true }
}, {
  tableName: 'pedido_detalle',
  timestamps: false
});

PedidoDetalle.belongsTo(Pedido, { foreignKey: 'pedidoId' });
PedidoDetalle.belongsTo(Product, { foreignKey: 'productId' });

module.exports = PedidoDetalle;
