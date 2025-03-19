require('dotenv').config();
// Importar dependencias
const express = require('express');
const sql = require('mysql');
const path = require('path');
const pool = require('./database/connection');

const app = express();
const port = 8080;

// Configuración para que el servidor sepa redirigir correctamente a las plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// sirve para que en tiempo de ejecución el servidor sepa acceder a la carpeta public para imagenes, etc
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal (de momento se quedará así para la primera historia de usuario)
app.get('/', (req, res) => {
  console.log("GET /");
  const query1 = 'SELECT * FROM Cursos';

  pool.query(query1, (err, cursos) => {
    if (err) {
      res.status(500).send('Error al obtener los datos: ' + err.message);
      return;
    }

    // Seleccionamos el primer curso de la lista ya que solo
    // hay uno para la primera historia de usuario
    var curso = cursos[0]; 

     // Obtener los temas del curso usando el idCurso
     const query2 = 'SELECT * FROM Temas WHERE idCurso = ?';
     pool.query(query2, [curso.id], (err, temas) => {
        if (err) {
         res.status(500).send('Error al obtener los temas: ' + err.message);
         return;
        }

        console.log("Carga de la página principal");
        res.render('ver-teoria-curso', { curso: curso, temas: temas});
     });
  });
}); 

// Iniciar el servidor en el puerto
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
