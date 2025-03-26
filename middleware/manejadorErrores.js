const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { PreguntaNoEncontradaError, RespuestaNoEncontradaError, PreguntaRespuestaError, PreguntaYaIntentadaError, IntentoTestNoEncontradoError } = require("../utils/errores");

// Gestiona las posibles excepciones
function errorHandler(err, req, res, next) {
  if (err instanceof PreguntaNoEncontradaError) {
    return res.status(StatusCodes.NOT_FOUND).send(err.message);
  }
  if (err instanceof RespuestaNoEncontradaError) {
    return res.status(StatusCodes.NOT_FOUND).send(err.message);
  }
  if (err instanceof PreguntaRespuestaError) {
    return res.status(StatusCodes.CONFLICT).send(err.message);
  }
  if (err instanceof IntentoTestNoEncontradoError) {
    return res.status(StatusCodes.NOT_FOUND).send(err.message);
  }
  if (err instanceof PreguntaYaIntentadaError) {
    return res.status(StatusCodes.CONFLICT).send(err.message);
  }
  console.error("Error no manejado:", err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
}

module.exports = errorHandler;
