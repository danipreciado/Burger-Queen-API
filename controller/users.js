const bcrypt = require('bcrypt');
const User = require('../models/User');

function isEmail(email) {
  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implementa la función necesaria para traer la colección `users`

    try {
      // Get the pagination parameters from the query string
      const limit = parseInt(req.query.limit, 10) || 10;
      const page = parseInt(req.query.page, 10) || 1;
      // Calculate the skip value based on the limit and page
      const skip = (page - 1) * limit;

      // Fetch users with pagination using the limit and skip values
      const users = await User.find().limit(limit).skip(skip);

      // Count the total number of users in the collection
      const totalUsers = await User.countDocuments();

      // Calculate the total number of pages
      const totalPages = Math.ceil(totalUsers / limit);

      const linkHeaders = {
        first: `</users?page=1&limit=${limit}>; rel="first"`,
        prev: `</users?page=${page - 1}&limit=${limit}>; rel="prev"`,
        next: `</users?page=${page + 1}&limit=${limit}>; rel="next"`,
        last: `</users?page=${totalPages}&limit=${limit}>; rel="last"`,
      };

      resp.set('link', Object.values(linkHeaders).join(', '));

      resp.status(200).json(users);
    } catch (error) {
      resp.status(500).send('Error al obtener la lista de usuarios');
      next(error);
    }
  },

  postUser: async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    if (!isEmail(email)) {
      return next(400);
    }

    if (password.length < 4) {
      return next(400);
    }

    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      role: req.body.role,
    });
    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        resp.status(403).json({ error: 'User already registered' });
      } else {
        const savedUser = await user.save();
        resp.status(200);
        resp.json({ _id: savedUser._id, email: savedUser.email, role: savedUser.role });
      }
    } catch (error) {
      resp.status(404).send('Error al crear usuario');
      next(error);
    }
  },

  getUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      let user;
      if (uid.includes('@')) {
        user = await User.findOne({ email: uid });
      } else if (typeof uid === 'number') {
        user = await User.findOne({ _id: uid });
      }
      /* const user = await User.findOne({ _id: req.params.uid }); */

      if (user) {
        resp.status(200).json(user);
      } else {
        resp.status(404).send('Usuario no encontrado');
      }
    } catch (error) {
      resp.status(404).send('Error al buscar usuario');
      next(error);
    }
  },
  modifyUser: async (req, resp, next) => {
    const { email, password, role } = req.body;

    try {
      const { uid } = req.params;
      let user;

      if (uid.includes('@')) {
        user = await User.findOne({ email: uid });
      } else if (typeof uid === 'number') {
        user = await User.findOne({ _id: uid });
      }

      if (!user) {
        return resp.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (!email && !password && !role) {
        /* return resp.status(400).json({
          message: 'No se proporcionaron datos para modificar' }); */
        return next(400);
      }

      /*   if (req.decodedToken.role !== 'admin' || req.decodedToken.role === undefined) {
        if (role !== user.role) {
          next(403);
        }
      } */
      if (role !== undefined && req.decodedToken.role !== 'admin') {
        return next(403);
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);

        req.body.password = await bcrypt.hash(password, salt);
      }
      // eslint-disable-next-line max-len
      const updatedUser = await User.findByIdAndUpdate(user._id, req.body, { returnDocument: 'after' });
      resp.status(200).json(updatedUser);
    } catch (error) {
      resp.status(404).send('Error al modificar el usuario');
      next(404);
    }
  },
  deleteUser: async (req, resp, next) => {
    try {
      const { uid } = req.params;
      let user;
      if (uid.includes('@')) {
        user = await User.findOne({ email: uid });
      } else if (typeof uid === 'number') {
        user = await User.findOne({ _id: uid });
      }
      const deletedUser = await User.findByIdAndDelete(user._id);
      resp.status(200).json(deletedUser);
    } catch (error) {
      resp.status(404).send('Error al eliminar el usuario');
      next(error);
    }
  },
};
