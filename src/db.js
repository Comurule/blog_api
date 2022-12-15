const mongoose = require('mongoose')

exports.connectToDB = (databaseUrl) => {
	const defaultOptions = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000,
		// useFindAndModify: false,
	}

	return mongoose.connect(databaseUrl, defaultOptions)
}
