const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { requireAdmin } = require('../middlewares/auth')

router.use(requireAdmin)

router.get('/', userController.index)
router.get('/new', userController.newForm)
router.post('/', userController.create)
router.get('/:id', userController.show)
router.get('/:id/edit', userController.editForm)
router.put('/:id', userController.update)
router.delete('/:id', userController.delete)

module.exports = router
