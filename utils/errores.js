const { StatusCodes } = require('http-status-codes');
const MENSAJES = require('./mensajes');

class PreguntaNoEncontradaError extends Error {
    constructor(id) {
        super(MENSAJES.PREGUNTA_NO_ENCONTRADA(id));
    }
}

class RespuestaNoEncontradaError extends Error {
    constructor(id) {
        super(MENSAJES.RESPUESTA_NO_ENCONTRADA(id));
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

class PreguntaYaIntentadaError extends Error {
    constructor(idIntentoTest, idPregunta) {
        super(MENSAJES.PREGUNTA_YA_INTENTADA(idIntentoTest, idPregunta));
    }
}

module.exports = {
    PreguntaNoEncontradaError,
    RespuestaNoEncontradaError,
    PreguntaRespuestaError,
    IntentoTestNoEncontradoError,
    PreguntaYaIntentadaError
};