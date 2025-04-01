const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Ruta del archivo del certificado SSL
const sslCertPath = path.resolve(__dirname, '../ssl.pem');

// Variable que contiene el certificado en formato Base64 (debe estar configurada en tu entorno)
const sslCertBase64 = process.env.SSL;

// Función para obtener el certificado SSL
function getSslCert() {
  if (fs.existsSync(sslCertPath)) {
    // Si el archivo ssl.pem existe, lo leemos y lo devolvemos
    return fs.readFileSync(sslCertPath);
  } else if (sslCertBase64) {
    // Si el archivo no existe pero la variable de entorno SSL_CERT está definida, la decodificamos y la devolvemos
    return Buffer.from(sslCertBase64, 'base64');
  } else {
    // Si no se encuentra el certificado, lanzamos un error
    throw new Error('No se encontró el certificado SSL. Asegúrate de que ssl.pem exista o que la variable de entorno SSL_CERT esté definida.');
  }
}

// Configuración de la conexión con la base de datos
const sequelize = new Sequelize({
  dialect: 'mysql', // Cambia esto si utilizas otro gestor de base de datos
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      ca: getSslCert()
    }
  }
});

module.exports = sequelize;
