const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('techpc_store', 'root', '',{
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;