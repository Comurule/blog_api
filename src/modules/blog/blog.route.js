const { Router } = require('express');
const blogController = require('./blog.controller');
const authenticate = require('../../middlewares/auth/authenticate');
const validate = require('../../middlewares/validator/blog');

const router = Router();

router
  .route('/:id')
  .all(validate('checkId'))
  .put(authenticate, validate('update'), blogController.updateAPost)
  .delete(authenticate, blogController.deleteAPost)
  .get(blogController.getAPost);

router
  .route('/')
  .get(validate('getAll'), blogController.getAll)
  .post(authenticate, validate('create'), blogController.createAPost);

module.exports = router;
