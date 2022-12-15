const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: false,
		},
		status: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
