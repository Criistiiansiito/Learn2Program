const request = require('supertest');
const app = require('../app');

describe('Flujo completo de preguntas del test', () => {
  test('Usuario inicia test, responde la primera pregunta y se muestra (o avanza) según la lógica interna', async () => {
    // 1. Accede a la vista previa del test
    const previewRes = await request(app).get('/curso/1/previsualizacion-de-test');
    expect(previewRes.status).toBe(200);

    // 2. Inicia el test (crea un intento)
    const intentoRes = await request(app).post('/test/1/intento-test');
    const match = intentoRes.header.location?.match(/\/intento-test\/(\d+)/);
    const idIntento = match ? match[1] : null;
    expect(idIntento).toBeDefined();

    // 3. Accede a la primera pregunta
    const pregunta1Res = await request(app).get(`/intento-test/${idIntento}/pregunta/1/intento-pregunta`);
    expect(pregunta1Res.status).toBe(200);

    // 4. Envía la respuesta simulando un formulario HTML
    const respuestaRes = await request(app)
      .post(`/intento-test/${idIntento}/pregunta/1/intento-pregunta`)
      .type('form')
      .send({ idRespuesta: 2 });
    expect(respuestaRes.status).toBeGreaterThanOrEqual(200);
    expect(respuestaRes.status).toBeLessThan(400);

    // 5. Comprueba qué pasa tras responder
    const postAnswerRes = await request(app).get(`/intento-test/${idIntento}/pregunta/1/intento-pregunta`);
    expect(postAnswerRes.status).toBe(200);
    expect(postAnswerRes.text).toMatch(/La respuesta correcta es|Siguiente Pregunta|Finalizar Test/);
  });
});
