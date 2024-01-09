const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Application middlewares
app.set('trust proxy', 1); // trust first proxy
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.use(cors());
app.options('*', cors());

app.use(helmet());

function customHeaders(req, res, next) {
  app.disable('x-powered-by');
  res.setHeader('X-Powered-By', 'Comurule Inc');
  next();
}
app.use(customHeaders);

// Application routes
app.use('/api/v1', routes);

// Application Level Error Handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => errorHandler(err, req, res));

module.exports = app;
