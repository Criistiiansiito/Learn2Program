require('dotenv').config();
// Importar dependencias
const express = require('express');
const path = require('path');
const servicioIntento = require('./servicios/servicioIntento');
const Curso = require('./modelos/Curso');
const Tema = require('./modelos/Tema');
const Pregunta = require('./modelos/Pregunta');
const Respuesta = require('./modelos/Respuesta');
const Test = require('./modelos/Test');
const manejadorErrores = require('./middleware/manejadorErrores');
const seedDatabase = require('./database/seed');
const StatusCodes = require('http-status-codes');
const { PreguntaNoEncontradaError } = require('./utils/errores');

const app = express();
const port = 8080;

// Configuración para que el servidor sepa redirigir correctamente a las plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// sirve para que en tiempo de ejecución el servidor sepa acceder a la carpeta public para imagenes, etc
app.use(express.static(path.join(__dirname, 'public')));
// (Middleware que) covierte los cuerpos x-www-form-urlencoded de las peticiones en objetos javascript
// Necesario para los intentos de las preguntas del test
app.use(express.urlencoded({ extended: true }));

// Home en primera historia de usuario
app.get('/', async (req, res) => {

  // Carga un curso junto con sus temas
  const curso = await Curso.findOne({
    include: [{
      model: Tema,
      as: "temas"
    }]
  });
  console.log("Carga de la página principal");
  res.render('ver-teoria-curso', { curso: curso });

});

// Procesa el intento de una pregunta de un test
app.post('/intento-test/:idIntentoTest/pregunta/:idPregunta/intento-pregunta', async (req, res, next) => {
  try {
    console.log(JSON.stringify(req.body));
    const intento = {
      idPregunta: req.params.idPregunta, // Rescatamos :idPregunta de la URL
      idRespuesta: req.body.idRespuesta, // Rescatamos el id de la respuesta seleccionada del cuerpo de la petición
      idIntentoTest: req.params.idIntentoTest // Rescatamos :idIntentoTest de la URL
    }
    // Delegamos a la capa de servicio
    const preguntaCorregida = await servicioIntento.anyadirIntento(intento);
    console.log(JSON.stringify(preguntaCorregida));
    res.status(200).send(preguntaCorregida); // Provisional. Cambiar por render
    // res.render('pregunta-test', { preguntaCorregida: preguntaCorregida, sol: true }); // sol: true, pregunta corregida
  } catch (error) {
    next(error); // Llamamos al (middleware) manejador de errores/excepciones
  }
})


// Ruta para mostrar la página de pregunta-test.ejs
app.get('/obtenerPreguntasTest', (req, res) => {
  //se llamará cuando se implemente la vista intermedia entre el botón realizar test
  console.log("GET /pregunta");
  res.render('pregunta-test', { sol: false });
});


app.get('/test/:idTest/preguntas/:numeroPregunta/retroalimentacion', async (req, res) => {

  // ### Con Sequelize (y manejo de excepciones) ###
  try {
    // Obtenemos la pregunta, junto con sus respuestas, por id
    const test = await Test.findByPk(req.params.idTest, {
      include: [{
        model: Pregunta, // Indicamos que carge las preguntas
        as: "preguntas", // Indicamos el nombre que tendrá la lista de preguntas en el objeto test
        where: {
          numero: req.params.numeroPregunta // Que solo carge la pregunta con el numero indicado
        },
        include: [{
          model: Respuesta, // Indicamos que carge las respuestas
          as: "respuestas" // Indicamos el nombre que tendrá la lista de respuestas en el objeto pregunta
        }]
      }]
    });

    console.log(JSON.stringify(test));
    
    // Debería ir en el servicio (para testearlo)
    if (!test) {
      // Si el idTest proporcionado no se corresponde con ningun test, lanzamos una excepcion
      throw new PreguntaNoEncontradaError(req.params.idPregunta);
    }
    
    // Ya tienes la pregunta con retroalimentacion
    res.render('pregunta-test', {
      test,
      sol: true,
    });
    
  } catch (error) {
    next(manejadorErrores);
  }
  
});



app.get('/vista-test', (req, res) => {
  console.log("GET /vista-test");

  console.log("Carga de la página para ver test");
  res.render('vista-test');


});

//ver informacion entes de realizar test
app.get('/previsualizacion-de-test', (req, res) => {

  //Renderizar los datos (idTest, intentosRealizados, fecha intentos, preguntas acertadas, preguntas totales, puntuacion sobre 10)
  const idCurso = req.query.idCurso;

  //Seleccionamos el test del curso y los intentos asociados a ese test
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
      res.render('previsualizar-test', { idTest: idTest, tituloTest: test.titulo, numIntentos: resultsIntentos.length, intentos: resultsIntentos, preguntasAcertadas: test.preguntasAcertadas });
    });
  });
});




//ver test
app.get('/obtener-preguntas-test/:idTest/:numeroPregunta', (req, res) => {
  const { idTest, numeroPregunta } = req.params; // El ID del test y el numero de la pregunta lo envías desde el url

  if (!idTest) {
    return res.status(400).json({ error: "El idTest es obligatorio" });
  }

  let offset = parseInt(numeroPregunta, 10);
  if (isNaN(offset)) offset = 0;
  const consultaPreguntas = `SELECT
    p.id AS idPregunta,
    p.enunciado,
    p.retroalimentacion, 
    o.idOpcion, 
    o.respuesta1, 
    o.respuesta2, 
    o.respuesta3, 
    o.respuesta4, 
    r.respuestaCorrecta
    FROM Preguntas p 
    JOIN Respuestas r ON p.id = r.idPregunta 
    JOIN Opciones o ON r.idOpcion = o.idOpcion 
    WHERE p.idTest = ? 
    ORDER BY p.id 
    LIMIT 1 OFFSET ?;`;

  pool.query(consultaPreguntas, [idTest, offset], (err, results) => {
    if (err) {
      console.error('Error en la consulta de preguntas:', err);
      return res.status(500).send('Error interno del servidor');
    }

    // Si no hay preguntas para el test, renderizamos con un mensaje vacío
    if (results.length === 0) {
      return res.render('pregunta-test', { preguntas: [], mensaje: 'No hay preguntas disponibles para este test.' });
    }

    // Extraemos la pregunta que se mostrará
    const pregunta = results[0];

    // Renderizar la vista 'ver-test' pasando la lista de preguntas con sus respuestas
    res.render('pregunta-test', { pregunta, sol: false, idTest, numeroPregunta: offset });

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

// Añadimos el manejador de errores/excepciones
app.use(manejadorErrores);

// Poblamos y sincronizamos la base de datos con el modelo
seedDatabase();

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
