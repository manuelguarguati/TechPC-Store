// models/User.js (ejemplo Sequelize)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  lastname: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  phone: DataTypes.STRING,
  password: DataTypes.STRING,
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' }, // 'user' o 'admin'
  google_id: DataTypes.STRING,
  estadoCuenta: { type: DataTypes.BOOLEAN, defaultValue: true } // true = activa, false = inactiva

});

module.exports = User;
