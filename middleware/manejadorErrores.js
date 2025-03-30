const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const { 
  PreguntaYaIntentadaError, 
  IntentoTestNoEncontradoError, 
  RespuestaNoEncontradaError, 
  IntentoPreguntaNoEncontradoError, 
  TestNoEncontradoError, 
  IntentoTestTerminadoError,
  CursoNoEncontradoError
 } = require("../utils/errores");

// Gestiona las posibles excepciones
function errorHandler(err, req, res, next) {
  const manejaError = (statusCode, mensaje) => res.status(statusCode).send(mensaje);
  if (err instanceof IntentoTestNoEncontradoError) {
    return manejaError(StatusCodes.NOT_FOUND, err.message);
  }
  if (err instanceof PreguntaYaIntentadaError) {
    return manejaError(StatusCodes.CONFLICT, err.message);
  }
  if (err instanceof IntentoPreguntaNoEncontradoError) {
    return manejaError(StatusCodes.NOT_FOUND, err.message);
  }
  if (err instanceof TestNoEncontradoError) {
    return manejaError(StatusCodes.NOT_FOUND, err.message);
  }
  if (err instanceof IntentoTestTerminadoError) {
    return manejaError(StatusCodes.CONFLICT, err.message);
  }
  if (err instanceof RespuestaNoEncontradaError) {
    return manejaError(StatusCodes.NOT_FOUND, err.message);
  }
  if (err instanceof CursoNoEncontradoError) {
    return manejaError(StatusCodes.NOT_FOUND, err.message);
  }
  console.error("Error no manejado:", err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
}

module.exports = errorHandler;
