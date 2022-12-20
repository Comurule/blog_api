const express = require('express')
const cors = require("cors");
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes')
const { connectToDB } = require('./db')
const config = require('./config')
const logger = require('./utils/logger')
const errorHandler = require('./middlewares/errorHandler')

const app = express()
const port = config.PORT
const databaseUrl = config.DATABASE_URL

// Application middlewares
app.set('trust proxy', 1) // trust first proxy
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(cors())
app.options('*', cors())

app.use(helmet())

function customHeaders(req, res, next) {
  app.disable('x-powered-by');
  res.setHeader('X-Powered-By', 'Docuplier Inc');
  next();
}
app.use(customHeaders);

// Application routes
app.use(routes)

// Application Level Error Handling
app.use((err, req, res, next) => errorHandler(err, req, res))

// DB connect
logger.info('[Wait!]:::Connecting to Database...')
connectToDB(databaseUrl)
	.then(async () => {
		logger.info('Connected to Database...')

		app.listen(port, () => {
			logger.info(`App is running and listening on Port: ${port}`)
		})
	})
	.catch((error) => {
		logger.error(error)
		process.exit(0)
	})
