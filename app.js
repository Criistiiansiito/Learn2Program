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
const { off } = require('process');
const IntentoTest = require('./modelos/IntentoTest');

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

//ver informacion entes de realizar test
app.get('/previsualizacion-de-test', async (req, res) => {

  //Renderizar los datos (idTest, intentosRealizados, fecha intentos, preguntas acertadas, preguntas totales, puntuacion sobre 10)
  const idCurso = req.query.idCurso;

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
  res.render('previsualizar-test', { idTest: curso.test.id, tituloTest: curso.test.titulo, numIntentos: curso.test.intentos.length, intentos: curso.test.intentos, preguntasAcertadas: curso.test.intentos[0].preguntasAcertadas });

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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
