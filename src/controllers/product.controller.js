const Product = require('../models/product.model')
const CustomError = require('../utils/customError')

exports.create = async (req, res, next) => {
	try {
		const isDuplicate = await Product.findOne({
			name: new RegExp(req.body.name, 'gi'),
		})
		let product;
		if (isDuplicate ){
			if(isDuplicate.status === true){
				throw new CustomError('Product name already exists!', 400)
			} else {
				isDuplicate.name = req.body.name;
				isDuplicate.status = true;
				if(req.body.description) isDuplicate.description = req.body.description;

				await isDuplicate.save()
				product = isDuplicate;
			}
		} else {
			product = await Product.create(req.body)
		}

		return res.status(201).json({
			status: 'success',
			message: 'Product created successfully.',
			data: product,
		})
	} catch (error) {
		return next(error)
	}
}

exports.update = async (req, res, next) => {
	try {
		if (req.body.name) {
			const isDuplicate = await Product.exists({
				id: { $ne: req.params.id },
				name: new RegExp(req.body.name, 'gi'),
			})
			if (isDuplicate)
				throw new CustomError('Product name already exists!', 400)
		}

		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		)

		return res.status(200).json({
			status: 'success',
			message: 'Product updated successfully.',
			data: updatedProduct,
		})
	} catch (error) {
		return next(error)
	}
}

exports.getAll = async (req, res, next) => {
	const { status } = req.query
	try {
		let query = {}
		if (req.query.hasOwnProperty('status') && req.query.status !== 'all') query.status = status;

		const allParentProducts = await Product.find(query).lean()

		return res.status(200).json({
			status: 'success',
			message: 'Product list.',
			data: allParentProducts,
		})
	} catch (error) {
		return next(error)
	}
}

exports.delete = async (req, res, next) => {
	try {
		await Product.findByIdAndUpdate(req.params.id, { status: false })

		return res.status(200).json({
			status: 'success',
			message: 'Product deleted successfully.',
		})
	} catch (error) {
		return next(error)
	}

}

exports.restore = async (req, res, next) => {
	try {
		await Product.findByIdAndUpdate(req.params.id, { status: true })

		return res.status(200).json({
			status: 'success',
			message: 'Product restored successfully.',
		})
	} catch (error) {
		return next(error)
	}
}
