const Pregunta = require('../modelos/Pregunta');
const Respuesta = require('../modelos/Respuesta');
const IntentoTest = require('../modelos/IntentoTest');
const IntentoPregunta = require('../modelos/IntentoPregunta');
const {
    PreguntaNoEncontradaError,
    RespuestaNoEncontradaError,
    PreguntaRespuestaError,
    IntentoTestNoEncontradoError,
    PreguntaYaIntentadaError
} = require('../utils/errores');

// Clase que maneja la lógica de negocio de los intentos de preguntas
class ServicioIntento {

    /**
     * Impletementa la lógica de negocio del registro de intentos
     * 
     * @param {Object} intentoPregunta - Objeto que contiene los ids de la pregunta, la respuesta, y el usuario
     * @returns {Promise<Object>} Promesa que se resuelve a un objeto que contiene 
     */
    async anyadirIntento(intentoPregunta) {
        // Obtenemos la pregunta junto con sus respuestas
        const pregunta = await Pregunta.findByPk(intentoPregunta.idPregunta, {
            include: [{
                model: Respuesta, // Para obtener las respuestas
                as: "respuestas" // Nombre de la lista de respuestas en el objeto obtenido
            }]
        })
        if (!pregunta) {
            // Si no se encuentra la pregunta por su id, lanzamos una excepcion
            throw new PreguntaNoEncontradaError(intentoPregunta.idPregunta);
        }
        const respuesta = await Respuesta.findByPk(intentoPregunta.idRespuesta);
        if (!respuesta) {
            // Si no se encuentra la respuesta por su id, lanzamos una excepcion
            throw new RespuestaNoEncontradaError(intentoPregunta.idRespuesta);
        }
        if (pregunta.id != respuesta.idPregunta) {
            // Si la respuesta no "pertenece" a la pregunta, lanzamos una excepcion
            throw new PreguntaRespuestaError(intentoPregunta.idPregunta, intentoPregunta.idRespuesta);
        }
        const intentoTest = await IntentoTest.findByPk(intentoPregunta.idIntentoTest);
        if (!intentoTest) {
            // Si no se encuentra el intento, lanzamos una excepcion
            throw new IntentoTestNoEncontradoError(intentoPregunta.idIntentoTest);
        }
        // Buscamos un intento de pregunta por idIntentoTest y idPregunta
        const intentoPreguntaBd = await IntentoPregunta.findOne({ where: {
            idIntentoTest: intentoPregunta.idIntentoTest,
            idPregunta: intentoPregunta.idPregunta
        }});
        if(intentoPreguntaBd) {
            // Si ya se ha realizado un intento para esta pregunta en este mismo intento de test, lanzamos una excepcion
            throw new PreguntaYaIntentadaError(intentoPregunta.idIntentoTest, intentoPregunta.idPregunta);
        }
        // Si no se ha lanzado ninguna excepcion, guardamos el intento
        await IntentoPregunta.create({
            idPregunta: intentoPregunta.idPregunta,
            idRespuesta: intentoPregunta.idRespuesta,
            idIntentoTest: intentoPregunta.idIntentoTest
        });
        // Añadimos la respuesta que el usuario ha marcado para que pueda usarla la vista
        pregunta.respuestaSeleccionada = respuesta;
        return pregunta;
    }

}

module.exports = new ServicioIntento(); // Exportamos una instancia (singleton)