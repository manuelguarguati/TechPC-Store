const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Pedido = sequelize.define('Pedido', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('pending','paid','shipped','delivered','cancelled'), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(16,4) },
  impuestos: { type: DataTypes.DECIMAL(16,4), defaultValue: 0.0 },
  total: { type: DataTypes.DECIMAL(16,4) },
  direccion_entrega_id: { type: DataTypes.INTEGER },
  expiresAt: { type: DataTypes.DATE, allowNull: true } // 👈 correcta ubicación
}, {
  tableName: 'pedidos',
  timestamps: true
});

Pedido.belongsTo(User, { foreignKey: 'userId' });

module.exports = Pedido;
