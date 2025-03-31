const request = require('supertest');
const app = require('../app');

describe('Prueba de integración: comprobar que se guarda una respuesta', () => {
  let cookie; // guardará la cookie de sesión
  let idIntentoTest;

  beforeAll(async () => {
    // 1. Iniciar sesión con un usuario real
    const loginResponse = await request(app)
      .post('/login')
      .send({
        correo: 'prueba@gmail.com',     // <-- debe existir en la base de datos
        password: '123'          // <-- debe coincidir con la contraseña hasheada
      });

    // 2. Comprobar que el login fue exitoso
    expect(loginResponse.status).toBe(200);
    cookie = loginResponse.headers['set-cookie']; // guardar cookie de sesión

    // 3. Iniciar un intento de test (test id = 1)
    const testResponse = await request(app)
      .post('/test/1/intento-test')
      .set('Cookie', cookie);

    // Extraer idIntentoTest desde la URL de redirección
    const match = testResponse.header.location.match(/\/intento-test\/(\d+)/);
    idIntentoTest = match[1];
  });

  test('El usuario responde la pregunta 1 con la respuesta 1 y se guarda', async () => {
    // 4. Enviar respuesta para la pregunta 1
    const respuestaResponse = await request(app)
      .post(`/intento-test/${idIntentoTest}/pregunta/1/intento-pregunta`)
      .set('Cookie', cookie)
      .send({
        idRespuesta: 1  // <-- debe existir en la base de datos y estar relacionada con pregunta 1
      });

    // 5. Comprobar que redirige correctamente
    expect(respuestaResponse.status).toBe(302);
    expect(respuestaResponse.header.location).toBe(`/intento-test/${idIntentoTest}/pregunta/1/intento-pregunta`);
  });
});
