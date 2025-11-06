const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Pregunta = sequelize.define('Pregunta', {
  pregunta: DataTypes.TEXT,
  respuesta: DataTypes.TEXT
}, {
  tableName: 'preguntas',
  timestamps: true,
});

Pregunta.belongsTo(User, { foreignKey: 'userId' });
Pregunta.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Pregunta;
