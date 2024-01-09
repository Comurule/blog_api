// Load all environment variables
const dotenv = require('dotenv');
const constants = require('./constants');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 8000,
  DATABASE_URL: process.env.DATABASE_URL,

  isProduction: process.env.NODE_ENV === 'production',
  ...constants,
};
