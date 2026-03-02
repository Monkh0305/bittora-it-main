const { body, validationResult } = require('express-validator')

const productValidationRules = [
  body('product_name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3 })
    .withMessage('Product name must be at least 3 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid numeric value'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),
  body('category_id')
    .notEmpty()
    .withMessage('Category is required')
    .isInt({ min: 1 })
    .withMessage('Category is required')
]

const collectValidationErrors = (req, _res, next) => {
  const result = validationResult(req)
  if (result.isEmpty()) {
    req.validationErrors = []
  } else {
    req.validationErrors = result.array()
  }

  next()
}

module.exports = {
  productValidationRules,
  collectValidationErrors
}
