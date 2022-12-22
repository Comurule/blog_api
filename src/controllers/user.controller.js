const crypto = require('crypto');
const User = require('../models/user.model')
const OTP = require('../models/otp.model')
const CustomError = require('../utils/customError')
const sendMail = require('../services/mail.service')

const generateOTP = async (length = 4) => {
	let token = [];
	while (length > 0) {
		token.push(await crypto.randomInt(9));
		length--;
	}
	return token.join('');
}

exports.signup = async (req, res, next) => {
	try {
		let user = await User.findOne({
			email: new RegExp(req.body.email, 'i'),
		})
		if (user) {
			user = await User.findByIdAndUpdate(
				user._id,
				{ name: req.body.name, verified: false },
				{ new: true }
			)
		} else {
			user = await User.create(req.body)
		}

		// Send otp
		const otp = await generateOTP();
		await OTP.create({
			otp,
			owner: user._id
		})
		// send email verification
		sendMail('user.verification.otp', { otp, user });

		return res.status(201).json({
			status: 'success',
			message: 'User created successfully.',
			data: { otp, ...user._doc },
		})
	} catch (error) {
		return next(error)
	}
}

exports.resendOTP = async (req, res, next) => {
	try {
		const otpObject = await OTP.findOne({ owner: req.params.id }).populate('owner')
		if (!otpObject) throw new CustomError('Invalid user Id.', 400);

		// send email verification
		sendMail('user.verification.otp', { otp: otpObject.otp, user: otpObject.owner });

		return res.status(200).json({
			status: 'success',
			message: 'User verification email sent successfully.',
			data: { otp: otpObject.otp, }
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
