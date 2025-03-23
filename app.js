require('dotenv').config();
// Importar dependencias
const express = require('express');
const path = require('path');
const servicioIntento = require('./servicios/servicioIntento');
const Curso = require('./modelos/Curso');
const Tema = require('./modelos/Tema');
const manejadorErrores = require('./middleware/manejadorErrores');
const seedDatabase = require('./database/seed');
const StatusCodes = require('http-status-codes');

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

// Ruta principal (de momento se quedará así para la primera historia de usuario)
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
    res.render('pregunta-test', { preguntaCorregida: preguntaCorregida, sol: true }); // sol: true, pregunta corregida
  } catch (error) {
    next(error); // Llamamos al (middleware) manejador de errores/excepciones
  }
})

// Añadimos el manejador de errores
app.use(manejadorErrores);

// Poblamos y sincronizamos la base de datos con el modelo
seedDatabase();

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
