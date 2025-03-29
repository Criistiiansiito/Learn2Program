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
var cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const Recordatorio = require('./modelos/Recordatorios');

const enviarRecordatorio=require("./servicios/enviarRecordatorio");
enviarRecordatorio("test@email.com", "Asunto de prueba", "Mensaje de prueba");

/*async function enviarRecordatorio(email, asunto, mensaje) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', //Recordad que las variables del correo tienen que estar en el .env para evitar exponer la contraseña del correo
        auth: {
            user: process.env.GMAIL_USER, 
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: asunto,
        text: mensaje
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Recordatorio enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}*/

// Función que envía y elimina los recordatorios
async function enviarRecordatorios() {
    try {

        const fechaActual = new Date().toISOString().split('T')[0]; 

        // Buscamos si ya recordatorios para hoy
        const recordatorios = await Recordatorio.findAll({
            where: {
                fecha: fechaActual
            }
        });

        if (recordatorios.length > 0) {
            for (const recordatorio of recordatorios) {
                await enviarRecordatorio(
                    recordatorio.email,
                    recordatorio.asunto,
                    recordatorio.mensaje
                );
                // Eliminar el recordatorio de la bbdd
                await recordatorio.destroy();
                console.log(`Recordatorio enviado y eliminado para ${recordatorio.email}`);
            }
        }
    } catch (error) {
        console.error('Error al enviar o eliminar recordatorios:', error);
    }
}

// Esto se ejecuta cada 24 horas y lo que hace es que revisa si hay recordatorios que enviar ese día, y si los hay los envía y los borra de la base de datos
setInterval(enviarRecordatorios, 10 * 1000); // 24 horas

const app = express();
const port = 3000;
const session = require('express-session'); 

const bcrypt = require('bcrypt');
const Usuario = require('./modelos/Usuario');

app.use(session({
  secret: 'mi_clave_secreta',  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }    
}));

// Middleware para pasar información de la sesión a la vista
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;  // Pasa el usuario actual a las vistas
  next();
});

//Variable que almancenará el idCurso durante toda la ejecucion
app.locals.idCurso = 1;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// sirve para que en tiempo de ejecución el servidor sepa acceder a la carpeta public para imagenes, etc
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/inicio-sesion', async (req, res) => {
  console.log("Carga de la página principal");
  res.render('inicio-sesion');
});

app.post('/login', async (req, res) => {
  try {
    const correo = req.body.correo;
    const password = req.body.password;
 
    const user = await Usuario.findOne({ where: { correo: correo } });

    if (!user) {
      return res.status(400).json({ message_error: '¡No hay ninguna cuenta con este correo!' });
    }

    // Comparamos las contraseñas
    const isMatch = await bcrypt.compare(password, user.contraseña); 
    if (!isMatch) {
      return res.status(400).json({ message_error: 'Contraseña incorrecta' });
    }

    // Guardar la información del usuario en la sesión
    req.session.user = {
      id: user.id,
      correo: user.correo,  
      password: user.contraseña,
    };

    console.log(`Usuario autenticado: ${req.session.user.correo}`);

    res.json({ success: true, redirect: '/' });

  } catch (err) {
    console.error('Error en el inicio de sesión:', err);
    res.status(500).json({ message_error: 'Error interno del servidor' });
  }
});


//HASTA AQUI LO NUEVO

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
    const idUsuario = req.session.user?.id;

    console.log("ID del usuario:", idUsuario);
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
    const intentosUsuario = intentos.filter(i => i.idUsuario === idUsuario);
    const preguntasAcertadas = intentosUsuario.length > 0 ? intentosUsuario[0].preguntasAcertadas : 0; // Evita errores si no hay intentos

    // Renderizar la vista con los datos (incluso si no hay intentos)
    res.render('previsualizar-test', {
      idTest: curso.test.id,
      tituloTest: curso.test.titulo,
      numIntentos: intentos.length,
      intentos: intentosUsuario,
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
