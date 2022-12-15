const { Router } = require('express')
const documentController = require('../controllers/document.controller')

const router = Router()

router.route('/').get(documentController.getAll).post(documentController.create)

router
	.route('/:id')
	.get(documentController.getOne)
	.delete(documentController.delete)
	.put(documentController.update)

router.get('/:id/clients/:clientId', documentController.getOneForClients)

module.exports = router
