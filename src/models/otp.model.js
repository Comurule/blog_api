const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'User',
			required: true,
		},
		otp: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('otp', otpSchema)
