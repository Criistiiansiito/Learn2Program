const servicioIntento = require('../servicios/servicioIntento');
const Curso = require('../modelos/Curso');
const Test = require('../modelos/Test');
const Pregunta = require('../modelos/Pregunta');
const Respuesta = require('../modelos/Respuesta');
const IntentoTest = require('../modelos/IntentoTest');
const Respuesta = require('../modelos/Respuesta');
const IntentoPregunta = require('../modelos/IntentoPregunta');
const { 
    IntentoTestTerminadoError, 
    RespuestaNoEncontradaError, 
    TestNoEncontradoError, 
    IntentoTestNoEncontradoError, 
    CursoNoEncontradoError, 
    IntentoPreguntaNoEncontradoError, 
    IntentoNoPerteneceUsuarioError, 
    PreguntasSinResponderError, 
    PreguntaYaIntentadaError 
} = require('../utils/errores'); // TODO seguro que sobra alguno de estos errores

jest.mock("../modelos/Curso", () => ({
    findByPk: jest.fn()
}));

jest.mock("../modelos/Test", () => ({
    findByPk: jest.fn() // Indicamos que la llamada a findByPk debe ser similada
}));

jest.mock("../modelos/Respuesta", () => ({
    findByPk: jest.fn()
}));

jest.mock("../modelos/Pregunta", () => ({
    findOne: jest.fn()
}));

jest.mock("../modelos/IntentoTest", () => ({
    create: jest.fn(), // La llamada a create será simulada
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
}));

jest.mock("../modelos/IntentoPregunta", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
}));

describe("intentarTest", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("deberia crear el intento de test con sus intentos de pregunta y devolver su id", async () => {
        // ## Given ##
        const idTest = 1;
        const mockTest = { preguntas: [] };
        const mockIntentoTest = { id: 1 };
        Test.findByPk.mockResolvedValue(mockTest);
        IntentoTest.create.mockResolvedValue(mockIntentoTest);

        // ## When ##
        const intentoTestId = await servicioIntento.intentarTest(idTest);

        // ## Then ##
        expect(intentoTestId).toBe(mockIntentoTest.id);

        expect(Test.findByPk).toHaveBeenCalledWith(idTest, expect.any(Object));
        expect(IntentoTest.create).toHaveBeenCalledWith(
            {
                idTest: 1,
                intentos_pregunta: []
            },
            {
                include: [
                    {
                        model: IntentoPregunta,
                        as: "intentos_pregunta",
                    }
                ]
            }
        );
    });

    test("deberia lanzar una excepcion cuando no se encuentre el test por id", async () => {
        // ## Given ##
        const idTest = 99;
        Test.findByPk.mockResolvedValue(null);

        await expect(servicioIntento.intentarTest(idTest)).rejects.toThrow(new TestNoEncontradoError(idTest));
        expect(Test.findByPk).toHaveBeenCalledWith(idTest, {
            include: [{ model: Pregunta, as: "preguntas" }]
        });
        expect(IntentoTest.create).not.toHaveBeenCalled();
    });

})

describe('terminarIntento', () => {
    const idIntentoTest = 1;
    const idUsuario = 123;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería lanzar un error si hay preguntas sin responder', async () => {
        const mockIntentoTest = {
            id: idIntentoTest,
            idUsuario: idUsuario,
            preguntasIntentadas: 1,
            intentos_pregunta: [
                { respuesta: { esCorrecta: true } },
                { respuesta: null } // <- pregunta sin responder
            ],
            test: { idCurso: 5 },
        };

        IntentoTest.findOne.mockResolvedValue(mockIntentoTest);

        await expect(servicioIntento.terminarIntento(idIntentoTest, idUsuario))
            .rejects
            .toThrow(PreguntasSinResponderError);
    });

    it('debería lanzar un error si no se encuentra el intento', async () => {
        IntentoTest.findOne.mockResolvedValue(null);

        await expect(servicioIntento.terminarIntento(idIntentoTest, idUsuario))
            .rejects
            .toThrow(IntentoTestNoEncontradoError);
    });

    it('debería terminar el intento correctamente si todas las preguntas están respondidas', async () => {
        const mockSave = jest.fn();

        const mockIntentoTest = {
            id: idIntentoTest,
            idUsuario: idUsuario,
            preguntasIntentadas: 3,
            intentos_pregunta: [
                { respuesta: { esCorrecta: true } },
                { respuesta: { esCorrecta: false } },
                { respuesta: { esCorrecta: true } },
            ],
            terminado: false,
            fechaFin: null,
            save: mockSave,
            test: { idCurso: 42 }
        };

        IntentoTest.findOne.mockResolvedValue(mockIntentoTest);

        const idCurso = await servicioIntento.terminarIntento(idIntentoTest, idUsuario);

        expect(idCurso).toBe(42);
        expect(mockIntentoTest.terminado).toBe(true);
        expect(mockSave).toHaveBeenCalled();
    });
});

describe("obtenerIntentosTest", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("deberia obtener el curso con su test y sus intentos", async () => {
        // ## Given ##
        const idCurso = 1;
        const idUsuario = 99;
        const mockIntentos = [];
        const mockCurso = {
            id: idCurso,
            test: { intentos: mockIntentos }
        };

        IntentoTest.destroy = jest.fn().mockResolvedValue(true); // Mock de IntentoTest.destroy
        Curso.findByPk.mockResolvedValue(mockCurso);
        IntentoTest.findAll.mockResolvedValue(mockIntentos);

        // ## When ##
        const curso = await servicioIntento.obtenerIntentosTest(idCurso, idUsuario);

        // ## Then ##
        expect(curso).toBe(mockCurso);
        expect(Curso.findByPk).toHaveBeenCalled();
        expect(IntentoTest.destroy).toHaveBeenCalledWith({
            where: {
                terminado: false
            }
        });
        expect(IntentoTest.findAll).toHaveBeenCalled();
    });

    test("deberia lanzar una excepcion cuando no se encuentre el curso", async () => {
        // ## Given ##
        const idCurso = 1;
        const idUsuario = 99;

        Curso.findByPk.mockResolvedValue(null);
        IntentoTest.destroy = jest.fn().mockResolvedValue(true); // Mock de IntentoTest.destroy

        // ## When & Then ##
        await expect(servicioIntento.obtenerIntentosTest(idCurso, idUsuario))
            .rejects
            .toThrow(new CursoNoEncontradoError(idCurso));

        expect(Curso.findByPk).toHaveBeenCalled();
        expect(IntentoTest.destroy).toHaveBeenCalledWith({
            where: {
                terminado: false
            }
        });
    });
});

describe("intentarPregunta", () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    test("deberia lanzar una excepcion si no se encuentra la respuesta", async () => {
        // ## Given ##
        const idIntentoTest = 99;
        const numeroPregunta = 99;
        const idRespuesta = 99;

        Respuesta.findByPk.mockResolvedValue(null);
        // ## When & Then ##
        await expect(servicioIntento.intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta))
            .rejects
            .toThrow(new RespuestaNoEncontradaError(idIntentoTest, numeroPregunta, idRespuesta));
        expect(Respuesta.findByPk).toHaveBeenCalledWith(idRespuesta, expect.any(Object));
    })

    test("deberia lanzar una excepcion si el intento de test ya se ha terminado", async () => {
        // ## Given ##
        const idIntentoTest = 99;
        const idRespuesta = 1;

        Respuesta.findByPk.mockResolvedValue({
            pregunta: {
                intentos_pregunta: [{
                    intento_test: {
                        id: idIntentoTest,
                        terminado: true
                    }
                }]
            }
        })
        // ## When & Then ##
        await expect(servicioIntento.intentarPregunta(idIntentoTest, 1, idRespuesta))
            .rejects
            .toThrow(new IntentoTestTerminadoError(idIntentoTest));
        expect(Respuesta.findByPk).toHaveBeenCalledWith(idRespuesta, expect.any(Object));
    })

    test("deberia lanzar una excepcion cuando la pregunta ya se haya intentado", async () => {
        // ## Given ##
        const idIntentoTest = 1;
        const numeroPregunta = 1;
        const idRespuesta = 1;

        Respuesta.findByPk.mockResolvedValue({
            pregunta: {
                intentos_pregunta: [{
                    idRespuesta: 1,
                    intento_test: {
                        terminado: false
                    }
                }]
            }
        })
        // ## When & Then ##
        await expect(servicioIntento.intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta))
            .rejects
            .toThrow(new PreguntaYaIntentadaError(idIntentoTest, numeroPregunta));
        expect(Respuesta.findByPk).toHaveBeenCalledWith(idRespuesta, expect.any(Object));
    })

    test("deberia actualizar el intento de pregunta y el intento de test con preguntasAcertadas incrementado cuando se acierta la respuesta", async () => {
        // ## Given ##
        const idRespuesta = 1;
        const preguntasAcertadas = 0;
        const mockIntentoTest = {
            preguntasAcertadas: preguntasAcertadas,
            terminado: false,
            save: jest.fn().mockResolvedValue(true)
        }
        const mockIntentoPregunta = {
            idRespuesta: null,
            intento_test: mockIntentoTest,
            save: jest.fn().mockResolvedValue(true)
        }

        Respuesta.findByPk.mockResolvedValue({
            esCorrecta: true, // Acertamos la respuesta
            pregunta: {
                intentos_pregunta: [mockIntentoPregunta]
            }
        })
        // ## When ##
        await servicioIntento.intentarPregunta(1, 1, idRespuesta);
        // ## Then ##
        expect(mockIntentoTest.preguntasAcertadas).toBe(preguntasAcertadas + 1);
        expect(mockIntentoTest.save).toHaveBeenCalled();
        expect(mockIntentoPregunta.idRespuesta).toBe(idRespuesta);
        expect(mockIntentoPregunta.save).toHaveBeenCalled();
    })

    test("deberia actualizar el intento de pregunta y el intento de test con preguntasAcertadas constante cuando no se acierta la respuesta", async () => {
        // ## Given ##
        const idRespuesta = 1;
        const preguntasAcertadas = 0;
        const mockIntentoTest = {
            preguntasAcertadas: preguntasAcertadas,
            terminado: false,
            save: jest.fn().mockResolvedValue(true)
        }
        const mockIntentoPregunta = {
            idRespuesta: null,
            intento_test: mockIntentoTest,
            save: jest.fn().mockResolvedValue(true)
        }

        Respuesta.findByPk.mockResolvedValue({
            esCorrecta: false, // No acertamos la respuesta
            pregunta: {
                intentos_pregunta: [mockIntentoPregunta]
            }
        })
        // ## When ##
        await servicioIntento.intentarPregunta(1, 1, idRespuesta);
        // ## Then ##
        expect(mockIntentoTest.preguntasAcertadas).toBe(preguntasAcertadas);
        expect(mockIntentoTest.save).toHaveBeenCalled();
        expect(mockIntentoPregunta.idRespuesta).toBe(idRespuesta);
        expect(mockIntentoPregunta.save).toHaveBeenCalled();
    })

})

describe("obtenerIntentoPregunta", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("debería lanzar una excepción si el intento de pregunta no existe", async () => {
        // ## Given ##
        const idIntentoTest = 1;
        const numeroPregunta = 99;

        IntentoPregunta.findOne.mockResolvedValue(null);

        // ## When & Then ##
        await expect(servicioIntento.obtenerIntentoPregunta(idIntentoTest, numeroPregunta, 1))
            .rejects
            .toThrow(new IntentoPreguntaNoEncontradoError(idIntentoTest, numeroPregunta));

        expect(IntentoPregunta.findOne).toHaveBeenCalled();
    });

    test("debería obtener el intento de pregunta correctamente cuando ya fue respondida", async () => {
        // ## Given ##
        const idIntentoTest = 1;
        const numeroPregunta = 2;
        const idUsuario = 1;

        const mockPregunta = {
            numero: numeroPregunta,
            respuestas: [
                { id: 3, esCorrecta: true },
                { id: 4, esCorrecta: false }
            ]
        };

        const mockIntentoPregunta = {
            idRespuesta: 3, // Ya fue respondida
            idUsuario: idUsuario,
            intento_test: {
                id: idIntentoTest,
                test: {
                    id: 10,
                    numeroPreguntas: 0,
                    preguntas: []
                }
            },
            pregunta: mockPregunta
        };

        IntentoPregunta.findOne.mockResolvedValue(mockIntentoPregunta);
        Pregunta.findOne.mockResolvedValue(mockPregunta);

        // ## When ##
        const intento = await servicioIntento.obtenerIntentoPregunta(idIntentoTest, numeroPregunta, idUsuario);

        // ## Then ##
        expect(intento).toEqual(mockIntentoPregunta.intento_test);
        expect(IntentoPregunta.findOne).toHaveBeenCalled();
        expect(Pregunta.findOne).toHaveBeenCalled();
    });

    test("debería obtener el intento de pregunta sin información de respuestas correctas si aún no ha sido respondida", async () => {
        // ## Given ##
        const idIntentoTest = 1;
        const numeroPregunta = 2;
        const idUsuario = 1;

        const mockPregunta = {
            numero: numeroPregunta,
            respuestas: [
                { id: 3 },
                { id: 4 }
            ]
        };

        const mockIntentoPregunta = {
            idRespuesta: null, // No ha sido respondida
            idUsuario: idUsuario,
            intento_test: {
                id: idIntentoTest,
                test: {
                    id: 10,
                    numeroPreguntas: 0,
                    preguntas: []
                }
            },
            preguntas: mockPregunta
        };

        IntentoPregunta.findOne.mockResolvedValue(mockIntentoPregunta);
        Pregunta.findOne.mockResolvedValue(mockPregunta);

        // ## When ##
        const intento = await servicioIntento.obtenerIntentoPregunta(idIntentoTest, numeroPregunta, idUsuario);

        // ## Then ##
        expect(intento).toEqual(mockIntentoPregunta.intento_test);
        expect(IntentoPregunta.findOne).toHaveBeenCalled();
        expect(Pregunta.findOne).toHaveBeenCalled();
    });


});
