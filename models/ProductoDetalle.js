const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const ProductoDetalle = sequelize.define('ProductoDetalle', {
  key_detail: { type: DataTypes.STRING, allowNull: false },
  value_detail: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'producto_detalle',
  timestamps: true
});

ProductoDetalle.belongsTo(Product, { foreignKey: 'productId' });

module.exports = ProductoDetalle;
