const { Router } = require('express')
const productController = require('../controllers/product.controller')
// const a = require('../middlewares/Validator/telemetrics')

const router = Router()

router.route('/').get(productController.getAll).post(productController.create)

router
	.route('/:id')
	// .all(telemetricValidator('checkId'))
	.delete(productController.delete)
	.put(productController.update)

router.get('/:id/restore', productController.restore)

module.exports = router
