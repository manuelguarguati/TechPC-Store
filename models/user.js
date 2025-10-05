const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ajusta si tu ruta es distinta

const User = sequelize.define('User', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  lastname: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  phone_verified: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  role: { 
    type: DataTypes.STRING,
    defaultValue: 'user' // 👈 Puede ser 'admin' o 'user'
  }
});

module.exports = User;
