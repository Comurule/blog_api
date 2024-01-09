const http = require('http');
const app = require('../src');
const logger = require('../src/utils/logger');
const { connectToDB } = require('../src/database/connectToDB');
const config = require('../src/config');

const port = config.PORT;
const databaseUrl = config.DATABASE_URL;

const server = http.createServer(app);

// DB connect
logger.info('[Wait!]:::Connecting to Database...');
connectToDB(databaseUrl)
  .then(async () => {
    logger.info('Connected to Database...');

    server.listen(port, () => {
      logger.info(`App is running and listening on Port: ${port}`);
    });
  })
  .catch((error) => {
    logger.error(error);
    process.exit(0);
  });
