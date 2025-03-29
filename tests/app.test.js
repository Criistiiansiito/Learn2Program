const app = require('../app');
const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const MENSAJES = require('../utils/mensajes');
const { terminarIntento } = require('../servicios/servicioIntento');

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

})

describe("GET /logro-curso/:idCurso", () => {

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
        const idIntentoTest = 1;
        // ## When ##
        const response = await request(app).get(`/logro-curso/${idIntentoTest}`);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.OK);
    });

    test("Deberia no existir ningun logro", async () => {
        // ## Given ##
        const idIntentoTest = -1;
        // ## When ##
        const response = await request(app).get(`/logro-curso/${idIntentoTest}`);
        // ## Then ##
        expect(response.status).toBe(StatusCodes.NOT_FOUND);
        expect(response.text).toBe(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idIntentoTest));
    })

});
