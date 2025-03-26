const { StatusCodes } = require('http-status-codes');
const MENSAJES = require('./mensajes');

class TestNoEncontradoError extends Error {
    constructor(id) {
        super(MENSAJES.TEST_NO_ENCONTRADO(id))
    }
}

class PreguntaNoEncontradaError extends Error {
    constructor(idTest, numero) {
        super(MENSAJES.PREGUNTA_NO_ENCONTRADA(idTest, numero));
    }
}

class RespuestaNoEncontradaError extends Error {
    constructor(id) {
        super(MENSAJES.RESPUESTA_NO_ENCONTRADA(id));
    }
}

class TestPreguntaError extends Error {
    constructor(idTest, idPregunta) {
        super(MENSAJES.PREGUNTA_NO_PERTENCE_TEST(idTest, idPregunta));
    }
}

class PreguntaRespuestaError extends Error {
    constructor(idPregunta, idRespuesta) {
        super(MENSAJES.RESPUESTA_NO_PERTENECE_PREGUNTA(idPregunta, idRespuesta));
    }
}

class IntentoTestNoEncontradoError extends Error {
    constructor(idIntentoTest) {
        super(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idIntentoTest));
    }
}

class IntentoPreguntaNoEncontradoError extends Error {
    constructor(idIntentoTest, idPregunta) {
        super(MENSAJES.INTENTO_PREGUNTA_NO_ENCONTRADO(idIntentoTest, idPregunta));
    }
}

class PreguntaYaIntentadaError extends Error {
    constructor(idIntentoTest, idPregunta) {
        super(MENSAJES.PREGUNTA_YA_INTENTADA(idIntentoTest, idPregunta));
    }
}

module.exports = {
    PreguntaNoEncontradaError,
    RespuestaNoEncontradaError,
    TestPreguntaError,
    PreguntaRespuestaError,
    IntentoTestNoEncontradoError,
    IntentoPreguntaNoEncontradoError,
    PreguntaYaIntentadaError
};