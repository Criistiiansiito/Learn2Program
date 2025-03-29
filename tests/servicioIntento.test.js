const servicioIntento = require('../servicios/servicioIntento');
const Test = require('../modelos/Test');
const Pregunta = require('../modelos/Pregunta');
const IntentoTest = require('../modelos/IntentoTest');
const IntentoPregunta = require('../modelos/IntentoPregunta');
const { TestNoEncontradoError } = require('../utils/errores');

jest.mock("../modelos/Test", () => ({
    findByPk: jest.fn() // Indicamos que la llamada a findByPk debe ser similada
}));

jest.mock("../modelos/IntentoTest", () => ({
    create: jest.fn() // La llamada a create será simulada
}));

describe("intentarTest", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("deberia crear el intento de test con sus intentos de pregunta y devolver su id", async () => {
        // ## Given ##
        const idTest = 1;
        const mockTest = { preguntas: [] };
        const mockIntentoTest = {};
        Test.findByPk.mockResolvedValue(mockTest);
        IntentoTest.create.mockResolvedValue(mockIntentoTest);

        // ## When ##
        const intentoTestId = await servicioIntento.intentarTest(idTest);

        // ## Then ##
        expect(intentoTestId).toBe(mockIntentoTest.id); 

        expect(Test.findByPk).toHaveBeenCalledWith(idTest, {
            include: [{ model: Pregunta, as: "preguntas" }]
        });
        expect(IntentoTest.create).toHaveBeenCalledWith(
            {
                idTest: idTest,
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

        await expect(servicioIntento.intentarTest(idTest)).rejects.toThrow(TestNoEncontradoError);
        expect(Test.findByPk).toHaveBeenCalledWith(idTest, {
            include: [{ model: Pregunta, as: "preguntas"}]
        });
        expect(IntentoTest.create).not.toHaveBeenCalled();
    });

})