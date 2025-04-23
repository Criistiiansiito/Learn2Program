require('dotenv').config();
// Importar dependencias
const express = require('express');
const path = require('path');
const servicioIntento = require('./servicios/servicioIntento');
const servicioLogro = require('./servicios/servicioLogro');
const Curso = require('./modelos/Curso');
const Tema = require('./modelos/Tema');

const manejadorErrores = require('./middleware/manejadorErrores');
const seedDatabase = require('./database/seed');
const moment = require('moment');  
var cookieParser = require('cookie-parser');
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

setInterval(enviarRecordatorios, 10 * 1000);

const app = express();
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

// Cuando no se pone ninguna ruta, se redirige automaticamente al inicio de sesión, actuando como página principal.
app.get('/', async (req, res) => {
  console.log("Carga de la página de inicio de sesión");
  
  // Cogemos mensaje de la sesion si lo hay
  //Esto se usa por ejemplo cuando haya un registro exitoso, este es el mensaje que se mostrará en verde.
  const message = req.session.message || '';

  // Lo eliminamos para que si recargamos no salga
  delete req.session.message;
  res.render('inicio-sesion', { message });
});

//Maneja la petición para mostrar la vista del formulario de inicio de sesión
app.get('/inicio-sesion', async (req, res) => {
  console.log("Carga de la página de inicio de sesión");

  // Cogemos mensaje de la sesion si lo hay
  const message = req.session.message || '';

  // Lo eliminamos para que si recargamos no salga
  delete req.session.message;
  res.render('inicio-sesion', { message });
});

// Maneja el formulario de inicio de sesión de un usuario existente, y muestra mensajes de alerta en caso de haber error,
// y en caso de exito redirije a la vista de la teoría del curso que tenemos actualmente.
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

    res.json({ success: true, redirect: '/ver-teoria-curso' });

  } catch (err) {
    console.error('Error en el inicio de sesión:', err);
    res.status(500).json({ message_error: 'Error interno del servidor' });
  }
});

//Maneja la petición para mostrar la vista del formulario de registro
app.get('/registro', async (req, res) => {
  console.log("Carga de la página de registro");
  res.render('registro');
});

// Maneja el formulario de registro de un nuevo usuario, y muestra mensajes de alerta en caso de haber error
// y en caso de exito redirije a la vista de inicio de sesión, mostrando un mensaje de registro exitoso.
app.post('/register', async (req, res) => {
  try {
    const correo = req.body.correo;
    const password = req.body.password;

    // Para poder validar el correo y que sea con una terminacion válida
    const correoValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|es|org|net)$/;

    if (!correoValido.test(correo)) {
      return res.status(400).json({
        success: false,
        message_error: 'Introduce un correo válido (ejemplo: usuario@dominio.com, .es ...)'
      });
    }

    // Verificar si ya existe el usuario
    const usuarioExistente = await Usuario.findOne({ where: { correo } });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message_error: '¡Ese usuario ya está registrado! Inicia sesión para acceder a la teoría.'
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await Usuario.create({
      correo: correo,
      contraseña: hashedPassword,
    });

    req.session.message = '¡Registro completado! Inicia sesión para acceder a la teoría.';
    res.json({ success: true, redirect: '/inicio-sesion' });

  } catch (err) {
    console.error('Error en el registro:', err);
    res.status(500).json({ message_error: 'Error interno del servidor' });
  }
});

//Ver teoria curso
app.get('/ver-teoria-curso', async (req, res) => {

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
    const idIntentoTest = await servicioIntento.intentarTest(req.params.idTest, req.session.user.id);
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
app.get('/curso/:idCurso/previsualizacion-de-test', async (req, res, next) => {
  try {
    const curso = await servicioIntento.obtenerIntentosTest(req.params.idCurso);
    const idUsuario=req.session.user?.id;
    let intentosPorUsuario=curso.test.intentos;

    if(idUsuario){
      intentosPorUsuario=curso.test.intentos.filter(intento=>intento.idUsuario===idUsuario);
    }
    // Renderizar la vista con los datos (incluso si no hay intentos)
    res.render('previsualizar-test', {
      idTest: curso.test.id,
      tituloTest: curso.test.titulo,
      numIntentos: intentosPorUsuario.length,
      intentos: intentosPorUsuario,
    });

  } catch (error) {
    next(error);
  }
});

app.get('/logro-curso/:idIntentoTest', async (req, res, next) => {
  try {
    const intento = await servicioLogro.ObtenerLogro(req.params.idIntentoTest);
    const idUsuario=req.session.user?.id;
    const idLogro=intento.test.curso.logro.id;
    // Pasar el idIntentoTest a la vista
    
    if (intento.nota >= 5 && idUsuario) {
      await LogroUsuario.findOrCreate({
        where: {
          idUsuario: idUsuario,
          idLogro: idLogro
        },
        defaults: {
          fecha: new Date()
        }
      });
    }
    
    res.render('obtencion-logros', {
      idIntentoTest: req.params.idIntentoTest, // Pasa el ID aquí
      nombreCurso: intento.test.curso.titulo,
      idCurso: intento.test.curso.id,
      nota: intento.nota,
      fecha: intento.fechaFin,
      logro: intento.test.curso.logro,
    });
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



