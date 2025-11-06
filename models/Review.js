const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Review = sequelize.define('Review', {
  calificacion: DataTypes.INTEGER,
  comentario: DataTypes.TEXT
}, {
  tableName: 'reviews',
  timestamps: true
});

Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Review;
