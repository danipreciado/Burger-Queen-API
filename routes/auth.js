/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const User = require('../models/User');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return next(404);
    }

    const passwordMatches = await bcrypt.compare(password, userExists.password);
    const { role, _id } = userExists;
    if (!passwordMatches) {
      console.log('entra aca');
      return next(404);
    }
    // TODO: autenticar a la usuarix
    // Hay que confirmar si el email y password  ✅
    // coinciden con un user en la base de datos
    // Si coinciden, manda un access token creado con jwt  ✅

    const token = jwt.sign({
      _id,
      email,
      password,
      role,
    }, secret, { expiresIn: '1h' });
    resp.status(200);
    return resp.json({ token });
  });

  return nextMain();
};
