const { Router } = require('express')
const documentController = require('../controllers/document.controller')

const router = Router()

router.route('/')
	.get(documentController.getAll)
	.post(documentController.create)
router.route('/idempotency-key').get(documentController.getIdempotencyKey)

router
	.route('/:id')
	.get(documentController.getOne)
	.delete(documentController.delete)
	.put(documentController.update)

router.get('/:id/certificates', documentController.getPDFForOrganization)
router.get('/:id/clients/:clientId/certificates', documentController.getPDFForClient)
router.get('/:id/clients/:clientId', documentController.getOneForClients)

module.exports = router
