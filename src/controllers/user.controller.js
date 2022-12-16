const User = require('../models/user.model')
const OTP = require('../models/otp.model')
const CustomError = require('../utils/customError')
const sendMail = require('../services/mail.service')

exports.signup = async (req, res, next) => {
	try {
		const isDuplicate = await User.exists({
			email: new RegExp(req.body.email, 'i'),
		})
		if (isDuplicate) throw new CustomError('User already exists!', 400)

		const newUser = await User.create(req.body)
		// Send otp
		const otp = Math.floor((Math.random() * 10000));
		await OTP.create({
			otp,
			owner: newUser._id
		})
		// send email verification
		sendMail('user.verification.otp', { otp, user: newUser });

		return res.status(201).json({
			status: 'success',
			message: 'User created successfully.',
			data: { otp , ...newUser._doc },
		})
	} catch (error) {
		return next(error)
	}
}

exports.verify = async (req, res, next) => {
	try {
		const otpObject = await OTP.findOne({ otp: req.body.token })
		if (!otpObject) throw new CustomError('Invalid token passed.', 400);

		const updatedUser = await User.findByIdAndUpdate(
			otpObject.owner,
			{ verified: true },
			{ new: true }
		)
		if (!updatedUser) throw new CustomError('Invalid token passed.', 400);
		await otpObject.delete()

		return res.status(200).json({
			status: 'success',
			message: 'User verified successfully.',
		})
	} catch (error) {
		return next(error)
	}
}

exports.update = async (req, res, next) => {
	try {
		if (req.body.email) {
			const isDuplicate = await User.exists({
				id: { $ne: req.params.id },
				email: new RegExp(req.body.email, 'i'),
			})
			if (isDuplicate)
				throw new CustomError('User already exists!', 400)
		}

		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		)

		return res.status(200).json({
			status: 'success',
			message: 'User updated successfully.',
			data: updatedUser,
		})
	} catch (error) {
		return next(error)
	}
}

exports.getAll = async (req, res, next) => {
	const { status } = req.query
	try {
		let query = {}
		if (req.query.hasOwnProperty('status')) query.status = status

		const userLists = await User.find(query).lean()

		return res.status(200).json({
			status: 'success',
			message: 'User list.',
			data: userLists,
		})
	} catch (error) {
		return next(error)
	}
}
