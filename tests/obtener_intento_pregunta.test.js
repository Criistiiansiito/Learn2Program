const ServicioIntentoTest = require('../servicios/servicioIntento');
const IntentoPregunta = require('../modelos/IntentoPregunta');
const Pregunta = require('../modelos/Pregunta');
const Respuesta = require('../modelos/Respuesta');
const IntentoTest = require('../modelos/IntentoTest');
const Test = require('../modelos/Test');
const { IntentoPreguntaNoEncontradoError } = require('../utils/errores');

jest.mock("../modelos/IntentoPregunta", () => ({
  findOne: jest.fn(),
}));

jest.mock("../modelos/Pregunta", () => ({
  findOne: jest.fn(),
}));

jest.mock("../modelos/Respuesta", () => ({
  findOne: jest.fn(),
}));

jest.mock("../modelos/IntentoTest", () => ({
  findByPk: jest.fn(),
}));

jest.mock("../modelos/Test", () => ({
  findByPk: jest.fn(),
}));

jest.mock("../utils/errores", () => ({
  IntentoPreguntaNoEncontradoError: jest.fn(),
}));

describe('ServicioIntentoTest - obtenerIntentoPregunta', () => {

  it('debe devolver la información del intento de pregunta correctamente si existe', async () => {
    const idIntentoTest = 1;
    const numeroPregunta = 2;

    const mockIntentoPregunta = {
      idRespuesta: 1,
      intento_test: {
        id: idIntentoTest,
        test: {
          idCurso: 101,
          preguntas: [],
        }
      },
      pregunta: {
        numero: numeroPregunta
      }
    };

    const mockPregunta = {
      idTest: 101,
      numero: numeroPregunta,
      respuestas: [
        { id: 1, esCorrecta: true }
      ]
    };

    IntentoPregunta.findOne.mockResolvedValue(mockIntentoPregunta);
    Pregunta.findOne.mockResolvedValue(mockPregunta);

    const resultado = await ServicioIntentoTest.obtenerIntentoPregunta(idIntentoTest, numeroPregunta);

    expect(resultado.intento_test.test.preguntas[0]).toEqual(mockPregunta);
    expect(IntentoPregunta.findOne).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.arrayContaining([
        expect.objectContaining({ model: Test, as: 'test' }),
        expect.objectContaining({ model: Pregunta, as: 'pregunta', where: { numero: numeroPregunta } })
      ])
    }));
  });

  it('debe lanzar un error si no se encuentra el intento de pregunta', async () => {
    const idIntentoTest = 1;
    const numeroPregunta = 2;

    IntentoPregunta.findOne.mockResolvedValue(null);

    await expect(ServicioIntentoTest.obtenerIntentoPregunta(idIntentoTest, numeroPregunta))
      .rejects
      .toThrowError(new IntentoPreguntaNoEncontradoError(idIntentoTest, numeroPregunta));
  });
});
