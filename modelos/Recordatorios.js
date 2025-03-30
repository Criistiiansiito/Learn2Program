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
    type: DataTypes.STRING(200),
    allowNull: false
  },
  asunto: {
    type: DataTypes.STRING(100), // Título para el recordatorio (asunto del correo)
    allowNull: false
  }
}, {
  tableName: "recordatorios", // Nombre de la tabla en la BD
  timestamps: false // Evita que sequelize añada createdAt y updatedAt automáticamente
});

module.exports = Recordatorio;
