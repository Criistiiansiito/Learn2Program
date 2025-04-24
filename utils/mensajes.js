const MENSAJES = {
    TEST_NO_ENCONTRADO: (id) => `El test con id ${id} no se ha podido encontrar`,
    PREGUNTA_NO_ENCONTRADA: (idTest, numero) => `La pregunta numero ${numero} no se ha podido encontrar en el test ${idTest}`,
    RESPUESTA_NO_ENCONTRADA: (id) => `La respuesta con id ${id} no se ha podido encontrar`,
    PREGUNTA_NO_PERTENCE_TEST: (idTest, idPregunta) => `La pregunta con id ${idPregunta} no pertenece al test con id ${idTest}`,
    RESPUESTA_NO_PERTENECE_PREGUNTA: (idPregunta, idRespuesta) => `La respuesta con id ${idRespuesta} no pertenece a la pregunta con id ${idPregunta}`,
    INTENTO_TEST_NO_ENCONTRADO: (id) => `El intento con id ${id} no se ha podido encontrar`,
    INTENTO_PREGUNTA_NO_ENCONTRADO: (idIntentoTest, numeroPregunta) => `El intento de la pregunta numero ${numeroPregunta} no se ha podido encontrar en el intento de test con id ${idIntentoTest}`,
    RESPUESTA_NO_ENCONTRADA: (idIntentoTest, numeroPregunta, idRespuesta) => `La respuesta con id ${idRespuesta} no se ha podido encontrar en la pregunta numero ${numeroPregunta} del intento de test con id ${idIntentoTest}`,
    INTENTO_TEST_TERMINADO: (id) => `El intento de test con id ${id} ya se ha terminado`,
    PREGUNTA_YA_INTENTADA: (idIntentoTest, numeroPregunta) => `La pregunta numero ${numeroPregunta} ya ha sido respondida en el intento ${idIntentoTest}`,
    CURSO_NO_ENCONTRADO: (idCurso) => `El curso con id ${idCurso} no se ha podido encontrar`,
    INTENTO_NO_USUARIO: (idIntentoTest, idUsuario) => `El intento de test ${idIntentoTest} no pertence al usuario ${idUsuario}`
};

module.exports = MENSAJES;
