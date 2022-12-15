const { Router } = require('express')
const productRoutes = require('./product.route')
const documentRoutes = require('./document.route')
const userRoutes = require('./user.route')

const router = Router()

router.use('/products', productRoutes)
router.use('/documents', documentRoutes)
// router.use('/clients', categoryRoutes)
router.use('/users', userRoutes)

router.get('/', (req, res) => res.sendStatus(200))
router.all('*', (req, res) => res.sendStatus(404))

module.exports = router
