const DataTypes = require('sequelize');
const sequelize = require('../database/connection');
const Tema = require('./Tema');
const Test = require('./Test');

const Curso = sequelize.define("Curso", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    }
},
    {
        tableName: "cursos", // Nombre de la tabla en la BD
        timestamps: false // Evita que sequelize añada createdAt y updatedAt automaticamente
    }
);

// Relacion 1:N con Tema
Curso.hasMany(Tema, {
    as: "temas", // Nombre que se le dará a los temas de un test en el objeto (con eager load)
    foreignKey: "idCurso",
    onDelete: "CASCADE"
});
Tema.belongsTo(Curso, { foreignKey: "idCurso" });

// Relacion 1:1 con Test
Curso.hasOne(Test, { as: "test", foreignKey: "idCurso" });
Test.belongsTo(Curso, { foreignKey: "idCurso" });

module.exports = Curso;
