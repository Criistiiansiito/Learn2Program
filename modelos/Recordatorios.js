const DataTypes = require("sequelize");
const sequelize = require("../database/connection");
const Usuario = require("./Usuario"); // Asegúrate de que la ruta es correcta

const Recordatorios = sequelize.define("Recordatorio", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATE,
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

module.exports = Recordatorios;
