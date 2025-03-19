
const mysql = require('mysql');

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,    
    user: process.env.DB_USER,         
    password: process.env.DB_PASSWORD,        
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;
