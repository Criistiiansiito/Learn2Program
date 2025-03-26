const DataTypes = require('sequelize');
const sequelize = require('../database/connection');

// Entidad IntentoPregunta
const IntentoPregunta = sequelize.define("IntentoPregunta", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    respondida: { // Momento en el que se realizó el intento
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},
    {
        tableName: "intentos_pregunta", // Nombre de la tabla en la BD
        timestamps: false // Evita que sequelize añada createdAt y updatedAt automaticamente
    }
);

module.exports = IntentoPregunta;