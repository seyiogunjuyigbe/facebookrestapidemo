const express = require('express');

const app = express();

const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();
const DatabaseConnection = require('./db/index');

new DatabaseConnection().connect(process.env.DB_URL);

const seedTestUser = require('./seeders/app');

seedTestUser().catch((e) => {
  console.log(e);
});
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes/index');

app.use(cors());
app.use(
  express.json({
    limit: '5mb',
    type: 'application/json',
  })
);
app.use(
  express.urlencoded({
    limit: '5mb',
    extended: true,
  })
);
// if (process.env.NODE_ENV !== "test") {
app.use(morgan('dev'));
// }
app.use(routes);

app.get('/', (req, res) => res.json({ message: 'Hello World', data: null }));
app.use(errorHandler);
app.all('*', (req, res) =>
  res.status(404).json({
    message: 'Requested route not found',
    data: null,
  })
);

module.exports = app;
