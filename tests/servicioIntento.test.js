const servicioIntento = require('../servicios/servicioIntento');
const Curso = require('../modelos/Curso');
const Test = require('../modelos/Test');
const Pregunta = require('../modelos/Pregunta');
const IntentoTest = require('../modelos/IntentoTest');
const IntentoPregunta = require('../modelos/IntentoPregunta');
const { TestNoEncontradoError, IntentoTestNoEncontradoError, CursoNoEncontradoError } = require('../utils/errores');

jest.mock("../modelos/Test", () => ({
    findByPk: jest.fn() // Indicamos que la llamada a findByPk debe ser similada
}));

jest.mock("../modelos/IntentoTest", () => ({
    create: jest.fn(), // La llamada a create será simulada
    findByPk: jest.fn(),
}));

jest.mock("../modelos/Curso", () => ({
    findByPk: jest.fn()
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

describe("terminarIntento", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("deberia actualizar el intento de test y devolver el id del curso", async () => {
        // ## Given ##
        const idIntentoTest = 1;
        const mockIntentoTest = {
            test: { idCurso: 5 },
            intentos_pregunta: [
                { respuesta: { esCorrecta: false } },
                { respuesta: { esCorrecta: true } },
                { respuesta: { esCorrecta: true } }
            ],
            save: jest.fn().mockResolvedValue(true)
        };
        IntentoTest.findByPk.mockResolvedValue(mockIntentoTest);
        // ## When ##
        const idCurso = await servicioIntento.terminarIntento(idIntentoTest);
        // ## Then ##
        expect(IntentoTest.findByPk).toHaveBeenCalledWith(idIntentoTest, expect.any(Object));
        expect(mockIntentoTest.preguntasAcertadas).toBe(2);
        expect(mockIntentoTest.nota).toBe('6.67');
        expect(mockIntentoTest.terminado).toBe(true);
        expect(mockIntentoTest.fechaFin).toBeInstanceOf(Date);
        expect(mockIntentoTest.save).toHaveBeenCalled();
        expect(idCurso).toBe(mockIntentoTest.test.idCurso);
    })

    test("deberia lanzar una excepcion cuando no se encuentre el test", async () => {
        const idIntentoTest = 99;
        IntentoTest.findByPk.mockResolvedValue(null);

        await expect(servicioIntento.terminarIntento(idIntentoTest))
            .rejects
            .toThrow(new IntentoTestNoEncontradoError(idIntentoTest));

        expect(IntentoTest.findByPk).toHaveBeenCalledWith(idIntentoTest, expect.any(Object));
    })
})

describe("obtenerIntentosTest", () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    test("deberia obtener el curso con su test y sus intentos", async () => {
        // ## Given ##
        const idCurso = 1;
        const mockCurso = {
            id: idCurso,
            test: { intentos: [] }
        };
        Curso.findByPk.mockResolvedValue(mockCurso);
        // ## When ##
        const curso = await servicioIntento.obtenerIntentosTest(idCurso);
        // ## Then ##
        expect(curso).toBe(mockCurso);
        expect(Curso.findByPk).toHaveBeenCalledWith(idCurso, {
            include: [
                {
                    model: Test,
                    as: "test",
                    include: [
                        {
                            model: IntentoTest,
                            as: "intentos"
                        }
                    ]
                }
            ]
        });
    })

    test("deberia lanzar una excepcion cuando no se encuentre el curso", async () => {
        // ## Given ##
        const idCurso = 1;
        Curso.findByPk.mockResolvedValue(null);
        // ## When & Then
        await expect(servicioIntento.obtenerIntentosTest(idCurso))
            .rejects
            .toThrow(new CursoNoEncontradoError(idCurso));
        expect(Curso.findByPk).toHaveBeenCalledWith(idCurso, {
            include: [
                {
                    model: Test,
                    as: "test",
                    include: [
                        {
                            model: IntentoTest,
                            as: "intentos"
                        }
                    ]
                }
            ]
        });
    })
})