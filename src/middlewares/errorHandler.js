const { AppError } = require('../utils/Errors');
const logger = require('../utils/logger');
const config = require('../config');

module.exports = (err, req, res) => {
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ status: 'error', message: err.message });
  }
  let resObj = {};

  if (config.isProduction) {
    logger.error(err);
    resObj = {
      status: 'error',
      messsage: 'Something went wrong. Try again later.',
    };
  } else {
    resObj = {
      status: 'error',
      message: err.message,
      data: err.stack,
    };
  }

  return res.status(500).json(resObj);
  // return process.exit(1)
};
