const express = require('express')
const router = express.Router()
const orderItemController = require('../controllers/orderItemController')
const { requireAdmin } = require('../middlewares/auth')

router.use(requireAdmin)

router.get('/', orderItemController.index)
router.get('/new', orderItemController.newForm)
router.post('/', orderItemController.create)
router.get('/:id', orderItemController.show)
router.get('/:id/edit', orderItemController.editForm)
router.put('/:id', orderItemController.update)
router.delete('/:id', orderItemController.delete)

module.exports = router
