// models/product_detalle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductDetail = sequelize.define('ProductDetail', {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    key_detail: { type: DataTypes.STRING, allowNull: false },
    value_detail: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'producto_detalle',
    timestamps: false
});

module.exports = ProductDetail;
