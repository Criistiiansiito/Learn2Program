const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");
const IntentoTest = require("./IntentoTest");
const Recordatorio = require("./Recordatorios");

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

// Relacion 1:N con intententoTest
Usuario.hasMany(IntentoTest, {
    foreignKey: "idUsuario",
    onDelete: "CASCADE"
});

// Relacion N:1 con Usuario
IntentoTest.belongsTo(Usuario, { foreignKey: "idUsuario" });
Usuario.hasMany(IntentoTest, { foreignKey: "idUsuario" });

// Relacion 1:N con Recordatorio
Usuario.hasMany(Recordatorio, {
    as: "recordatorios",
    foreignKey: "idUsuario",
    onDelete: "CASCADE"
});

module.exports = Usuario;