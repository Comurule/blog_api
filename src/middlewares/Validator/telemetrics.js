const { check } = require('express-validator')
const validate = require('./baseValidator')

const validationRules = {
	checkId: [
		check('id')
			.trim()
			.notEmpty()
			.withMessage('ID is required.')
			.isMongoId()
			.withMessage('ID must be a mongo ID'),
	],
	create: [
		check('engineTemp')
			.trim()
			.notEmpty()
			.withMessage('ENGINE TEMP is required')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,2',
				locale: 'en-US',
			})
			.withMessage('ENGINE TEMP must be in a float with 2 decimal places.'),
		check('carId')
			.trim()
			.notEmpty()
			.withMessage('CAR ID is required.')
			.isInt()
			.withMessage('CAR ID must be an integer.'),
		check('carSpeed')
			.trim()
			.notEmpty()
			.withMessage('CAR SPEED is required.')
			.isInt()
			.withMessage('CAR SPEED must be an integer.'),
		check('carLongitude')
			.trim()
			.notEmpty()
			.withMessage('CAR LONGITUDE is required.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,4',
				locale: 'en-US',
			})
			.withMessage('CAR LONGITUDE must be a float with 4 decimal places.')
			.isFloat({
				min: -180,
				max: 180,
			})
			.withMessage('CAR LONGITUDE has to be within the [-180 -- 180] range.'),
		check('carLatitude')
			.trim()
			.notEmpty()
			.withMessage('CAR LATITUDE is required.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,4',
				locale: 'en-US',
			})
			.withMessage('CAR LATITUDE must be a float with 4 decimal places.')
			.isFloat({
				min: -90,
				max: 90,
			})
			.withMessage('CAR LATITUDE has to be within the [-90 -- 90] range.'),
		check('fuelConsumptionRate')
			.trim()
			.notEmpty()
			.withMessage('FUEL CONSUMPTION RATE is required.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,2',
				locale: 'en-US',
			})
			.withMessage(
				'CFUEL CONSUMPTION RATE must be a float with 2 decimal places.'
			),
	],
	update: [
		check('engineTemp')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('ENGINE TEMP can not empty.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,2',
				locale: 'en-US',
			})
			.withMessage('ENGINE TEMP must be in a float with 2 decimal places.'),
		check('carSpeed')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('CAR SPEED can not empty.')
			.isInt()
			.withMessage('CAR SPEED must be an integer.'),
		check('carLongitude')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('CAR LONGITUDE can not empty.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,4',
				locale: 'en-US',
			})
			.withMessage('CAR LONGITUDE must be a float with 4 decimal places.'),
		check('carLatitude')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('CAR LATITUDE can not empty.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,4',
				locale: 'en-US',
			})
			.withMessage('CAR LATITUDE must be a float with 4 decimal places.'),
		check('fuelConsumptionRate')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('FUEL CONSUMPTION RATE can not empty.')
			.isNumeric()
			.isDecimal({
				force_decimal: false,
				decimal_digits: '1,2',
				locale: 'en-US',
			})
			.withMessage(
				'CFUEL CONSUMPTION RATE must be a float with 2 decimal places.'
			),
	],
}

module.exports = (routeValidation) => [
	validationRules[routeValidation],
	validate,
]
