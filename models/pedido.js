const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Pedido = sequelize.define('Pedido', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('pending','paid','shipped','delivered','cancelled'), defaultValue: 'pending' },
  subtotal: DataTypes.DECIMAL(16,4),
  impuestos: { type: DataTypes.DECIMAL(16,4), defaultValue: 0.0 },
  total: DataTypes.DECIMAL(16,4),
  direccion_entrega_id: DataTypes.INTEGER
}, {
  tableName: 'pedidos',
  timestamps: true
});

Pedido.belongsTo(User, { foreignKey: 'userId' });

module.exports = Pedido;
