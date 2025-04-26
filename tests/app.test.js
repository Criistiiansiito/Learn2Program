const app = require('../app');
const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const MENSAJES = require('../utils/mensajes');
const bcrypt = require('bcrypt');
const Usuario = require('../modelos/Usuario');
const Pregunta = require('../modelos/Pregunta');
const IntentoTest = require('../modelos/IntentoTest');
const IntentoPregunta = require('../modelos/IntentoPregunta');

beforeAll((done) => {
    server = app.listen(0, () => { // Usamos 0 para que el SO asigne un puerto libre
        console.log('Test server running');
        done();
    });
});

afterAll((done) => {
    server.close(done); // Cerramos la conexión al terminar los test
});

describe("POST /test/:idTest/intento-test", () => {
    let usuario;
    let cookie;

    beforeAll(async () => {
        const correo = 'email@email.com';
        const contrasena = 'password';
        usuario = await Usuario.create({ correo: correo, contraseña: await bcrypt.hash(contrasena, 10) });
        const loginResponse = await request(app)
            .post('/login')
            .send({ correo: correo, password: contrasena });
        cookie = loginResponse.headers['set-cookie'];
    });

    afterAll(async () => {
        await usuario.destroy();
    });

    test("Deberia devolver Moved Temporarily", async () => {
        // ## Given ##
        const idTest = 1;
        // ## When ##
        const response = await request(app).post(`/test/${idTest}/intento-test`).set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("Deberia devolver Not Found", async () => {
        // ## Given ##
        const idTest = 99;
        // ## When ##
        const response = await request(app)
            .post(`/test/${idTest}/intento-test`)
            .set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.TEST_NO_ENCONTRADO(idTest));
    });

});

describe("PATCH /intento-test/:idIntentoTest/terminar-intento", () => {
    let usuario;
    let cookie;

    beforeAll(async () => {
        const correo = 'email@email.com';
        const contrasena = 'password';
        usuario = await Usuario.create({ correo: correo, contraseña: await bcrypt.hash(contrasena, 10) });
        const loginResponse = await request(app)
            .post('/login')
            .send({ correo: correo, password: contrasena });
        cookie = loginResponse.headers['set-cookie'];
    });

    afterAll(async () => {
        await usuario.destroy();
    });

    afterEach(async () => {
        await IntentoTest.destroy({ where: {} });
    });

    test("Deberia devolver finalizar un intento de test y redirigir correctamente", async () => {
        // ## Given ##
        const intentoTest = await IntentoTest.create(
            {
                preguntasIntentadas: 1,
                terminado: false,
                idUsuario: usuario.id,
                idTest: 1,
                intentos_pregunta: [{}]
            },
            {
                include: [{
                    model: IntentoPregunta,
                    as: "intentos_pregunta"
                }]
            }
        );
        // ## When ##
        const response = await request(app)
            .patch(`/intento-test/${intentoTest.id}/terminar-intento`)
            .set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.redirectUrl).toBe(`/logro-curso/${intentoTest.id}`);
        const intentoActulizado = await IntentoTest.findByPk(intentoTest.id);
        expect(intentoActulizado.terminado).toBe(true);
        expect(intentoActulizado.fecha).not.toBeNull();
    });

    test("Debe devolver Not Found cuando el ID de intento de test no existe", async () => {
        // ## Given ##
        const idIntentoTest = 99; // ID que no existe en la BD
        // ## When ##
        const response = await request(app)
            .patch(`/intento-test/${idIntentoTest}/terminar-intento`)
            .set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND); // Esperamos que el status sea 404
        expect(response.text).toBe(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idIntentoTest)); // Esperamos el mensaje correcto
    });

    test("Deberia devolver 409 cuando no se hayan intentado todas las preguntas", async () => {
        // ## Given ##
        const intentoTest = await IntentoTest.create(
            {
                terminado: false,
                idUsuario: usuario.id,
                idTest: 1,
                intentos_pregunta: [{}]
            },
            {
                include: [{
                    model: IntentoPregunta,
                    as: "intentos_pregunta"
                }]
            }
        );
        // ## When ##
        const response = await request(app)
            .patch(`/intento-test/${intentoTest.id}/terminar-intento`)
            .set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.CONFLICT);
        expect(response.text).toBe(MENSAJES.PREGUNTA_SIN_RESPONDER(intentoTest.id));
    });

});

describe("GET /logro-curso/:idIntentoTest", () => {
    let usuario;
    let cookie;

    beforeAll(async () => {
        const correo = 'email@email.com';
        const contrasena = 'password';
        usuario = await Usuario.create({ correo: correo, contraseña: await bcrypt.hash(contrasena, 10) });
        const loginResponse = await request(app)
            .post('/login')
            .send({ correo: correo, password: contrasena });
        cookie = loginResponse.headers['set-cookie'];
    });

    afterAll(async () => {
        await usuario.destroy();
    });

    afterEach(async () => {
        await IntentoTest.destroy({ where: {} });
    });

    test("Deberia Obtener el logro", async () => {
        // ## Given ##
        const intentoTest = await IntentoTest.create({
            idTest: 1,
            idUsuario: usuario.id
        });
        // ## When ##
        const response = await request(app)
            .get(`/logro-curso/${intentoTest.id}`)
            .set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.OK);
    });

    test("Deberia no existir ningun logro", async () => {
        // ## Given ##
        const idIntentoTest = 99; // Asegúrate de que este ID no exista en tu base de datos
        // ## When ##
        const response = await request(app)
            .get(`/logro-curso/${idIntentoTest}`)
            .set('Cookie', [cookie]);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idIntentoTest));
    });

});

describe('Prueba de integración de recordatorios', () => {
    let usuario;
    let cookie;

    beforeAll(async () => {
        const correo = 'email@email.com';
        const contrasena = 'password';
        usuario = await Usuario.create({ correo: correo, contraseña: await bcrypt.hash(contrasena, 10) });
        const loginResponse = await request(app)
            .post('/login')
            .send({ correo: correo, password: contrasena });
        cookie = loginResponse.headers['set-cookie'];
    });

    afterAll(async () => {
        await usuario.destroy();
    });

    test('Debe crear un nuevo recordatorio en la base de datos y renderizar la vista con éxito', async () => {
        const nuevoRecordatorio = new URLSearchParams({
            fecha: '2025-10-01',
            time: '14:00',
            email: 'test@email.com',
            mensaje: 'Este es un mensaje de prueba',
            asunto: 'Asunto de prueba'
        });

        const response = await request(app)
            .post('/crear-recordatorio')
            .set('Cookie', [cookie])
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(nuevoRecordatorio.toString())
            .expect(200);
        expect(response.text).toContain('Recordatorio creado exitosamente.');
    });

    test('Debe rechazar un recordatorio con una fecha en el pasado', async () => {
        const nuevoRecordatorio = new URLSearchParams({
            fecha: '2020-01-01', // Fecha en el pasado
            time: '14:00',
            email: 'test@email.com',
            mensaje: 'Mensaje inválido',
            asunto: 'Asunto inválido'
        });

        const response = await request(app)
            .post('/crear-recordatorio')
            .set('Cookie', [cookie])
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(nuevoRecordatorio.toString())
            .expect(200);
        expect(response.text).toContain('La fecha no puede ser del pasado.');
    });

    test('Debe rechazar un recordatorio si falta algún campo', async () => {
        const recordatorioIncompleto = new URLSearchParams({
            fecha: '2025-04-01',
            time: '14:00',
            email: '', // Falta el email
            mensaje: 'Mensaje de prueba',
            asunto: 'Asunto de prueba'
        });

        const response = await request(app)
            .post('/crear-recordatorio')
            .set('Cookie', [cookie])
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(recordatorioIncompleto.toString())
            .expect(200);
        expect(response.text).toContain('Todos los campos son obligatorios.');
    });

});

describe("GET /previsualizacion-de-test", () => {
    let usuario;
    let cookie;
    let intentos;

    beforeAll(async () => {
        const correo = 'email@email.com';
        const contrasena = 'password';
        usuario = await Usuario.create({ correo: correo, contraseña: await bcrypt.hash(contrasena, 10) });
        const loginResponse = await request(app)
            .post('/login')
            .send({ correo: correo, password: contrasena });
        cookie = loginResponse.headers['set-cookie'];
        // Insertamos datos de prueba
        intentos = await IntentoTest.bulkCreate([
            { preguntasAcertadas: 8, nota: '5.5', terminado: true, fechaFin: new Date(), idTest: 1, idUsuario: usuario.id },
            { preguntasAcertadas: 11, nota: '7', terminado: true, fechaFin: new Date(), idTest: 1, idUsuario: usuario.id },
            { preguntasAcertadas: 3, nota: '2', terminado: true, fechaFin: new Date(), idTest: 1, idUsuario: usuario.id }
        ], { validate: true });
    })

    afterAll(async () => {
        const idsIntentos = intentos.map(i => i.id);
        await IntentoTest.destroy({
            where: { id: idsIntentos }
        });
        await usuario.destroy();
    })

    test("Deberia devolver 200 y renderizar intentos para un curso valido", async () => {
        const idCurso = 1;

        const response = await request(app)
            .get(`/curso/${idCurso}/previsualizacion-de-test`)
            .set('Cookie', [cookie]);

        expect(response.status).toBe(StatusCodes.OK);
        intentos.forEach(intento => {
            expect(response.text).toContain("<td>" + intento.preguntasAcertadas.toString() + "</td>");
            expect(response.text).toContain("<td>" + intento.nota.toString() + " / 10.00 </td>");
            expect(response.text).toContain("<td>" + intento.fechaFin.toLocaleDateString() + "</td>");
        })
    })

    test("Deberia devolver 404 cuando no se encuentre el curso por id", async () => {
        const idCurso = 999;

        const response = await request(app)
            .get(`/curso/${idCurso}/previsualizacion-de-test`)
            .set('Cookie', [cookie]);

        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.CURSO_NO_ENCONTRADO(idCurso));
    })

})

describe("GET /intento-test/:idIntentoTest/pregunta/:numeroPregunta/intento-pregunta", () => {

    let usuario;
    let cookie;
    let intentoTest;

    beforeAll(async () => {
        const correo = 'email@email.com';
        const contrasena = 'password';
        usuario = await Usuario.create({ correo: correo, contraseña: await bcrypt.hash(contrasena, 10) });
        const loginResponse = await request(app)
            .post('/login')
            .send({ correo: correo, password: contrasena });
        cookie = loginResponse.headers['set-cookie'];
        // Insertamos datos de prueba
        intentoTest = await IntentoTest.create(
            {
                terminado: false,
                idTest: 1,
                idUsuario: usuario.id,
                intentos_pregunta: [
                    { idPregunta: 1, idRespuesta: 2 },
                    { idPregunta: 3 }
                ]
            },
            {
                include: [
                    {
                        model: IntentoPregunta,
                        as: "intentos_pregunta"
                    }
                ]
            }
        );
    })

    afterAll(async () => {
        await intentoTest.destroy();
        await usuario.destroy();
    })

    test("Deberia devolver 404 y enviar mensaje de error", async () => {
        const idIntentoTest = 999;
        const numeroPregunta = 99;

        const response = await request(app)
            .get(`/intento-test/${idIntentoTest}/pregunta/${numeroPregunta}/intento-pregunta`)
            .set('Cookie', [cookie]);

        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.INTENTO_PREGUNTA_NO_ENCONTRADO(idIntentoTest, numeroPregunta));
    })

    test("Deberia devolver 200 y renderizar el intento de pregunta con retroalimentacion", async () => {
        const pregunta = await Pregunta.findByPk(intentoTest.intentos_pregunta[0].idPregunta);

        const response = await request(app)
            .get(`/intento-test/${intentoTest.id}/pregunta/${pregunta.numero}/intento-pregunta`)
            .set('Cookie', [cookie]);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.text).toContain("/" + intentoTest.id + "/");
        expect(response.text).toContain("Pregunta " + pregunta.numero);
        expect(response.text).toContain(pregunta.retroalimentacion);
    })

    test("Deberia devolver 200 y renderizar el intento de pregunta sin retroalimentacion", async () => {
        const pregunta = await Pregunta.findByPk(intentoTest.intentos_pregunta[1].idPregunta);

        const response = await request(app)
            .get(`/intento-test/${intentoTest.id}/pregunta/${pregunta.numero}/intento-pregunta`)
            .set('Cookie', [cookie]);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.text).toContain("/" + intentoTest.id + "/");
        expect(response.text).toContain("Pregunta " + pregunta.numero);
        expect(response.text).not.toContain(pregunta.retroalimentacion);
    })

})
// Pruebas de integración registro
describe("POST /register", () => {

    test("Debería registrar un usuario nuevo correctamente", async () => {
        const nuevoUsuario = {
            correo: "usuario" + Date.now() + "@correo.com", // Para evitar duplicados
            password: "contrasena123",
            password2: "contrasena123" // 🔥 Añadido
        };

        const response = await request(app)
            .post('/register')
            .send(nuevoUsuario);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.redirect).toBe('/inicio-sesion');
    });

    test("Debería devolver error si el correo ya está registrado", async () => {
        const correoDuplicado = "duplicado@correo.com";

        // Creamos el usuario previamente (directamente en la BD con hash)
        const bcrypt = require('bcrypt');
        const Usuario = require('../modelos/Usuario');
        const contraseñaHasheada = await bcrypt.hash('password123', 10);

        await Usuario.findOrCreate({
            where: { correo: correoDuplicado },
            defaults: { contraseña: contraseñaHasheada }
        });

        const response = await request(app)
            .post('/register')
            .send({
                correo: correoDuplicado,
                password: 'password123',
                password2: 'password123' // 🔥 Añadido
            });

        expect(response.status).toBe(400);
        expect(response.body.message_error).toBe('¡Ese usuario ya está registrado! Inicia sesión para acceder a la teoría.');
    });

    test("Debería rechazar correos con formato inválido", async () => {
        const response = await request(app)
            .post('/register')
            .send({
                correo: "correo-invalido",
                password: "123456",
                password2: "123456" // 🔥 Añadido
            });

        expect(response.status).toBe(400);
        expect(response.body.message_error).toBe('Introduce un correo válido (ejemplo: usuario@dominio.com, .es ...)');
    });

    test("Debería fallar si las contraseñas no coinciden", async () => {
        const response = await request(app)
            .post('/register')
            .send({
                correo: "nuevoUsuario" + Date.now() + "@correo.com",
                password: "123456",
                password2: "654321" // 🔥 Contraseñas distintas
            });

        expect(response.status).toBe(400);
        expect(response.body.message_error).toBe('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
    });

});

describe('Prueba de integración: Login', () => {
    // Limpiar la base de datos después de cada prueba
    afterEach(async () => {
        await Usuario.destroy({ where: {} });
    });

    beforeEach(async () => {
        // Crear un usuario de prueba con contraseña hasheada
        const hashedPassword = await bcrypt.hash('123', 10);
        await Usuario.create({
            correo: 'usuario@example.com',
            contraseña: hashedPassword  // Cambiado de password a contraseña
        });
    });

    it('Debería iniciar sesión correctamente con credenciales válidas', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                correo: 'usuario@example.com',
                password: '123'  // Cambiado de contraseña a password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('redirect', '/ver-teoria-curso');
    });

    it('Debería fallar al iniciar sesión con credenciales inválidas', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                correo: 'usuarioInvalido',
                password: 'contraseñaInvalida'  // Cambiado de contraseña a password
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message_error', '¡No hay ninguna cuenta con este correo!');
    });
});
