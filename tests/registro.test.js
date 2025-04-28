process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcrypt');

jest.mock('../modelos/Usuario');

describe('POST /register', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe registrar un nuevo usuario correctamente con correo y contraseña válidos', async () => {
    const nuevoCorreo = 'nuevo' + Date.now() + '@correo.com'; // evitar duplicados
    const nuevaContraseña = 'Password123';

    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue({ id: 1, correo: nuevoCorreo });

    const response = await request(app)
      .post('/register')
      .send({
        correo: nuevoCorreo,
        password: nuevaContraseña,
        password2: nuevaContraseña 
      });

    expect(response.statusCode).toBe(200); 
    expect(Usuario.create).toHaveBeenCalled();
    expect(response.body.success).toBe(true);
    expect(response.body.redirect).toBe('/inicio-sesion'); 
  });

  it('debe fallar si el correo ya está registrado', async () => {
    const correoExistente = 'existente@correo.com';

    Usuario.findOne.mockResolvedValue({ id: 1, correo: correoExistente });

    const response = await request(app)
      .post('/register')
      .send({
        correo: correoExistente,
        password: 'Password123',
        password2: 'Password123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message_error).toBe('¡Ese usuario ya está registrado! Inicia sesión para acceder a la teoría.');
  });

  it('debe fallar si el correo no tiene formato válido', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        correo: 'correoInvalido',
        password: 'Password123',
        password2: 'Password123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message_error).toBe('Introduce un correo válido (ejemplo: usuario@dominio.com, .es ...)');
  });

  it('debe fallar si las contraseñas no coinciden', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        correo: 'nuevo' + Date.now() + '@correo.com',
        password: 'Password123',
        password2: 'Password321' 
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message_error).toBe('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
  });

  it('debe fallar si la contraseña no cumple los requisitos de seguridad', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        correo: 'nuevo' + Date.now() + '@correo.com',
        password: '12345678', 
        password2: '12345678'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message_error).toBe('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.');
  });

});
