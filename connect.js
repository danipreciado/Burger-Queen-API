/* eslint-disable no-console */
const mongoose = require('mongoose');
const config = require('./config');

// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;

async function connect() {
  // TODO: Conexión a la Base de Datos
  try {
    await mongoose.connect(dbUrl);
    console.log('db connected succesfully');
  } catch (error) {
    console.log(`error: ${error.message}`);
  }
}

module.exports = { connect };
