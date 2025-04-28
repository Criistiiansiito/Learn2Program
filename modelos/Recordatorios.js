const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Recordatorio = sequelize.define("Recordatorio", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATE, // cambiado de DATEONLY a DATE para incluir la hora
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  mensaje: {
    type: DataTypes.STRING(1000),  // Aumentar tamaño si es necesario
    allowNull: false
  },
  asunto: {
    type: DataTypes.STRING(255),  // Ajuste de tamaño según lo que necesites
    allowNull: false
  }  
}, {
  tableName: "recordatorios",
  timestamps: false
});

module.exports = Recordatorio;
