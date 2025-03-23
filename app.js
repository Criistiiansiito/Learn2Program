require('dotenv').config();
// Importar dependencias
const express = require('express');
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


// Ruta para mostrar la página de pregunta-test.ejs
app.get('/obtenerPreguntasTest', (req, res) => {
  //se llamará cuando se implemente la vista intermedia entre el botón realizar test
  console.log("GET /pregunta");
  res.render('pregunta-test', {sol: false});
});


app.get('/retroalimentacion', (req, res) => {
  console.log("GET /retroalimentacion");
  res.render('pregunta-test', {sol: true});
});


app.get('/vista-test', (req, res) => {
  console.log("GET /vista-test");
 
        console.log("Carga de la página para ver test");
        res.render('vista-test');
     
  
}); 

//ver informacion entes de realizar test
app.get('/previsualizacion-de-test', (req,res)=>{

  //Renderizará a la vista dinámica de Cristian
  //Renderizar los datos (idTest, intentosRealizados, fecha intentos, preguntas acertadas, preguntas totales, puntuacion sobre 10)
  const idCurso = req.query.idCurso;


  //tabla intentos(id, idTest, nota,preguntasAcertadas, fechaFin,)
	//tabla test(id, titulo, idCurso)
  //seleccionamos el test del curso
  const consultaTestdeCurso = 'SELECT * FROM test WHERE idCurso = ?;';
  const consultaIntentos = 'SELECT * FROM intentos WHERE idTest = ?;';

  //AÑADIR SERGIO V : Implementar toda la lógica para obtener los intentos realizados por test.
  pool.query(consultaTestdeCurso, [idCurso], (err, resultsTest) => {
    if (err) {
      console.error('Error en consulta de test:', err);
      return;
    }
    // Aquí, resultsTest contendrá los resultados de la consulta del test
    console.log('Resultado de la consulta del test:', resultsTest);
  
    // Ahora, usando el idTest de los resultados obtenidos en la consulta anterior
    const test = resultsTest[0]; //cogemos el test
    const idTest = test.id; // cogemos idTest que se usará para buscar las preguntas
  
    // Conusltar información del idTest
    // Posible idea :)
    pool.query(consultaIntentos, [idTest], (err, resultsIntentos) => {
      if (err) {
        console.error('Error en consulta de intentos:', err);
        return;
      }
      // en este punto resultsIntentos contendrá los resultados de la consulta de intentos
      res.render('previsualizar-test', { idTest: idTest, numIntentos: resultsIntentos.length, intentos: resultsIntentos , preguntasAcertadas : test.preguntasAcertadas});
    });
  });
  //HACER RENDER A LA VISTA  DE ERIC Y CRISTIAN
});




//ver test
app.get('/obtener-preguntas-test', (req, res) => {
  const idTest = req.body.idTest; // El ID del test lo envías desde el frontend

  if (!idTest) {
      return res.status(400).json({ error: "El idTest es obligatorio" });
  }

  const consultaPreguntas = `SELECT p.id AS idPregunta, p.enunciado, o.idOpcion, o.respuesta1, o.respuesta2, o.respuesta3, o.respuesta4, r.respuestaCorrecta FROM Preguntas p JOIN Respuestas r ON p.id = r.idPregunta JOIN Opciones o ON r.idOpcion = o.idOpcion WHERE p.idTest = ?;`;

  pool.query(consultaPreguntas, [idTest], (err, results) => {
    if (err) {
        console.error('Error en la consulta de preguntas:', err);
        return res.status(500).send('Error interno del servidor');
    }

    // Si no hay preguntas para el test, renderizamos con un mensaje vacío
    if (results.length === 0) {
        return res.render('ver-test', { preguntas: [], mensaje: 'No hay preguntas disponibles para este test.' });
    }

    // Renderizar la vista 'ver-test' pasando la lista de preguntas con sus respuestas
    res.render('pregunta-test', { preguntas: results });

    /*esto va a devolver :  {
    "idPregunta": 1,
    "enunciado": "¿pregunta?",
    "idOpcion": la q sea,
    "respuesta1": "",
    "respuesta2": "",
    "respuesta3": "",
    "respuesta4": "",
    "respuestaCorrecta": ""
    */
  });
});


// Iniciar el servidor en el puerto
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
