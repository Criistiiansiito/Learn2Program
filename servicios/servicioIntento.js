const Curso = require("../modelos/Curso");
const Pregunta = require("../modelos/Pregunta");
const Respuesta = require("../modelos/Respuesta");
const Test = require("../modelos/Test");
const IntentoTest = require("../modelos/IntentoTest");
const IntentoPregunta = require("../modelos/IntentoPregunta");
const {
    PreguntaYaIntentadaError,
    CursoNoEncontradoError,
    IntentoPreguntaNoEncontradoError,
    TestNoEncontradoError,
    IntentoTestNoEncontradoError,
    IntentoTestTerminadoError,
    RespuestaNoEncontradaError,
    PreguntasSinResponderError
} = require("../utils/errores");

// Clase que maneja la lógica de negocio de los intentos de preguntas
class ServicioIntentoTest {

    /**
     * Inicia un intento de test
     * 
     * @param {Number} idTest - El id del test a intentar
     * @param {Number} idUsuario - El id del usuario en la sesión
     * @returns {Promise<Number>} El id del intento de test creado
     */
    async intentarTest(idTest, idUsuario) {
        // Obtenemos el test con sus preguntas
        const test = await Test.findByPk(idTest, {
            include: [
                {
                    model: Pregunta,
                    as: "preguntas"
                }
            ]
        });
        // Si no se encuentra el test, lanzamos una excepcion
        if (!test) {
            throw new TestNoEncontradoError(idTest);
        }
        // Para cada pregunta del test creamos un intento de pregunta no realizado (con idRespuesta nulo)
        const intentosPregunta = [];
        test.preguntas.forEach((pregunta) => {
            intentosPregunta.push({ idPregunta: pregunta.id });
        });
        // Creamos el intento de test con sus intentos de pregunta
        const intentoTest = await IntentoTest.create(
            {
                idTest: idTest,
                idUsuario: idUsuario,
                intentos_pregunta: intentosPregunta,
            },
            {
                include: [
                    {
                        model: IntentoPregunta,
                        as: "intentos_pregunta",
                    },
                ],
            }
        );
        return intentoTest.id;
    }

    /**
     * Termina un intento de test.
     * 
     * Inicia el número de preguntas acertadas, la nota, y la fecha, y guarda el intento
     * actualizado
     * 
     * @param {Number} idIntentoTest - Id del intento de test a terminar
     * @param {Number} idUsuario - Id del usuario en la sesión
     * @returns {Number} El id del curso al que pertenece el test
     */
    async terminarIntento(idIntentoTest, idUsuario) {
        // Buscamos el intento de test por su id, con su test, y sus intentos de pregunta y respuestas
        const intentoTest = await IntentoTest.findOne({
            where: {
                id: idIntentoTest,
                idUsuario: idUsuario
            },
            include: [
                {
                    model: Test,
                    as: "test"
                },
                {
                    model: IntentoPregunta,
                    as: "intentos_pregunta",
                    include: [
                        {
                            model: Respuesta,
                            as: "respuesta"
                        }
                    ]
                }
            ]
        });
        if (!intentoTest) {
            // Si no existe el intento, lanzamos una excepción
            throw new IntentoTestNoEncontradoError(idIntentoTest);
        }
        const numeroPreguntas = intentoTest.intentos_pregunta.length
        if (intentoTest.preguntasIntentadas < numeroPreguntas) {
            // Si hay preguntas sin responder, lanzamos una excepcion
            throw new PreguntasSinResponderError(idIntentoTest);
        }
        // Actualizamos los campos del intento
        intentoTest.nota = ((intentoTest.preguntasAcertadas / numeroPreguntas) * 10).toFixed(2);
        intentoTest.terminado = true;
        intentoTest.fechaFin = new Date();
                
        await intentoTest.save();
        
        // Guardamos el intento actualizado
        await intentoTest.save();

        return intentoTest.test ? intentoTest.test.idCurso : null;
    }

    /**
     * Impletementa la lógica de negocio de los intentos de preguntas.
     * 
     * A efectos de implementación, consideramos responder (intentar) una pregunta como
     * actualizar el campo idPregunta (inicialmente nulo)
     *
     * @param {Number} idIntentoTest - Id del intento de test asociado al intento de la pregunta
     * @param {Number} numeroPregunta - Id de la pregunta a intentar
     * @param {Number} idRespuesta - Id de la respuesta a la pregunta
     * @param {Number} idUsuario - Id del usuario en la sesión
     */
    async intentarPregunta(idIntentoTest, numeroPregunta, idRespuesta, idUsuario) {
        // Buscamos la respuesta con su intento de pregunta y su intento de test correspondientes al parametro
        const respuesta = await Respuesta.findByPk(idRespuesta, {
            include: [
                {
                    model: Pregunta,
                    as: "pregunta",
                    where: { numero: numeroPregunta },
                    include: [
                        {
                            model: IntentoPregunta,
                            as: "intentos_pregunta",
                            include: [
                                {
                                    model: IntentoTest,
                                    as: "intento_test",
                                    where: {
                                        id: idIntentoTest,
                                        idUsuario: idUsuario
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        if (!respuesta) {
            // Si no se encuentra la respuesta, lanzamos una excepción
            throw new RespuestaNoEncontradaError(idIntentoTest, numeroPregunta, idRespuesta);
        }
        const intentoPregunta = respuesta.pregunta.intentos_pregunta[0];
        if (intentoPregunta.intento_test.terminado) {
            // Si el intento de test, al que corresponde el intento de pregunta, ya se ha terminado, lanzamos una excepcion
            throw new IntentoTestTerminadoError(idIntentoTest);
        }
        if (intentoPregunta.idRespuesta) {
            // Si ya se ha respondido a la pregunta, lanzamos una excepción
            throw new PreguntaYaIntentadaError(idIntentoTest, numeroPregunta);
        }
        // Actualizamos las preguntas intentadas
        const intentoTest = intentoPregunta.intento_test;
        intentoTest.preguntasIntentadas++;
        // Actualizamos la puntuación del test
        if (respuesta.esCorrecta) {
            intentoTest.preguntasAcertadas++;
        }
        await intentoTest.save();
        // Actualizamos el intento de la pregunta
        intentoPregunta.idRespuesta = idRespuesta;
        await intentoPregunta.save();
    }

    /**
     * Obtiene el intento de una pregunta en el contexto del intento del test
     *
     * @param {Number} idIntentoTest - Id del intento de test asociado al intento de la pregunta
     * @param {Number} numeroPregunta - Id de la pregunta sobre la que queremos obtener el intento
     * @param {Number} idUsuario - Id del usuario en la sesión
     * @returns {Object} El intento de test, con el intento de pregunta
     */
    async obtenerIntentoPregunta(idIntentoTest, numeroPregunta, idUsuario) {
        const intentoPregunta = await IntentoPregunta.findOne({
            include: [
                {
                    model: IntentoTest,
                    as: "intento_test",
                    where: {
                        id: idIntentoTest,
                        idUsuario: idUsuario
                    },
                    include: [
                        {
                            model: Test,
                            as: "test",
                            include: [
                                {
                                    model: Pregunta,
                                    as: "preguntas"
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Pregunta,
                    as: "pregunta",
                    where: {
                        numero: numeroPregunta,
                    },
                },
            ],
        });
        if (!intentoPregunta) {
            // Si no se encuentra el intento, lanzamos una excepción
            throw new IntentoPreguntaNoEncontradoError(idIntentoTest, numeroPregunta);
        }
        // Definimos una funcion que busque una pregunta (excluyendo los atributos en excluyeP) con sus respuestas (excluyendo los atributos en excluyeR)
        const encuentraPregunta = async (excluyeP, excluyeR) => {
            return await Pregunta.findOne({
                where: {
                    idTest: intentoPregunta.intento_test.idTest,
                    numero: numeroPregunta,
                },
                include: [
                    {
                        model: Respuesta,
                        as: "respuestas",
                        attributes: { exclude: excluyeR },
                    },
                ],
                attributes: { exclude: excluyeP },
            });
        }
        let pregunta;
        if (intentoPregunta.idRespuesta) {
            // Si la pregunta ya ha sido respondida, cargamos la pregunta con retroalimentación y respuestas con 'esCorrecta'
            pregunta = await encuentraPregunta([], []);
        } else {
            // Si no ha sido respondida, cargamos la pregunta excluyendo retroalimentacion y respuestas con 'esCorrecta'
            pregunta = await encuentraPregunta(["retroalimentacion"], ["esCorrecta"]);
        }
        // Añadimos la pregunta a intentoPregunta.intento_test
        intentoPregunta.intento_test.test.numeroPreguntas = intentoPregunta.intento_test.test.preguntas.length;
        intentoPregunta.intento_test.test.preguntas = [pregunta];
        intentoPregunta.intento_test.test.preguntas[0].idRespuestaSeleccionada = intentoPregunta.idRespuesta;
        return intentoPregunta.intento_test;
    }

    /**
     * Obtiene un curso junto con su test y sus intentos
     * 
     * @param {Number} idCurso - El id del curso al que pertenece el test al que pertenecen los intentos
     * @param {Number} idUsuario - El id del usuario en la sesión
     * @returns {Object} El curso con el id proporcionado y su test con sus intentos
     * @throws {CursoNoEncontradoError} Si no se encuentra ningún curso con el id indicado
     */
    async obtenerIntentosTest(idCurso, idUsuario) {

        // Eliminamos los intentos no terminados
        await IntentoTest.destroy({
            where: {
                terminado: false
            }
        });

        const curso = await Curso.findByPk(idCurso, {
            include: [
                {
                    model: Test,
                    as: "test",
                }
            ]
        });

        
        if (!curso) {
            throw new CursoNoEncontradoError(idCurso);
        }
        const intentos = await IntentoTest.findAll({
            where: {
                idTest: curso.test.id,
                idUsuario: idUsuario
            }
        })
        curso.test.intentos = intentos;

        return curso;
    }

}

module.exports = new ServicioIntentoTest(); // Exportamos una instancia (singleton)
