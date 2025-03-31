const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const IntentoPregunta = require('./IntentoPregunta');

// Entidad IntentoTest
const IntentoTest = sequelize.define("IntentoTest", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    preguntasAcertadas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    nota: { // Nota sobre 10
        type: DataTypes.DOUBLE
    },
    terminado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    fechaFin: {
        type: DataTypes.DATE
    }
},
    {
        tableName: "intentos_test", // Nombre de la tabla en la BD
        timestamps: false // Evita que sequelize añada createdAt y updatedAt automaticamente
    }
);

// Relacion 1:N con IntentoPregunta
IntentoTest.hasMany(IntentoPregunta, { as: "intentos_pregunta", foreignKey: "idIntentoTest", onDelete: "CASCADE" });
IntentoPregunta.belongsTo(IntentoTest, { as: "intento_test", foreignKey: "idIntentoTest" });

module.exports = IntentoTest;