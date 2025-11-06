const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pedido = require('./Pedido');

const Envio = sequelize.define('Envio', {
  estado: DataTypes.STRING,
  empresa: DataTypes.STRING,
  tracking: DataTypes.STRING,
  fecha_envio: DataTypes.DATE,
  fecha_entrega: DataTypes.DATE
}, {
  tableName: 'envios',
  timestamps: false
});

Envio.belongsTo(Pedido, { foreignKey: 'pedidoId' });

module.exports = Envio;
