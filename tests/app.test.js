const app = require('../app');
const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const MENSAJES = require('../utils/mensajes');
const servicioIntento = require('../servicios/servicioIntento'); 
const { IntentoTestNoEncontradoError } = require('../utils/errores');

describe("POST /test/:idTest/intento-test", () => {

    beforeAll((done) => {
        server = app.listen(0, () => { // Usamos 0 para que el SO asigne un puerto libre
            console.log('Test server running');
            done();
        });
    });

    afterAll((done) => {
        server.close(done); // Cerramos la conexión al terminar los test
    });

    test("Deberia devolver Moved Temporarily", async () => {
        // ## Given ##
        const idTest = 1;
        // ## When ##
        const response = await request(app).post(`/test/${idTest}/intento-test`);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.MOVED_TEMPORARILY);
    });

    test("Deberia devolver Not Found", async () => {
        // ## Given ##
        const idTest = 99;
        // ## When ##
        const response = await request(app).post(`/test/${idTest}/intento-test`);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.TEST_NO_ENCONTRADO(idTest));
    })

});

describe("PATCH /intento-test/:idIntentoTest/terminar-intento", () => {
    let server;

    beforeAll((done) => {
        server = app.listen(0, () => {
            console.log('Test server running');
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    test("Debe finalizar un intento de test y redirigir correctamente", async () => {
        // ## Given ##
        const idIntentoTest = 1; // Suponemos que hay un intento de test con ID 1 en la BD
        
        const idCursoSimulado = 1;  

        jest.spyOn(servicioIntento, 'terminarIntento').mockResolvedValue(idCursoSimulado);

        // ## When ##
        const response = await request(app)
            .patch(`/intento-test/${idIntentoTest}/terminar-intento`)
            .send(); 

        // ## Then ##
        expect(response.status).toBe(200);
        expect(response.body.redirectUrl).toBe(`/logro-curso/${idCursoSimulado}`);
        expect(response.body.redirectUrl).toMatch(/^\/logro-curso\/\d+$/); 
    });

    test("Debe devolver Not Found cuando el ID de intento de test no existe", async () => {
        // ## Given ##
        const idIntentoTest = 99; // ID que no existe en la BD
      
        // Simulamos que el servicio lanza la excepción
        jest.spyOn(servicioIntento, 'terminarIntento').mockRejectedValue(new IntentoTestNoEncontradoError(idIntentoTest)); // Mockeamos el error
      
        // ## When ##
        const response = await request(app)
          .patch(`/intento-test/${idIntentoTest}/terminar-intento`)
          .send(); 
      
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND); // Esperamos que el status sea 404
        expect(response.text).toBe(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idIntentoTest)); // Esperamos el mensaje correcto
      });
});

describe("GET /logro-curso/:idIntentoTest", () => {

    beforeAll((done) => {
        server = app.listen(0, () => { // Usamos 0 para que el SO asigne un puerto libre
            console.log('Test server running');
            done();
        });
    });

    afterAll((done) => {
        server.close(done); // Cerramos la conexión al terminar los test
    });

    test("Deberia Obtener el logro", async () => {
        // ## Given ##
        const idIntentoTest = 1; // Asegúrate de que este ID exista en tu base de datos
        // ## When ##
        const response = await request(app).get(`/logro-curso/${idIntentoTest}`);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.OK);
    });

    test("Deberia no existir ningun logro", async () => {
        // ## Given ##
        const idIntentoTest = -1; // Asegúrate de que este ID no exista en tu base de datos
        // ## When ##
        const response = await request(app).get(`/logro-curso/${idIntentoTest}`);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idIntentoTest));
    })

});

describe('Prueba de integración de recordatorios', () => {
   

    test('Debe crear un nuevo recordatorio en la base de datos y renderizar la vista con éxito', async () => {
        const nuevoRecordatorio = new URLSearchParams({
            fecha: '2025-04-01',
            time: '14:00',
            email: 'test@email.com',
            mensaje: 'Este es un mensaje de prueba',
            asunto: 'Asunto de prueba'
        });
        
        const response = await request(app).post('/crear-recordatorio').set('Content-Type', 'application/x-www-form-urlencoded').send(nuevoRecordatorio.toString()).expect(200);
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
    
        const response = await request(app).post('/crear-recordatorio').set('Content-Type', 'application/x-www-form-urlencoded').send(nuevoRecordatorio.toString()).expect(200);
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

        const response = await request(app).post('/crear-recordatorio').set('Content-Type', 'application/x-www-form-urlencoded').send(recordatorioIncompleto.toString()).expect(200);
        expect(response.text).toContain('Todos los campos son obligatorios.');
    });
});

