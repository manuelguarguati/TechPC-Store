// --------------------------------------------------------------
// models/product.js — Modelo Sequelize para productos
// --------------------------------------------------------------
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING
    },
    image_url: {
        type: DataTypes.STRING // Guardamos la ruta o URL de la imagen
    }
}, {
    tableName: 'productos', //  Nombre de tu tabla real
    timestamps: true
});

module.exports = Product; //  Exportación correcta del modelo
