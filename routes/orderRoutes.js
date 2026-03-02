const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { requireAdmin } = require('../middlewares/auth')

router.get('/', orderController.index)
router.get('/realtime', orderController.realtime)
router.get('/new', requireAdmin, orderController.newForm)
router.post('/quick', orderController.quickOrder)
router.post('/', requireAdmin, orderController.create)
router.post('/delete-old', requireAdmin, orderController.deleteOld)
router.post('/:id/cancel', orderController.cancel)
router.get('/:id', orderController.show)
router.get('/:id/edit', requireAdmin, orderController.editForm)
router.put('/:id', requireAdmin, orderController.update)
router.delete('/:id', requireAdmin, orderController.delete)

module.exports = router
