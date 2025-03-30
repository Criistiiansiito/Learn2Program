const DataTypes = require('sequelize');
const sequelize = require('../database/connection');
const Tema = require('./Tema');
const Test = require('./Test');
const Logro = require('./Logro');

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

// Relacion 1:1 con Logro
Curso.hasOne(Logro, {
    as: "logro", 
    foreignKey: "idCurso" 
});
Logro.belongsTo(Curso, {
    as: "curso", 
    foreignKey: "idCurso", 
    onDelete: "CASCADE"
});

// Relacion 1:N con Tema
Curso.hasMany(Tema, {
    as: "temas", // Nombre que se le dará a los temas de un test en el objeto (con eager load)
    foreignKey: "idCurso",
    onDelete: "CASCADE"
});
Tema.belongsTo(Curso, { foreignKey: "idCurso" });

// Relacion 1:1 con Test
Curso.hasOne(Test, { as: "test", foreignKey: "idCurso" });
Test.belongsTo(Curso, { as: "curso", foreignKey: "idCurso" });

module.exports = Curso;
