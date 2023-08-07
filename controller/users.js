const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implementa la función necesaria para traer la colección `users`
    try {
      const users = await User.find();
      resp.status(200).json(users);
    } catch (error) {
      resp.status(500).send('Error al obtener la lista de usuarios');
      next(error);
    }
  },

  postUser: async (req, resp, next) => {
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      role: req.body.role,
    });
    try {
      const savedUser = await user.save();
      resp.status(200);
      resp.json(savedUser);
    } catch (error) {
      resp.status(404).send('Error al crear usuario');
      next(error);
    }
  },

  getUser: async (req, resp, next) => {
    try {
      const user = await User.findOne({ _id: req.params.uid });
      resp.status(200).json(user);
    } catch (error) {
      resp.status(404).send('Error al crear usuario');
      next(error);
    }
  },

  modifyUser: async (req, resp, next) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.uid, req.body, { returnDocument: 'after' });
      resp.status(200).json(user);
    } catch (error) {
      resp.status(404).send('Error al modificar el usuario');
      next(error);
    }
  },
  deleteUser: async (req, resp, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.uid);
      resp.status(200).json(user);
    } catch (error) {
      resp.status(404).send('Error al eliminar el usuario');
      next(error);
    }
  },
};
