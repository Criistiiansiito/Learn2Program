const { Sequelize } = require('sequelize');

// Conexion con la base de datos con sequelize
const sequelize = new Sequelize({
    dialect: "mysql", // Cambiar si usas otro gestor
    host: process.env.DB_HOST,    
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,        
    database: process.env.DB_NAME,
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: process.env.DB_REMOTE === "true"
        },
        connectTimeout: 60000
    }   
});

module.exports = sequelize;
