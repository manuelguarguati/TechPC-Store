const express = require('express');
const cors = require('cors');
const db = require('./desarrollo web pagina/database/MYSQL/dbconnection.js'); // tu conexión

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Ruta para login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('❌ Error al consultar:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length > 0) {
      res.json({ mensaje: '✅ Login exitoso', usuario: results[0] });
    } else {
      res.status(401).json({ mensaje: '❌ Credenciales incorrectas' });
    }
  });
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});

function loguear(){

    let user=document.getElementById("usuario").value;
    let pass=document.getElementById("clave").value;
  

    if(user=="manuel" && pass=="1234"){
         
   window.location="/home";
    }else{

        alert("usuario o contraseña son incorrectos");
    }
}