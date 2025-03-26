const DataTypes = require('sequelize');
const sequelize = require('../database/connection');

// Entidad IntentoPregunta
const IntentoPregunta = sequelize.define("IntentoPregunta", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
},
    {
        tableName: "intentos_pregunta", // Nombre de la tabla en la BD
        timestamps: false // Evita que sequelize añada createdAt y updatedAt automaticamente
    }
);

module.exports = IntentoPregunta;