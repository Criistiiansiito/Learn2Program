const MENSAJES = {
    PREGUNTA_NO_ENCONTRADA: (id) => `La pregunta con id ${id} no se ha podido encontrar`,
    RESPUESTA_NO_ENCONTRADA: (id) => `La respuesta con id ${id} no se ha podido encontrar`,
    RESPUESTA_NO_PERTENECE_PREGUNTA: (idPregunta, idRespuesta) => `La respuesta con id ${idRespuesta} no pertenece a la pregunta con id ${idPregunta}`,
    INTENTO_TEST_NO_ENCONTRADO: (id) => `El intento con id ${id} no se ha podido encontrar`,
    PREGUNTA_YA_INTENTADA: (idIntentoTest, idPregunta) => `La pregunta con id ${idPregunta} ya ha sido respondida en el intento ${idIntentoTest}`
};

module.exports = MENSAJES;
