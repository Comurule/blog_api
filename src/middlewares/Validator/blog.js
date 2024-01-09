const { param, body, query } = require('express-validator');
const validate = require('./baseValidator');

const validationRules = {
  checkId: [
    param('id')
      .trim()
      .notEmpty()
      .withMessage('ID is required.')
      .isMongoId()
      .withMessage('ID must be a mongo ID'),
  ],
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('title is required')
      .isString()
      .withMessage('title must be a string.'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('content is required.')
      .isString()
      .withMessage('content must be a string.'),
  ],
  update: [
    body('title')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('title can not be empty.')
      .isString()
      .withMessage('title must be a string.'),
    body('content')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('content can not be empty.')
      .isString()
      .withMessage('content must be a string.'),
  ],
  getAll: [
    query('pageNumber')
      .optional()
      .notEmpty()
      .withMessage('pageNumber can not be empty.')
      .isInt({ min: 1 })
      .withMessage('pageNumber must be an integer not less than 1.'),
    query('pageSize')
      .optional()
      .notEmpty()
      .withMessage('pageSize can not be empty.')
      .isInt({ min: 1 })
      .withMessage('pageSize must be an integer not less than 1.'),
    query('sortOrder')
      .optional()
      .notEmpty()
      .withMessage('sortOrder can not be empty.')
      .isIn(['desc', 'asc'])
      .withMessage('sortOrder must be either "desc" or "asc".'),
    query('sortKey')
      .optional()
      .notEmpty()
      .withMessage('sortKey can not be empty.')
      .isIn(['createdAt', 'title'])
      .withMessage('sortKey must be either "createdAt" or "title".'),
  ],
};

module.exports = (routeValidation) => [
  validationRules[routeValidation],
  validate,
];
