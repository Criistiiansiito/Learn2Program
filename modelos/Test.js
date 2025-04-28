const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Pregunta = require('./Pregunta');
const IntentoTest = require('./IntentoTest');

const Test = sequelize.define("Test", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},
    {
        tableName: "test", // Nombre de la tabla en la BD
        timestamps: false // Evita que sequelize añada createdAt y updatedAt automaticamente
    }
);

// Relacion 1:N con Pregunta
Test.hasMany(Pregunta, { as: "preguntas", foreignKey: "idTest", onDelete: "CASCADE" });
Pregunta.belongsTo(Test, { foreignKey: "idTest" });

// Relacion 1:N con IntentoTest
Test.hasMany(IntentoTest, { as: "intentos", foreignKey: "idTest", onDelete: "CASCADE" });
IntentoTest.belongsTo(Test, { as: "test", foreignKey: "idTest" });

module.exports = Test;
