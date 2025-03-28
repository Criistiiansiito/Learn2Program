const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

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

// Relacion N:M con Logro
Usuario.belongsToMany(Logro, {
    through: "usuario_logro",
    foreignKey: "idUsuario",
    otherKey: "idLogro"
});

module.exports = Usuario;