require('dotenv').config();
// Importar dependencias
const express = require('express');
const path = require('path');
const servicioIntento = require('./servicios/servicioIntento');
const Curso = require('./modelos/Curso');
const Tema = require('./modelos/Tema');
const Test = require('./modelos/Test');
const manejadorErrores = require('./middleware/manejadorErrores');
const seedDatabase = require('./database/seed');
const IntentoTest = require('./modelos/IntentoTest');
const moment = require('moment');
const Pregunta = require('./modelos/Pregunta');

const app = express();

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

    // Obtenemos todas las preguntas asociadas a este test, mediante las relaciones intentoTest-Test y Test-Preguntas 
    const intentoTestAux = await IntentoTest.findByPk(idIntentoTest, {
      include: [
        {
          model: Test,
          as: 'test', 
          include: [
            {
              model: Pregunta,
              as: 'preguntas',  
              order: [['numero', 'ASC']] 
            }
          ]
        }
      ]
    });

    const numeroPreguntas = intentoTestAux.test.preguntas.length;

    res.render('pregunta-test', { intentoTest, numeroPreguntas});
  } catch (error) {
    next(error);
  }
});

// Procesa el intento de una pregunta de un test
app.post('/intento-test/:idIntentoTest/pregunta/:numeroPregunta/intento-pregunta', async (req, res, next) => {
  try {
    const idIntentoTest = req.params.idIntentoTest; // Rescatamos :idIntentoTest de la URL
    const numeroPregunta = req.params.numeroPregunta; // Rescatamos :numeroPregunta de la URL
    const idRespuesta = req.body.idRespuesta; // Rescatamos el id de la respuesta seleccionada del cuerpo de la petición
    // Delegamos a la capa de servicio
    await servicioIntento.intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta);
    res.redirect(`/intento-test/${idIntentoTest}/pregunta/${numeroPregunta}/intento-pregunta`);
  } catch (error) {
    next(error); // Llamamos al (middleware) manejador de errores/excepciones
  }
});

// Comienza un intento de test
app.post('/test/:idTest/intento-test', async (req, res, next) => {
  try {
    const idIntentoTest = await servicioIntento.intentarTest(req.params.idTest);
    res.redirect(`/intento-test/${idIntentoTest}/pregunta/1/intento-pregunta`)
  } catch (error) {
    next(error);
  }
});

// Termina un intento de test
app.patch('/intento-test/:idIntentoTest/terminar-intento', async (req, res, next) => {
  try {
    const idIntentoTest = req.params.idIntentoTest;
    
    // Llamamos a la función del servicio para obtener el intento de test
    const idCurso = await servicioIntento.terminarIntento(idIntentoTest);
    res.json({ redirectUrl: `/previsualizacion-de-test?idCurso=${idCurso}` });
  } catch (error) {
    next(error);
  }
});



app.get('/nuevo-recordatorio', (req, res) => {
  res.render("establecer-recordatorio");
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

    console.log("Curso encontrado:", JSON.stringify(curso));

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

app.get('/obtener-logro-curso', (req, res) => {

  const consultarTestId = 'SELECT id from test where idCurso = ?;';
  pool.query(consultarTestId, [app.locals.idCurso], (err, results) => {
    if (err) {
      console.error('Error en la consulta del id test:', err);
      return res.status(500).send('Error interno del servidor');
    }
    let testId = results[0];

    const consultaIntentos = 'SELECT * FROM intentos WHERE idTest = ?;';
    pool.query(consultaIntentos, [testId], (err, resultsIntentos) => {
      if (err) {
        console.error('Error en consulta de intentos:', err);
        return;
      }
      let intento = resultsIntentos[0];
      let nota = intento.nota;

      console.log(nota);
      //a partir d aqui lo que ya estaba

      const consultarLogro = 'SELECT * FROM LOGROS WHERE idCurso = ?;';
      pool.query(consultarLogro, [app.locals.idCurso], (err, results) => {
        if (err) {
          console.error('Error en la consulta de logros:', err);
          return res.status(500).send('Error interno del servidor');
        }

        let logro = results[0];

        // Formatear la fecha de obtención del logro
        if (logro && logro.fechaObtencion) {
          logro.fechaObtencion = moment(logro.fechaObtencion).format('DD-MM-YYYY');
        }
        console.log(logro);
        const consultarNombreCurso = 'SELECT nombre FROM cursos WHERE id = ?;';
        pool.query(consultarNombreCurso, [app.locals.idCurso], (err, results2) => {
          if (err) {
            return res.status(500).send('Error al obtener los datos: ' + err.message);
          }

          console.log('p3');
          res.render('obtencion-logros', {
            logro: logro, nota: nota,
            nombreCurso: results2[0]?.nombre || 'Curso Desconocido'
          });
        });
      });
    });
  });
});


// Añadimos el manejador de errores/excepciones
app.use(manejadorErrores);

// Poblamos y sincronizamos la base de datos con el modelo
seedDatabase();

module.exports = app;
