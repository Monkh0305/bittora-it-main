const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')
const { requireAdmin } = require('../middlewares/auth')

router.use(requireAdmin)

router.get('/', reportController.index)
router.get('/sales', reportController.sales)
router.get('/best-products', reportController.bestProducts)

// Backward-compatible aliases
router.get('/sales-by-date', reportController.sales)
router.get('/best-selling-products', reportController.bestProducts)

module.exports = router
