const Pregunta = require("../modelos/Pregunta");
const Respuesta = require("../modelos/Respuesta");
const Test = require("../modelos/Test");
const IntentoTest = require("../modelos/IntentoTest");
const IntentoPregunta = require("../modelos/IntentoPregunta");
const {
    PreguntaYaIntentadaError,
    IntentoPreguntaNoEncontradoError,
    TestNoEncontradoError,
} = require("../utils/errores");
const { where } = require("sequelize");

// Clase que maneja la lógica de negocio de los intentos de preguntas
class ServicioIntentoTest {

    /**
     * Inicia un intento de test
     * 
     * @param {Number} idTest - El id del test a intentar
     * @returns {Promise<Number>} El id del intento de test creado
     */
    async intentarTest(idTest) {
        // Obtenemos el test con sus preguntas
        const test = await Test.findByPk(idTest, {
            include: [
                {
                    model: Pregunta,
                    as: "preguntas"
                }
            ]
        });
        // Si no se encuentra el test, lanzamos una excepcion
        if (!test) {
            throw new TestNoEncontradoError(idTest);
        }
        // Para cada pregunta del test creamos un intento de pregunta no realizado (con idRespuesta nulo)
        const intentosPregunta = [];
        test.preguntas.forEach((pregunta) => {
            intentosPregunta.push({ idPregunta: pregunta.id });
        });
        // Creamos el intento de test con sus intentos de pregunta
        const intentoTest = await IntentoTest.create(
            {
                idTest: idTest,
                intentos_pregunta: intentosPregunta,
            },
            {
                include: [
                    {
                        model: IntentoPregunta,
                        as: "intentos_pregunta",
                    },
                ],
            }
        );
        return intentoTest.id;
    }

    /**
     * Impletementa la lógica de negocio de los intentos de preguntas.
     * 
     * A efectos de implementación, consideramos responder (intentar) una pregunta como
     * actualizar el campo idPregunta (inicialmente nulo)
     *
     * @param {Number} idIntentoTest - Id del intento de test asociado al intento de la pregunta
     * @param {Number} numeroPregunta - Id de la pregunta a intentar
     * @param {Number} idRespuesta - Id de la respuesta a la pregunta
     */
    async intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta) {
        const intentoPregunta = await IntentoPregunta.findOne({
            where: { idIntentoTest: idIntentoTest },
            include: [
                {
                    model: Pregunta,
                    as: "pregunta",
                    where: { numero: numeroPregunta }
                }
            ]
        });
        if (!intentoPregunta) {
            // Si no se encuentra el intento, lanzamos una excepción
            throw new IntentoPreguntaNoEncontradoError(idIntentoTest, numeroPregunta);
        }
        if (intentoPregunta.idRespuesta) {
            // Si ya se ha respondido a la pregunta, lanzamos una excepción
            throw new PreguntaYaIntentadaError(idIntentoTest, intentoPregunta.idPregunta);
        }
        // Actualizamos el intento de la pregunta
        intentoPregunta.idRespuesta = idRespuesta;
        await intentoPregunta.save(intentoPregunta);
    }

    /**
     * Obtiene el intento de una pregunta en el contexto del intento del test
     *
     * @param {Number} idIntentoTest - Id del intento de test asociado al intento de la pregunta
     * @param {Number} numeroPregunta - Id de la pregunta sobre la que queremos obtener el intento
     * @returns {Object} El intento de test, con el intento de pregunta
     */
    async obtenerIntentoPregunta(idIntentoTest, numeroPregunta) {
        const intentoPregunta = await IntentoPregunta.findOne({
            where: {
                idIntentoTest: idIntentoTest,
            },
            include: [
                {
                    model: Pregunta,
                    as: "pregunta",
                    where: {
                        numero: numeroPregunta,
                    },
                },
            ],
        });
        if (!intentoPregunta) {
            // Si no se encuentra el intento, lanzamos una excepción
            throw new IntentoPreguntaNoEncontradoError(idIntentoTest, numeroPregunta);
        }
        const intentoTest = await IntentoTest.findByPk(idIntentoTest, {
            include: [
                {
                    model: Test,
                    as: "test",
                },
            ],
        });
        let pregunta;
        if (intentoPregunta.idRespuesta) {
            // Si la pregunta ya ha sido respondida, cargamos la pregunta con retroalimentación y respuestas con 'esCorrecta'
            pregunta = await Pregunta.findOne({
                where: {
                    idTest: intentoTest.idTest,
                    numero: numeroPregunta,
                },
                include: [
                    {
                        model: Respuesta,
                        as: "respuestas",
                    },
                ],
            });
        } else {
            // Si no ha sido respondida, cargamos la pregunta excluyendo retroalimentacion y respuestas con 'esCorrecta'
            pregunta = await Pregunta.findOne({
                where: {
                    idTest: intentoTest.idTest,
                    numero: numeroPregunta,
                },
                include: [
                    {
                        model: Respuesta,
                        as: "respuestas",
                        attributes: { exclude: ["esCorrecta"] },
                    },
                ],
                attributes: { exclude: ["retroalimentacion"] },
            });
        }
        // Añadimos la pregunta a intentoTest
        intentoTest.test.preguntas = [pregunta];
        return intentoTest;
    }
}

module.exports = new ServicioIntentoTest(); // Exportamos una instancia (singleton)
