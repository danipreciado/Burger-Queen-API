/* eslint-disable no-console */
const express = require('express');
const { connect } = require('./connect');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');

const { port, secret } = config;
const app = express();

app.set('config', config);
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});

connect();
/* const client = new MongoClient(config.dbUrl);

async function run() {
  try {
    const database = client.db('burger_queen');
    const users = database.collection('users');
    // Query for a movie that has the title 'Back to the Future'
    const query = { name: 'dani' };
    const user = await users.findOne(query);
    console.log(user);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir); */
