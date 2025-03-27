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
    TestNoEncontradoError,
    TestPreguntaError,
    IntentoPreguntaNoEncontradoError,
    PreguntaYaIntentadaError
};
