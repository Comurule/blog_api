const Document = require('../models/document.model')
const Product = require('../models/product.model')
const User = require('../models/user.model')
const CustomError = require('../utils/customError')
const uploadMedia = require('../services/mediaUpload.service')

exports.create = async (req, res, next) => {
	try {
		// const imageUrl = await uploadMedia(req)
		const imageUrl = "await uploadMedia(req)"

		const userExists = await User.exists({
			_id: req.body.owner,
			verified: true,
		})
		if (!userExists) throw new CustomError('Owner is invalid. Kindly, sign up and verify your email.', 422)

		const productExists = await Product.exists({
			_id: req.body.product,
			status: true,
		})
		if (!productExists) throw new CustomError('Product record not found.', 422)

		const isDuplicate = await Document.exists({
			orgName: new RegExp(req.body.orgName, 'gi'),
		})
		if (isDuplicate) throw new CustomError('Document name already exists!', 400)

		// add the image url to the req.body
		req.body.image.src = imageUrl
		const newDocument = await Document.create(req.body)

		return res.status(201).json({
			status: 'success',
			message: 'Document created successfully.',
			data: newDocument,
		})
	} catch (error) {
		return next(error)
	}
}

exports.update = async (req, res, next) => {
	try {
		if (req.body.name) {
			const isDuplicate = await Document.exists({
				id: { $ne: req.params.id },
				name: new RegExp(req.body.name, 'gi'),
			})
			if (isDuplicate)
				throw new CustomError('Document name already exists!', 400)
		}

		const updatedDocument = await Document.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		)

		return res.status(200).json({
			status: 'success',
			message: 'Document updated successfully.',
			data: updatedDocument,
		})
	} catch (error) {
		return next(error)
	}
}

exports.getAll = async (req, res, next) => {
	const { owner, product } = req.query
	try {
		let query = {}
		if (req.query.hasOwnProperty('owner')) query.owner = owner
		if (req.query.hasOwnProperty('product')) query.product = product

		const documentLists = await Document.find(query).lean()

		return res.status(200).json({
			status: 'success',
			message: 'Document list.',
			data: documentLists,
		})
	} catch (error) {
		return next(error)
	}
}

exports.getOne = async (req, res, next) => {
	try {
		const document = await Document.findById(req.params.id).lean()
		if (!document) throw new CustomError('Document record not found.', 404)

		return res.status(200).json({
			status: 'success',
			message: 'Document details.',
			data: document,
		})
	} catch (error) {
		return next(error)
	}
}

exports.getOneForClients = async (req, res, next) => {
	try {
		const document = await Document.findById(req.params.id).lean()
		if (!document) throw new CustomError('Document record not found.', 404)

		document.client = document.clients.filter(x => x._id.toString() === req.params.clientId);
		delete document.clients;

		return res.status(200).json({
			status: 'success',
			message: 'Document details.',
			data: document,
		})
	} catch (error) {
		return next(error)
	}
}

exports.delete = async (req, res, next) => {
	try {
		await Document.findByIdAndUpdate(req.params.id, { status: false })

		return res.status(200).json({
			status: 'success',
			message: 'Document deleted successfully.',
		})
	} catch (error) {
		return next(error)
	}
}

exports.restore = async (req, res, next) => {
	try {
		await Document.findByIdAndUpdate(req.params.id, { status: true })

		return res.status(200).json({
			status: 'success',
			message: 'Document restored successfully.',
		})
	} catch (error) {
		return next(error)
	}
}
