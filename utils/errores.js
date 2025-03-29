const MENSAJES = require('./mensajes');

class TestNoEncontradoError extends Error {
    constructor(id) {
        super(MENSAJES.TEST_NO_ENCONTRADO(id))
    }
}

class TestPreguntaError extends Error {
    constructor(idTest, idPregunta) {
        super(MENSAJES.PREGUNTA_NO_PERTENCE_TEST(idTest, idPregunta));
    }
}

class IntentoTestNoEncontradoError extends Error {
    constructor(idTest) {
        super(MENSAJES.INTENTO_TEST_NO_ENCONTRADO(idTest));
    }
}

class IntentoTestTerminadoError extends Error {
    constructor(idIntentoTest) {
        super(MENSAJES.INTENTO_TEST_TERMINADO(idIntentoTest))
    }
}

class IntentoPreguntaNoEncontradoError extends Error {
    constructor(idIntentoTest, numeroPregunta) {
        super(MENSAJES.INTENTO_PREGUNTA_NO_ENCONTRADO(idIntentoTest, numeroPregunta));
    }
}

class RespuestaNoEncontradaError extends Error {
    constructor(idIntentoTest, numeroPregunta, idRespuesta) {
        super(MENSAJES.RESPUESTA_NO_ENCONTRADA(idIntentoTest, numeroPregunta, idRespuesta));
    }
}


class PreguntaYaIntentadaError extends Error {
    constructor(idIntentoTest, numeroPregunta) {
        super(MENSAJES.PREGUNTA_YA_INTENTADA(idIntentoTest, numeroPregunta));
    }
}

class CursoNoEncontradoError extends Error {
    constructor(idCurso) {
        super(MENSAJES.CURSO_NO_ENCONTRADO(idCurso));
    }
}

module.exports = {
    TestNoEncontradoError,
    TestPreguntaError,
    RespuestaNoEncontradaError,
    IntentoTestNoEncontradoError,
    IntentoPreguntaNoEncontradoError,
    RespuestaNoEncontradaError,
    IntentoTestTerminadoError,
    PreguntaYaIntentadaError,
    CursoNoEncontradoError
};
