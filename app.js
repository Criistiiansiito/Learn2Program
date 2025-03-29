require('dotenv').config();
// Importar dependencias
const express = require('express');
const path = require('path');
const servicioIntento = require('./servicios/servicioIntento');
const servicioLogro = require('./servicios/servicioLogro');
const Curso = require('./modelos/Curso');
const Tema = require('./modelos/Tema');
const Test = require('./modelos/Test');
const IntentoTest = require('./modelos/IntentoTest');

const manejadorErrores = require('./middleware/manejadorErrores');
const seedDatabase = require('./database/seed');

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
    res.render('pregunta-test', { intentoTest });
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
    const idCurso = await servicioIntento.terminarIntento(req.params.idIntentoTest);
    res.redirect(`/previsualizacion-de-test?idCurso=${idCurso}`);
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

app.get('/logro-curso/:idIntentoTest', async (req, res, next) => {
  try {
    const intento = await servicioLogro.ObtenerLogro(req.params.idIntentoTest);
    
    console.log(JSON.stringify(intento));
  
    res.render('obtencion-logros', {
      nombreCurso: intento.test.curso.nombre,
      nota: intento.nota,
      logro: intento.test.curso.logro,
    }); 
  } catch (error) {
    next(error);
  }
});

// Añadimos el manejador de errores/excepciones
app.use(manejadorErrores);

// Poblamos y sincronizamos la base de datos con el modelo
seedDatabase();

module.exports = app;
