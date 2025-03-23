const request = require('supertest');
const express = require('express');
const path = require('path');
const pool = require('../database/connection');
const app = require('../app'); // Assuming your Express app is exported from app.js

jest.mock('../database/connection');

describe('Pruebas obtencion de logros', () => {

    afterAll(() => {
        // Cierra la conexión a la base de datos después de todas las pruebas
        pool.end();
    });

    test('El logro de 1 debe existir y su foto', () => {
        // const logroMock = {
        //     id: 1,
        //     idCurso: 1,
        //     mensajeMotivacionalCursoOK: '¡Felicidades, has completado el curso con éxito!',
        //     mensajeMotivacionalCursoKO: 'Lo intentaste, pero no alcanzaste el objetivo, ¡sigue intentándolo!',       
        //     imagen: '/images/logroCurso1.png',
        //     fechaObtencion: '22-03-2025'
        // };

        // pool.query.mockImplementation((query, params, callback) => {
        //     if (query.includes('SELECT * FROM LOGROS WHERE idCurso = ?')) {
        //         callback(null, [logroMock]);
        //     } else if (query.includes('SELECT nombre FROM cursos WHERE id = ?')) {
        //         callback(null, [{ nombre: 'Curso de prueba' }]);
        //     } else if (query.includes('SELECT * FROM intentos WHERE idTest = ?')) {
        //         callback(null, [{ nota: 8 }]);
        //     } else if (query.includes('SELECT id from test where idCurso = ?;')) {
        //         callback(null, [{ id: 1 }]);
        //     }
        // });

        // request(app)
        //     .get('/obtener-logro-curso')
        //     .end((err, response) => {
        //         if (err) return done(err);
        //         expect(response.status).toBe(200);
        //         expect(response.text).toContain(logroMock.imagen);
        //     });
    });

    test('Se debe mostrar el logro si se supera un 70% del curso', () => {
        // const logroMock = {
        //     id: 1,
        //     idCurso: 1,
        //     mensajeMotivacionalCursoOK: '¡Felicidades, has completado el curso con éxito!',
        //     mensajeMotivacionalCursoKO: 'Lo intentaste, pero no alcanzaste el objetivo, ¡sigue intentándolo!',       
        //     imagen: '/images/logroCurso1.png',
        //     fechaObtencion: '22-03-2025'
        // };

        // pool.query.mockImplementation((query, params, callback) => {
        //     if (query.includes('SELECT * FROM LOGROS WHERE idCurso = ?')) {
        //         callback(null, [logroMock]);
        //     } else if (query.includes('SELECT nombre FROM cursos WHERE id = ?')) {
        //         callback(null, [{ nombre: 'Curso de prueba' }]);
        //     } else if (query.includes('SELECT * FROM intentos WHERE idTest = ?')) {
        //         callback(null, [{ nota: 8 }]);
        //     } else if (query.includes('SELECT id from test where idCurso = ?;')) {
        //         callback(null, [{ id: 1 }]);
        //     }
        // });

        // request(app)
        //     .get('/obtener-logro-curso')
        //     .end((err, response) => {
        //         if (err) return done(err);
        //         expect(response.status).toBe(200);
        //         expect(response.text).toContain(logroMock.mensajeMotivacionalCursoOK);
        //     });
    });

    test('Se debe mostrar un mensaje motivador si no se supera un 70% del curso', () => {
        // const logroMock = {
        //     id: 1,
        //     idCurso: 1,
        //     mensajeMotivacionalCursoOK: '¡Felicidades, has completado el curso con éxito!',
        //     mensajeMotivacionalCursoKO: 'Lo intentaste, pero no alcanzaste el objetivo, ¡sigue intentándolo!',       
        //     imagen: '/images/logroCurso1.png',
        //     fechaObtencion: '22-03-2025'
        // };

        // pool.query.mockImplementation((query, params, callback) => {
        //     if (query.includes('SELECT * FROM LOGROS WHERE idCurso = ?')) {
        //         callback(null, [logroMock]);
        //     } else if (query.includes('SELECT nombre FROM cursos WHERE id = ?')) {
        //         callback(null, [{ nombre: 'Curso de prueba' }]);
        //     } else if (query.includes('SELECT * FROM intentos WHERE idTest = ?')) {
        //         callback(null, [{ nota: 6 }]);
        //     } else if (query.includes('SELECT id from test where idCurso = ?;')) {
        //         callback(null, [{ id: 1 }]);
        //     }
        // });

        // request(app)
        //     .get('/obtener-logro-curso')
        //     .end((err, response) => {
        //         if (err) return done(err);
        //         expect(response.status).toBe(200);
        //         expect(response.text).toContain(logroMock.mensajeMotivacionalCursoKO);
        //     });
    });
});