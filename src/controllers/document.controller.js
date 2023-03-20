const crypto = require('crypto')
const Document = require('../models/document.model')
const Product = require('../models/product.model')
const User = require('../models/user.model')
const CustomError = require('../utils/customError')
const MediaLib = require('../services/media-upload.service')
const sendMail = require('../services/mail.service')
const buildPDF = require('../services/pdf-builder.service')
const config = require('../config')

const createIdempotencyKey = async (length = 32) => {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
	let token = [];

	while (length > 0) {
		let index = await crypto.randomInt(characters.length)
		token.push(characters[index]);
		length--;
	}
	return token.join('');
}

exports.create = async (req, res, next) => {
	try {
		req.body = await MediaLib.parseReqBody(req);

		// Ensure there is at least a client passed
		if (req.body.clients.length === 0) {
			throw new CustomError('No recipients passed. Kindly, pass recipients data.', 422)
		}

		// Ensure there is at most 50 clients passed
		if (req.body.clients.length >= 50) {
			throw new CustomError('Maximum recipients count exceeded. The maximum per request is 50', 400)
		}

		// Ensure that the fields.fieldName is a key in clients
		if (!Array.isArray(req.body.fields) || req.body.fields.length === 0) {
			throw new CustomError('No place holders passed. Kindly, pass placeholders and the respective values.', 422)
		}
		const fieldNames = req.body.fields.map(x => x.fieldName);
		fieldNames.push('email');
		if (!fieldNames.includes('name') || !fieldNames.includes('email')) {
			throw new CustomError('Invalid place holders passed. Kindly, pass placeholders and the respective values.', 422)
		}
		const canProceed = fieldNames.every(key => req.body.clients.every(client => !!client[key]));
		if (!canProceed) throw new CustomError('Ensure all clients have the fields provided.', 422)

		// For idempotencyKey
		if (!req.body.idempotencyKey) throw new CustomError('idempotencyKey is required.', 422)
		const isDuplicate = await Document.findOne({
			idempotencyKey: req.body.idempotencyKey,
		})
		if (isDuplicate) {
			return res.status(201).json({
				status: 'success',
				message: 'Document created successfully.',
				data: isDuplicate,
			})
		}

		const userExists = await User.findOne({
			_id: req.body.owner,
			verified: true,
		})
		if (!userExists) throw new CustomError('Owner is invalid. Kindly, sign up and verify your email.', 422)

		const productExists = await Product.exists({
			_id: req.body.product,
			status: true,
		})
		if (!productExists) throw new CustomError('Product record not found.', 422)

		// add the image url to the req.body
		req.body.image.src = await MediaLib.uploadImage(req.body.file)
		const newDocument = await Document.create(req.body)

		Promise.all([
			// Send email to recipients
			sendMail(
				config.constants.EMAIL.TYPE.DOCUMENT_RECIPIENT,
				{
					document_id: newDocument._id,
					email_text: newDocument.emailText,
					recipients: newDocument.clients,
					convener: {
						name: userExists.name,
						email: userExists.email,
						organization_name: req.body.orgName
					},
				}
			),
			//Send email to Convener
			sendMail(
				config.constants.EMAIL.TYPE.DOCUMENT_CONVENER,
				{
					document_id: newDocument._id,
					convener: {
						name: userExists.name,
						email: userExists.email,
						organization_name: req.body.orgName
					},
				}
			),
		]).catch(console.log);

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
	const { owner, product, page, perPage } = req.query
	try {
		let query = {}
		let skip = 0;
		let limit = perPage || 50;
		if (req.query.hasOwnProperty('owner')) query.owner = owner;
		if (req.query.hasOwnProperty('product')) query.product = product;
		if (req.query.hasOwnProperty('page')) {
			skip = ((page || 1) - 1) * limit;
		}

		const documentLists = await Document.find(query)
			.limit(limit)
			.skip(skip)
			.populate('owner product')
			.lean()

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
		const document = await Document.findById(req.params.id).populate('owner product').lean()
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

exports.getIdempotencyKey = async (req, res, next) => {
	try {
		let idempotencyKey = await createIdempotencyKey();
		let isDuplicate = await Document.exists({ idempotencyKey });

		while (isDuplicate) {
			idempotencyKey = await createIdempotencyKey();
			isDuplicate = await Document.exists({ idempotencyKey });
		}

		return res.status(200).json({
			status: 'success',
			message: 'Document idempotency key.',
			data: { idempotencyKey },
		})
	} catch (error) {
		return next(error)
	}
}

exports.getOneForClients = async (req, res, next) => {
	try {
		const document = await Document.findById(req.params.id).lean()
		if (!document) throw new CustomError('Document record not found.', 404)

		document.client = document.clients.find(x => x._id.toString() === req.params.clientId);
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

exports.getPDFForClient = async (req, res, next) => {
	try {
		const document = await Document.findById(req.params.id).lean()
		if (!document) throw new CustomError('Document record not found.', 404)

		document.clients = document.clients.filter(x => x._id.toString() === req.params.clientId);
		if (!document.clients.length) throw new CustomError('Document recipient record not found.', 404);

		const encodedPDFString = await buildPDF(document);
		const buffer = Buffer.from(encodedPDFString);

		res.setHeader('Content-Length', buffer.length);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', 'inline');

		return res.send(buffer);
	} catch (error) {
		return next(error)
	}
}

exports.getPDFForOrganization = async (req, res, next) => {
	try {
		const document = await Document.findById(req.params.id).lean()
		if (!document) throw new CustomError('Document record not found.', 404)

		if (document.downloadUrl) {
			return res.status(200).json({
				status: 'success',
				message: 'Document Certificate PDF.',
				data: document.downloadUrl,
			})
		}

		const encodedPDFString = await buildPDF(document);
		const uploadedUrl = await MediaLib.uploadPdf(Buffer.from(encodedPDFString));

		await Document.findByIdAndUpdate(
			req.params.id,
			{ downloadUrl: uploadedUrl },
		);

		return res.status(200).json({
			status: 'success',
			message: 'Document Certificate PDF.',
			data: uploadedUrl,
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
