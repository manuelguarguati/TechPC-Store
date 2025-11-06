const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Favorito = sequelize.define('Favorito', {}, {
  tableName: 'favoritos',
  timestamps: false
});

Favorito.belongsTo(User, { foreignKey: 'userId' });
Favorito.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Favorito;
