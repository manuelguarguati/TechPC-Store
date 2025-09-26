

// instalos el paquete npm install mysql2
const mysql = require('mysql2');
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'paginaweb'
});
// verificacion de la conexion


connection.connec((erro) => {
    if (erro) {
        console.log('erro al conectar mysql', erro);
        return;
    }
    console.log('conexion exitosa');
});

module.exports=connection;