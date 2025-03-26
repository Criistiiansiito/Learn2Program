const DataTypes = require('sequelize');
const sequelize = require('../database/connection');
const Respuesta = require('./Respuesta');
const IntentoPregunta = require('./IntentoPregunta');

// Entidad Pregunta
const Pregunta = sequelize.define("Pregunta", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    enunciado: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    retroalimentacion: {
        type: DataTypes.TEXT
    }
},
    {
        tableName: "preguntas", // Nombre de la tabla en la BD
        timestamps: false // Evita que sequelize añada createdAt y updatedAt automaticamente
    }
);

// Relacion 1:N con Respuesta
Pregunta.hasMany(Respuesta, { as: "respuestas", foreignKey: "idPregunta", onDelete: "CASCADE" });
Respuesta.belongsTo(Pregunta, { foreignKey: "idPregunta" });

// Relacion 1:N con Intento
Pregunta.hasMany(IntentoPregunta, { as: "intentos", foreignKey: "idPregunta", onDelete: "CASCADE" });
IntentoPregunta.belongsTo(Pregunta, { foreignKey: "idPregunta" });

module.exports = Pregunta;