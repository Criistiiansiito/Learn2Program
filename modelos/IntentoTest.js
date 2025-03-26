const DataTypes = require('sequelize');
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
        allowNull: false
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
IntentoTest.hasMany(IntentoPregunta, { as: "intentosPregunta", foreignKey: "idIntentoTest", onDelete: "CASCADE" });
IntentoPregunta.belongsTo(IntentoTest, { foreignKey: "idIntentoTest" });

module.exports = IntentoTest;