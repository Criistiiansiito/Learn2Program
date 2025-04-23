const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const LogroUsuario = sequelize.define('LogroUsuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  idLogro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'LogroUsuario',
  timestamps: false
});

module.exports = LogroUsuario;
