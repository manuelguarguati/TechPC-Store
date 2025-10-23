const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');

const Cart = sequelize.define('Cart', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'carrito',
  timestamps: false
});

// Relación opcional para obtener datos del producto
Cart.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Cart;
