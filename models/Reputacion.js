const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Reputacion = sequelize.define('Reputacion', {
  puntos: DataTypes.INTEGER,
  ventas: DataTypes.INTEGER,
  reclamos: DataTypes.INTEGER
}, {
  tableName: 'reputacion',
  timestamps: false
});

Reputacion.belongsTo(User, { foreignKey: 'userId' });

module.exports = Reputacion;
