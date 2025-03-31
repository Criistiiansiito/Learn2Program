const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
const IntentoTest = require("./IntentoTest");
const Recordatorios = require("./Recordatorios"); // Asegúrate de que el nombre coincide con el modelo

const Usuario = sequelize.define("Usuario", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, 
{
    tableName: "usuario",
    timestamps: false
});

// Relación 1:N con IntentoTest
Usuario.hasMany(IntentoTest, { foreignKey: "idUsuario", onDelete: "CASCADE" });
IntentoTest.belongsTo(Usuario, { foreignKey: "idUsuario" });

// Relación 1:N con Recordatorios

// Relación 1:N con Recordatorios
Usuario.hasMany(Recordatorios, { 
    foreignKey: "idUsuario",  // Relación a través de la clave foránea en Recordatorios
    as: "recordatorios",      // Alias para acceder a los recordatorios de un usuario
    onDelete: "CASCADE"       // Si el usuario se elimina, se eliminan sus recordatorios
  });
Recordatorios.belongsTo(Usuario, { foreignKey: "idUsuario", as: "usuario" });

module.exports = Usuario;
