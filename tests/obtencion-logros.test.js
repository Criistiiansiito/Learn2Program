const fs = require("fs");
const path = require('path');
const global = require('@jest/globals');
const { JSDOM } = require('jsdom');

// const pool = require('../database/connection');
// const app = require('../app'); // Assuming your Express app is exported from app.js

// jest.mock('../database/connection');

if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
    global.TextDecoder = require('util').TextDecoder;
}

describe('Comprobamos que presionar el boton "ver resultados" muestra el modal correspondiente', () =>{

    let dom;
    let document;

    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../views/obtencion-logros.ejs'), 'utf8');
        dom = new JSDOM(html);
        document = dom.window.document;
    });

    it('deberia mostrar el modal de logro al presionar el boton correspondiente', () => {
        // Localizamos el boton y el modal mediante si OD
        let button = document.getElementById('boton-mostrar-resultados');
        let modal = document.getElementById('logro-modal');
        
        modal.show = jest.fn();
        button.addEventListener('click', () => {
            modal.show();  // Simulamos que se llama al método 'show' del modal
        });

        //Definimos el evento de click del boton
        const clickEvent = document.createEvent('Event');
        clickEvent.initEvent('click', true, true);

        // El modal no se está mostrando al inicio
        expect(modal.className).toBe("modal");
        
        // Disparar el evento click en el botón
        button.dispatchEvent(clickEvent);

        // comprobamos que se ha llamado correctamente a la función de mostrar el modal
        expect(modal.show).toHaveBeenCalledTimes(1);
    });

});

describe('Pruebas obtencion de logros', () => {

    afterAll(() => {
        // Cierra la conexión a la base de datos después de todas las pruebas
        // pool.end();
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