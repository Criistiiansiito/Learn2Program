const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Curso = require('./Curso');

const Logro = sequelize.define("Logro", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mensajeMotivacionalCursoOK: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    mensajeMotivacionalCursoKO: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fechaObtencion: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: "logros",
    timestamps: false
});


module.exports = Logro;