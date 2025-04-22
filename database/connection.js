const { Sequelize } = require('sequelize');

// Configuración de la conexión con la base de datos
const sequelize = new Sequelize({
    dialect: "mysql", // Cambiar si usas otro gestor
    host: process.env.DB_HOST,    
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,        
    database: process.env.DB_NAME,
    
});

module.exports = sequelize;
