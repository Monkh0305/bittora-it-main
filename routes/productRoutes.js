const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const { productValidationRules, collectValidationErrors } = require('../middlewares/validation')
const upload = require('../middlewares/upload')
const { requireAdmin } = require('../middlewares/auth')

// READ ALL
router.get('/', requireAdmin, productController.index)

// PRINTABLE REPORT
router.get('/report', requireAdmin, productController.report)

// NEW FORM
router.get('/new', requireAdmin, productController.newForm)

// CREATE
router.post('/', requireAdmin, upload.single('image'), productValidationRules, collectValidationErrors, productController.create)

// SHOW ONE
router.get('/:id', requireAdmin, productController.show)

// EDIT FORM
router.get('/:id/edit', requireAdmin, productController.editForm)

// UPDATE
router.put('/:id', requireAdmin, upload.single('image'), productValidationRules, collectValidationErrors, productController.update)

// DELETE
router.delete('/:id', requireAdmin, productController.delete)

module.exports = router
