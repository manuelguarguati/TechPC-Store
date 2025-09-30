const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('techpc_store', 'root', '1234',{
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;