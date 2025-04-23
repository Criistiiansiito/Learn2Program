const request = require('supertest');
const app = require('../app');
const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcrypt');

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