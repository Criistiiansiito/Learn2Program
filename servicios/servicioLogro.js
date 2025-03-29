const Curso = require("../modelos/Curso");
const Logro = require("../modelos/Logro");
const Test = require("../modelos/Test");
const IntentoTest = require("../modelos/IntentoTest");
const moment = require("moment");

const {
    IntentoTestNoEncontradoError
} = require("../utils/errores");

// Clase que maneja la lógica de negocio de los logros
class ServicioLogro {

    /**
     * Obtiene el logro de un curso
     * 
     * @param {Number} idIntentoTest - El id del curso al que pertenece el logro
     * @returns {Promise<Object>} El intento
     */
    async ObtenerLogro(idIntentoTest) {
        // Obtenemos el curso con su logro
        const intento = await IntentoTest.findByPk(idIntentoTest, {
            include: [{
                model: Test,
                as: "test",
                include: [{
                  model: Curso,
                    as: "curso",
                    include: [{
                        model: Logro,
                        as: "logro"
                    }]
                }]
            }]
        });
        
        // Si no se encuentra el curso, lanzamos una excepcion
        if(!intento) {
            throw new IntentoTestNoEncontradoError(idIntentoTest);
        }

        // Formatear la fecha de obtención del logro
        intento.test.curso.logro.fechaObtencion = moment(intento.test.curso.logro.fechaObtencion).format('DD-MM-YYYY');

        return intento;
    }

}

module.exports = new ServicioLogro(); // Exportamos una instancia (singleton)
