const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER },
  productId: { type: DataTypes.INTEGER },
  cantidad: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: 'carrito',
  timestamps: true
});

Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Cart;
