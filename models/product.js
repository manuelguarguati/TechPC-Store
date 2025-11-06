const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Categoria = require('./Categoria');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  price: { type: DataTypes.DECIMAL(16,4), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  category_id: { type: DataTypes.INTEGER, allowNull: true },
  image_url: DataTypes.STRING,
  activo: { type: DataTypes.BOOLEAN, defaultValue: 1 },
  userId: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'productos',
  timestamps: true
});

Product.belongsTo(Categoria, { foreignKey: 'category_id' });
Product.belongsTo(User, { foreignKey: 'userId' });

module.exports = Product;

