const { Router } = require('express');
const userController = require('./user.controller');
const validate = require('../../middlewares/validator/user');

const router = Router();

router
  .route('/login')
  .post(validate('login'), userController.login);

router
  .route('/')
  .get(userController.getAll)
  .post(validate('create'), userController.signup);

module.exports = router;
