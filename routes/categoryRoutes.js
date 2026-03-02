const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const { requireAdmin } = require('../middlewares/auth')

router.use(requireAdmin)

router.get('/', categoryController.index)
router.post('/', categoryController.create)

module.exports = router
