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
const IntentoTest = require('./modelos/IntentoTest');

const manejadorErrores = require('./middleware/manejadorErrores');
const seedDatabase = require('./database/seed');
const StatusCodes = require('http-status-codes');
const { PreguntaNoEncontradaError } = require('./utils/errores');
const { off } = require('process');
const moment = require('moment');  
const pool = require('./database/connection');


const app = express();
const port = 8080;

//Variable que almancenará el idCurso durante toda la ejecucion
app.locals.idCurso = 1;

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

app.get('/intento-test/:idIntentoTest/pregunta/:numeroPregunta/intento-pregunta', async (req, res, next) => {
  try {
    const idIntentoTest = req.params.idIntentoTest; // Rescatamos :idIntentoTest de la URL
    const numeroPregunta = req.params.numeroPregunta; // Rescatamos :numeroPregunta de la URL
    const intentoTest = await servicioIntento.obtenerIntentoPregunta(idIntentoTest, numeroPregunta);
    res.render('pregunta-test', { intentoTest });
  } catch (error) {
    next(error);
  }
});

// Procesa el intento de una pregunta de un test
app.post('/intento-test/:idIntentoTest/pregunta/:numeroPregunta/intento-pregunta', async (req, res, next) => {
  try {
    console.log(JSON.stringify(req.body));
    const idIntentoTest = req.params.idIntentoTest; // Rescatamos :idIntentoTest de la URL
    const numeroPregunta = req.params.numeroPregunta; // Rescatamos :numeroPregunta de la URL
    const idRespuesta = req.body.idRespuesta; // Rescatamos el id de la respuesta seleccionada del cuerpo de la petición
    // Delegamos a la capa de servicio
    const intentoTest = await servicioIntento.intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta);
    console.log(JSON.stringify(intentoTest));
    res.render('pregunta-test', { intentoTest });
  } catch (error) {
    next(error); // Llamamos al (middleware) manejador de errores/excepciones
  }
});


app.get('/nuevo-recordatorio', (req, res) => {
  res.render("establecer-recordatorio");
});

// Ruta para mostrar la página de pregunta-test.ejs
app.get('/obtenerPreguntasTest', (req, res) => {
  //se llamará cuando se implemente la vista intermedia entre el botón realizar test
  console.log("GET /pregunta");
  res.render('pregunta-test', { sol: false });
});

app.get('/vista-test', (req, res) => {
  console.log("GET /vista-test");

  console.log("Carga de la página para ver test");
  res.render('vista-test');


});

// Ver información antes de realizar el test
app.get('/previsualizacion-de-test', async (req, res) => {
  try {
    // Obtener el ID del curso desde la URL
    const idCurso = req.query.idCurso;
    console.log("ID del curso recibido:", idCurso);

    if (!idCurso) {
      return res.status(400).send("Error: Debes proporcionar un ID de curso.");
    }

    // Buscar el curso en la base de datos con sus relaciones
    const curso = await Curso.findByPk(idCurso, {
      include: [{
        model: Test,
        as: "test",
        include: [{
          model: IntentoTest,
          as: "intentos"
        }]
      }]
    });

    console.log("Curso encontrado:", curso);

    // Si no se encuentra el curso, devolver error
    if (!curso) {
      return res.status(404).send("Error: No se encontró un curso con ese ID.");
    }

    // Si el curso no tiene test, devolver error
    if (!curso.test) {
      return res.status(404).send("Error: El curso no tiene un test asociado.");
    }

    // Manejo seguro de intentos
    const intentos = curso.test.intentos || []; // Si intentos es null, se asigna un array vacío
    const preguntasAcertadas = intentos.length > 0 ? intentos[0].preguntasAcertadas : 0; // Evita errores si no hay intentos

    // Renderizar la vista con los datos (incluso si no hay intentos)
    res.render('previsualizar-test', { 
      idTest: curso.test.id, 
      tituloTest: curso.test.titulo, 
      numIntentos: intentos.length, 
      intentos: intentos, 
      preguntasAcertadas: preguntasAcertadas 
    });

  } catch (error) {
    console.error("Error en /previsualizacion-de-test:", error);
    res.status(500).send("Error interno del servidor.");
  }
});


//ver test
app.get('/obtener-preguntas-test/:idTest/:numeroPregunta', async (req, res) => {
  const { idTest, numeroPregunta } = req.params; // El ID del test y el numero de la pregunta lo envías desde el url

  if (!idTest) {
    return res.status(400).json({ error: "El idTest es obligatorio" });
  }

  let offset = parseInt(numeroPregunta, 10);
  if (isNaN(offset)) offset = 0;
  const preguntas = await Pregunta.findAll({
    where: {
      idTest: idTest,
      numero: offset
    }
  });

  if (preguntas.length === 0) {
    return res.render('pregunta-test', { preguntas: [], mensaje: 'No hay preguntas disponibles para este test.' });
  }
  const pregunta = preguntas[0];

  res.render('pregunta-test', { pregunta, sol: false, idTest, numeroPregunta: offset });

});

// Añadimos el manejador de errores/excepciones
app.use(manejadorErrores);

// Poblamos y sincronizamos la base de datos con el modelo
seedDatabase();


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
  const idCurso=req.body.idCurso;

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




app.get('/obtener-logro-curso', (req, res) => {
  // Obtener el id del test asociado al curso
  pool.query(
    'SELECT id FROM test WHERE idCurso = :idCurso',
    { 
      replacements: { idCurso: app.locals.idCurso },
      type: pool.QueryTypes.SELECT 
    })
    .then(testResults => {
      if (testResults.length === 0) {
        return res.render('error', { mensaje: 'No se encontró un test para este curso' });
      }
      const testId = testResults[0].id;

      // Obtener el último intento del test
      pool.query(
        'SELECT * FROM intentos_test WHERE idTest = :testId ORDER BY fechaFin DESC LIMIT 1',
        { 
          replacements: { testId: testId },
          type: pool.QueryTypes.SELECT 
        })
        .then(intentosResults => {
          if (intentosResults.length === 0) {
            return res.render('error', { mensaje: 'No se encontraron intentos para este test' });
          }
          const intento = intentosResults[0];
          const nota = intento.preguntasAcertadas;

          // Obtener el logro asociado al curso
          pool.query(
            'SELECT * FROM logros WHERE idCurso = :idCurso',
            { 
              replacements: { idCurso: app.locals.idCurso },
              type: pool.QueryTypes.SELECT 
            })
            .then(logrosResults => {
              if (logrosResults.length === 0) {
                return res.render('error', { mensaje: 'No se encontraron logros para este curso' });
              }
              let logro = logrosResults[0];

              // Formatear la fecha de obtención del logro
              if (logro.fechaObtencion) {
                logro.fechaObtencion = moment(logro.fechaObtencion).format('DD-MM-YYYY');
              }

              // Obtener el nombre del curso
              pool.query(
                'SELECT titulo FROM cursos WHERE id = :idCurso',
                { 
                  replacements: { idCurso: app.locals.idCurso },
                  type: pool.QueryTypes.SELECT 
                })
                .then(cursoResults => {
                  const nombreCurso = cursoResults.length > 0 ? cursoResults[0].titulo : 'Curso Desconocido';

                  // Renderizar la vista con los datos obtenidos
                  res.render('obtencion-logros', { 
                    logro, 
                    nota, 
                    nombreCurso 
                  });
                })
                .catch(err => {
                  console.error('Error en la consulta del curso:', err);
                  return res.render('error', { mensaje: 'Error interno del servidor' });
                });
            })
            .catch(err => {
              console.error('Error en la consulta de logros:', err);
              return res.render('error', { mensaje: 'Error interno del servidor' });
            });
        })
        .catch(err => {
          console.error('Error en la consulta de intentos:', err);
          return res.render('error', { mensaje: 'Error interno del servidor' });
        });
    })
    .catch(err => {
      console.error('Error en la consulta del test:', err);
      return res.render('error', { mensaje: 'Error interno del servidor' });
    });
});


// Iniciar el servidor en el puerto
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
