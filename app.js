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
          res.render('obtencion-logros', { logro: logro, nota: nota,
            nombreCurso: results2[0]?.nombre || 'Curso Desconocido' 
          });
        });
      });
    });
  });
});


// Iniciar el servidor en el puerto
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
