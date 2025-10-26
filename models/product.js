// models/product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.STRING },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/images/default.png'
    },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    userId: { type: DataTypes.INTEGER, allowNull: true } // <-- columna nueva
}, {
    tableName: 'productos',
    timestamps: true
});

module.exports = Product;
