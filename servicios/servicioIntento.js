const Pregunta = require('../modelos/Pregunta');
const Respuesta = require('../modelos/Respuesta');
const Test = require('../modelos/Test');
const IntentoTest = require('../modelos/IntentoTest');
const IntentoPregunta = require('../modelos/IntentoPregunta');
const {
    PreguntaNoEncontradaError,
    RespuestaNoEncontradaError,
    PreguntaRespuestaError,
    IntentoTestNoEncontradoError,
    PreguntaYaIntentadaError,
    IntentoPreguntaNoEncontradoError
} = require('../utils/errores');

// Clase que maneja la lógica de negocio de los intentos de preguntas
class ServicioIntentoTest {

    /**
     * Impletementa la lógica de negocio del registro de intentos de preguntas
     * 
     * @param {Number} idIntentoTest - Id del intento de test asociado al intento de la pregunta
     * @param {Number} numeroPregunta - Id de la pregunta a intentar
     * @param {Number} idRespuesta - Id de la respuesta a la pregunta
     * @returns {Object} El intento de test, intento de pregunta actualizado y la corrección de la pregunta
     */
    async intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta) {
        const intentoTest = await IntentoTest.findByPk(idIntentoTest, {
            include: [{
                model: Test, // Cargamos también el test correspondiente
                as: "test" // Nombre del test obtenido en el objeto intentoTest
            }]
        });
        if (!intentoTest) {
            // Si no se encuentra el intento, lanzamos una excepción
            throw new IntentoTestNoEncontradoError(idIntentoTest);
        }
        // Obtenemos la pregunta junto con sus respuestas
        const pregunta = await Pregunta.findOne({
            where: {
                idTest: intentoTest.idTest,
                numero: numeroPregunta
            },
            include: [{
                model: Respuesta, // Para obtener las respuestas
                as: "respuestas" // Nombre de la lista de respuestas en el objeto obtenido
            }]
        })
        if (!pregunta) {
            // Si no se encuentra la pregunta por su número, lanzamos una excepción
            throw new PreguntaNoEncontradaError(intentoTest.idTest, numeroPregunta);
        }
        const respuesta = await Respuesta.findByPk(idRespuesta);
        if (!respuesta) {
            // Si no se encuentra la respuesta por su id, lanzamos una excepción
            throw new RespuestaNoEncontradaError(idRespuesta);
        }
        if (pregunta.id != respuesta.idPregunta) {
            // Si la respuesta no "pertenece" a la pregunta, lanzamos una excepción
            throw new PreguntaRespuestaError(numeroPregunta, idRespuesta);
        }
        // Buscamos un intento de pregunta por idIntentoTest y idPregunta
        const intentoPregunta = await IntentoPregunta.findOne({
            where: {
                idIntentoTest: idIntentoTest,
                idPregunta: pregunta.id
            }
        });
        if (intentoPregunta.idRespuesta) {
            // Si ya se ha realizado un intento para esta pregunta en este mismo intento de test, lanzamos una excepción
            throw new PreguntaYaIntentadaError(idIntentoTest, numeroPregunta);
        }
        // Si no se ha lanzado ninguna excepción, actualizamos el intento
        intentoPregunta.update({ idRespuesta: idRespuesta });
        // Construimos el intento test
        intentoTest.intentos_pregunta = [intentoPregunta];
        intentoTest.test.preguntas = [pregunta];
        return intentoTest;
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
                idPregunta: numeroPregunta
            },
        });
        if (!intentoPregunta) {
            // Si no se encuentra el intento, lanzamos una excepción
            throw new IntentoPreguntaNoEncontradoError(idIntentoTest, numeroPregunta);
        }
        const intentoTest = await IntentoTest.findByPk(idIntentoTest, {
            include: [{
                model: Test,
                as: "test",
            }]
        });
        console.log(JSON.stringify(intentoTest));
        let pregunta;
        if (intentoPregunta.idRespuesta) {
            // Si la pregunta ya ha sido respondida, cargamos la pregunta con retroalimentación y respuestas con 'esCorrecta'
            pregunta = await Pregunta.findOne({
                where: {
                    idTest: intentoTest.idTest,
                    numero: numeroPregunta
                },
                include: [{
                    model: Respuesta,
                    as: "respuestas"
                }]
            })
        } else {
            // Si no ha sido respondida, cargamos la pregunta excluyendo retroalimentacion y respuestas con 'esCorrecta'
            pregunta = await Pregunta.findByPk(numeroPregunta, {
                attributes: { exclude: ['retroalimentacion'] },
                include: [{
                    model: Respuesta,
                    as: "respuestas",
                    attributes: { exclude: ['esCorrecta']}
                }]
            })
        }
        // Añadimos la pregunta a intentoTest
        intentoTest.test.preguntas = [pregunta];
        return intentoTest;
    }

}

module.exports = new ServicioIntentoTest(); // Exportamos una instancia (singleton)