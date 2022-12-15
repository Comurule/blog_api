// Load all environment variables
const dotenv = require('dotenv')
const constants = require('./constants')

dotenv.config()

module.exports = {
	PORT: process.env.PORT || 8000,
	DATABASE_URL: process.env.DATABASE_URL,
	MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
	MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,

	MAILER_SENDER_NAME: process.env.MAILER_SENDER_NAME,
	MAILER_SENDER_EMAIL: process.env.MAILER_SENDER_EMAIL,
	
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
	
	isProduction: process.env.NODE_ENV === 'production',
	constants,
}
