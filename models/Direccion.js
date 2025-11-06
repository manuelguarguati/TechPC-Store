const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Direccion = sequelize.define('Direccion', {
  direccion: DataTypes.STRING,
  ciudad: DataTypes.STRING,
  departamento: DataTypes.STRING,
  codigo_postal: DataTypes.STRING,
  telefono: DataTypes.STRING
}, {
  tableName: 'direcciones',
  timestamps: false
});

Direccion.belongsTo(User, { foreignKey: 'userId' });

module.exports = Direccion;
