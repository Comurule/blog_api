const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		verified: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
