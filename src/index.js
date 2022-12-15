const express = require('express')
const routes = require('./routes')
const { connectToDB } = require('./db')
const config = require('./config')
const logger = require('./utils/logger')
const errorHandler = require('./middlewares/errorHandler')

const app = express()
const port = config.PORT
const databaseUrl = config.DATABASE_URL

// Application middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

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
