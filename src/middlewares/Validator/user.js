const { body, param } = require('express-validator');
const validate = require('./baseValidator');

const validationRules = {
  checkId: [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('ID is required.')
      .isMongoId()
      .withMessage('ID must be a mongo id.'),
  ],
  create: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('firstName is required')
      .isString()
      .isLength({ min: 3 })
      .withMessage('first_name must be in a string format with at least 3 characters.'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('lastName is required')
      .isString()
      .isLength({ min: 3 })
      .withMessage('lastName must be in a string format with at least 3 characters.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('Invalid email.'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('password is required.')
      .isString()
      .isLength({ min: 6 })
      .withMessage('password must be a string with at least 6 characters.'),
  ],
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('Invalid email.'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('password is required.')
      .isString()
      .isLength({ min: 6 })
      .withMessage('password must be a string with at least 6 characters.'),
  ],
};

module.exports = (routeValidation) => [validationRules[routeValidation], validate];
