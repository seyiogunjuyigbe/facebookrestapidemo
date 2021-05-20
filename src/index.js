const express = require('express');

const app = express();

const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();

const DB = require('./db/index');

const { DB_URL, PORT } = process.env;

new DB().connect(DB_URL);

const port = PORT || 3000;

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
app.use(morgan('dev'));

app.use(routes);
app.get('/', (req, res) => res.json({ message: 'Hello World', data: null }));
app.use(errorHandler);
app.all('*', (req, res) =>
  res.status(404).json({
    message: 'Requested route not found',
    data: null,
  })
);
app.listen(port, () => console.log(`API listening on port ${port}`));
