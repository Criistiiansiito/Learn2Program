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
    type: DataTypes.STRING(100),
    allowNull: false
  },
  idUsuario: { // Clave foránea que se refiere al modelo Usuario
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario, // Referencia al modelo Usuario
      key: 'id'  // Usamos la clave primaria del modelo Usuario
    },
    onDelete: 'CASCADE' // Si el usuario se elimina, también se eliminan los recordatorios asociados
  }
}, {
  tableName: "recordatorios",
  timestamps: false
});

Recordatorios.belongsTo(Usuario, { foreignKey: "idUsuario", as: "usuario" });

module.exports = Recordatorios;
