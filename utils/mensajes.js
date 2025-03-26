const MENSAJES = {
    TEST_NO_ENCONTRADO: (id) => `El test con id ${id} no se ha podido encontrar`,
    PREGUNTA_NO_ENCONTRADA: (idTest, numero) => `La pregunta numero ${numero} no se ha podido encontrar en el test ${idTest}`,
    RESPUESTA_NO_ENCONTRADA: (id) => `La respuesta con id ${id} no se ha podido encontrar`,
    PREGUNTA_NO_PERTENCE_TEST: (idTest, idPregunta) => `La pregunta con id ${idPregunta} no pertenece al test con id ${idTest}`,
    RESPUESTA_NO_PERTENECE_PREGUNTA: (idPregunta, idRespuesta) => `La respuesta con id ${idRespuesta} no pertenece a la pregunta con id ${idPregunta}`,
    INTENTO_TEST_NO_ENCONTRADO: (id) => `El intento con id ${id} no se ha podido encontrar`,
    INTENTO_PREGUNTA_NO_ENCONTRADO: (idIntentoTest, idPregunta) => `El intento de pregunta con id intento test ${idIntentoTest} e id pregunta ${idPregunta} no se ha podido encontrar`,
    PREGUNTA_YA_INTENTADA: (idIntentoTest, idPregunta) => `La pregunta con id ${idPregunta} ya ha sido respondida en el intento ${idIntentoTest}`
};

module.exports = MENSAJES;
