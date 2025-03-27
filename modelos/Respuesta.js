const DataTypes = require('sequelize');
const sequelize = require('../database/connection');
const IntentoPregunta = require('./IntentoPregunta');

// Entidad Respuesta
const Respuesta = sequelize.define("Respuesta", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    esCorrecta: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
},
    {
        tableName: "respuestas", // Nombre de la tabla en la BD
        timestamps: false
    }
);

// Relacion 1:N con IntentoPregunta
Respuesta.hasMany(IntentoPregunta, { as: "intentos", foreignKey: "idRespuesta", onDelete: "CASCADE" });
IntentoPregunta.belongsTo(Respuesta, { as: "respuesta", foreignKey: "idRespuesta" });

module.exports = Respuesta;