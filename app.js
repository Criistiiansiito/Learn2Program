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
const moment = require('moment');
const Pregunta = require('./modelos/Pregunta');
const StatusCodes = require('http-status-codes');
const { PreguntaNoEncontradaError } = require('./utils/errores');
const { off } = require('process');  
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const Recordatorio = require('./modelos/Recordatorios');

const enviarRecordatorio=require("./servicios/enviarRecordatorio");
enviarRecordatorio("test@email.com", "Asunto de prueba", "Mensaje de prueba");

// Función que envía y elimina los recordatorios
async function enviarRecordatorios() {
    try {
  // Obtener la fecha y hora actuales en la zona horaria local
const ahora = new Date();
const offsetHoras = ahora.getTimezoneOffset() / -60; // Ajuste de zona horaria

// Sumar 2 horas adicionales
ahora.setHours(ahora.getHours() + offsetHoras + 2); // Aplica la diferencia horaria y suma 2 horas

const fechaHoraActualLocal = ahora.toISOString().slice(0, 16) + ":00"; // Formato YYYY-MM-DD HH:mm:00

console.log("Buscando recordatorios para:", fechaHoraActualLocal);

// Buscar los recordatorios con la fecha y hora exacta
const recordatorios = await Recordatorio.findAll({
    where: {
        fecha: fechaHoraActualLocal
    }
});

if (recordatorios.length > 0) {
    for (const recordatorio of recordatorios) {
        await enviarRecordatorio(
            recordatorio.email,
            recordatorio.asunto,
            recordatorio.mensaje
        );
        // Eliminar el recordatorio de la base de datos
        await recordatorio.destroy();
        console.log(`Recordatorio enviado y eliminado para ${recordatorio.email}`);
    }
}

    } catch (error) {
        console.error('Error al enviar o eliminar recordatorios:', error);
    }
}

if (process.env.NODE_ENV !== "test") {
  setInterval(enviarRecordatorios, 10 * 1000);
}

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
    res.json({ redirectUrl: `/logro-curso/${idIntentoTest}` });

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
    
    // Pasar el idIntentoTest a la vista
    res.render('obtencion-logros', {
      idIntentoTest: req.params.idIntentoTest, // Pasa el ID aquí
      nombreCurso: intento.test.curso.titulo,
      nota: intento.nota,
      fecha: intento.fechaFin,
      logro: intento.test.curso.logro,
    });
  } catch (error) {
    next(error);
  }
});

// Termina un intento de test
app.patch('/logro-curso/:idIntentoTest/volver',  async (req, res, next) => {
  try {
    const idIntentoTest = req.params.idIntentoTest;
    // Llamamos a la función del servicio para obtener el intento de test
    const idCurso = await servicioIntento.terminarIntento(idIntentoTest);
    res.json({ redirectUrl: `/previsualizacion-de-test?idCurso=${idCurso}` });

  } catch (error) {
    next(error);
  }
});

app.get('/establecer-recordatorio', (req, res) => {
  res.render('establecer-recordatorio', { 
    mensajeError: null, 
    mensajeExito: null 
  });
});

app.post('/crear-recordatorio', (req, res) => {
  const { fecha, email, mensaje, asunto, time } = req.body;

  // Mostrar los datos recibidos para verificar
  console.log(fecha);
  console.log(time);
  console.log(email);
  console.log(mensaje);
  console.log(asunto);

  // Validar que todos los campos estén completos
  if (!fecha || !time || !email || !mensaje || !asunto) {
    return res.render('establecer-recordatorio', {
      mensajeError: 'Todos los campos son obligatorios.',
      mensajeExito: null
    });
  }
  const [hora, minutos] = time.split(":").map(Number);
  const fechaPartes = fecha.split("-").map(Number);
  
  let fechaHoraSeleccionada = new Date(
    Date.UTC(fechaPartes[0], fechaPartes[1] - 1, fechaPartes[2], hora, minutos) 
  );
  
  // Convertimos la fecha a la hora de Madrid
  fechaHoraSeleccionada = new Date(
    fechaHoraSeleccionada.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
  );
  
  console.log("Fecha seleccionada en España:", fechaHoraSeleccionada);
  
  // Obtener la fecha y hora actual
  const fechaHoy = new Date(); // Obtiene la fecha y hora actual

  // Validar que la fecha no sea del pasado
  if (fechaHoraSeleccionada < fechaHoy) {
    return res.render('establecer-recordatorio', {
      mensajeError: 'La fecha no puede ser del pasado.',
      mensajeExito: null
    });
  }

  // Crear el recordatorio en la base de datos
  Recordatorio.create({
    fecha: fechaHoraSeleccionada, // Guardar la fecha y hora completa
    email,
    mensaje,
    asunto
  })
    .then(() => {
      // Si el recordatorio se crea bien, renderiza la página con mensaje de éxito
      return res.render('establecer-recordatorio', {
        mensajeError: null,
        mensajeExito: 'Recordatorio creado exitosamente.'
      });
    })
    .catch((error) => {
      console.error('Error al crear recordatorio:', error);
      // Si ocurre un error, renderiza la vista con mensaje de error
      return res.render('establecer-recordatorio', {
        mensajeError: 'Hubo un problema al crear el recordatorio. Intenta de nuevo.',
        mensajeExito: null
      });
    });
});

// Añadimos el manejador de errores/excepciones
app.use(manejadorErrores);

// Poblamos y sincronizamos la base de datos con el modelo
seedDatabase();

module.exports = app;

