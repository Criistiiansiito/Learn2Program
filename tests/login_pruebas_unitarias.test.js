process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcrypt');

jest.mock('../modelos/Usuario');

describe('POST /login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe iniciar sesión correctamente con credenciales válidas', async () => {
    const fakeUser = {
      id: 1,
      correo: 'test@correo.com',
      contraseña: await bcrypt.hash('123456', 10),
    };

    Usuario.findOne.mockResolvedValue(fakeUser); 

    const response = await request(app)
      .post('/login')
      .send({ correo: 'test@correo.com', password: '123456' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.redirect).toBe('/ver-teoria-curso');
  });

  it('debe fallar si el correo no existe', async () => {
    Usuario.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/login')
      .send({ correo: 'noexiste@correo.com', password: '123456' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message_error).toBe('¡No hay ninguna cuenta con este correo!');
  });

  it('debe fallar si la contraseña es incorrecta', async () => {
    const fakeUser = {
      id: 1,
      correo: 'test@correo.com',
      contraseña: await bcrypt.hash('correcta', 10),
    };

    Usuario.findOne.mockResolvedValue(fakeUser);

    const response = await request(app)
      .post('/login')
      .send({ correo: 'test@correo.com', password: 'incorrecta' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message_error).toBe('Contraseña incorrecta');
  });
});

