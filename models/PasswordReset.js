// models/PasswordReset.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PasswordReset = sequelize.define('PasswordReset', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires: {
    type: DataTypes.BIGINT, // timestamp en milisegundos
    allowNull: false
  }
}, {
  timestamps: true
});

PasswordReset.belongsTo(User, { foreignKey: 'userId' });

module.exports = PasswordReset;
