const { Op } = require('sequelize')
const db = require('../models')

const Product = db.Product
const Category = db.Category

exports.index = async (req, res) => {
  try {
    const { category, search, page } = req.query
    const currentPage = parseInt(page, 10) || 1
    const limit = 5
    const offset = (currentPage - 1) * limit
    const whereCondition = {}
    const categoryFilter = category ? { category_id: category } : {}
    const normalizedSearch = (search || '').trim()

    // Search supports product name and eager-loaded category name.
    if (normalizedSearch) {
      whereCondition[Op.or] = [
        { product_name: { [Op.like]: `%${normalizedSearch}%` } },
        { '$Category.category_name$': { [Op.like]: `%${normalizedSearch}%` } }
      ]
    }

    const { count, rows } = await Product.findAndCountAll({
      where: { ...whereCondition, ...categoryFilter },
      include: [{ model: Category }],
      limit,
      offset,
      subQuery: false,
      order: [['product_id', 'ASC']]
    })

    const categories = await Category.findAll({ order: [['category_name', 'ASC']] })
    // Keep pagination stable even when results are empty.
    const totalPages = Math.max(1, Math.ceil(count / limit))

    res.render('products/index', {
      products: rows,
      categories,
      selectedCategory: category || '',
      searchQuery: normalizedSearch,
      totalPages,
      currentPage,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages
    })
  } catch (error) {
    req.flash('error', `Failed to load products: ${error.message}`)
    res.redirect('/')
  }
}

exports.show = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [{ model: Category }] })
    if (!product) {
      req.flash('error', 'Product not found')
      return res.redirect('/products')
    }

    res.render('products/show', { product })
  } catch (error) {
    req.flash('error', `Failed to load product: ${error.message}`)
    res.redirect('/products')
  }
}

exports.newForm = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['category_name', 'ASC']] })
    res.render('products/new', {
      categories,
      errors: [],
      formData: {}
    })
  } catch (error) {
    req.flash('error', `Failed to load product form: ${error.message}`)
    res.redirect('/products')
  }
}

exports.create = async (req, res) => {
  try {
    if (req.file) {
      req.body.image_url = `/uploads/${req.file.filename}`
    }

    if (req.validationErrors && req.validationErrors.length) {
      const categories = await Category.findAll({ order: [['category_name', 'ASC']] })
      return res.status(422).render('products/new', {
        categories,
        errors: req.validationErrors,
        formData: req.body
      })
    }

    await Product.create(req.body)
    req.flash('success', 'Product created successfully')
    res.redirect('/products')
  } catch (error) {
    req.flash('error', `Failed to create product: ${error.message}`)
    res.redirect('/products/new')
  }
}

exports.editForm = async (req, res) => {
  try {
    const [product, categories] = await Promise.all([
      Product.findByPk(req.params.id),
      Category.findAll({ order: [['category_name', 'ASC']] })
    ])

    if (!product) {
      req.flash('error', 'Product not found')
      return res.redirect('/products')
    }

    res.render('products/edit', {
      product,
      categories,
      errors: [],
      formData: product
    })
  } catch (error) {
    req.flash('error', `Failed to load edit form: ${error.message}`)
    res.redirect('/products')
  }
}

exports.update = async (req, res) => {
  try {
    const existingProduct = await Product.findByPk(req.params.id)
    if (!existingProduct) {
      req.flash('error', 'Product not found')
      return res.redirect('/products')
    }

    if (req.file) {
      req.body.image_url = `/uploads/${req.file.filename}`
    } else {
      req.body.image_url = existingProduct.image_url
    }

    if (req.validationErrors && req.validationErrors.length) {
      const [product, categories] = await Promise.all([
        Promise.resolve(existingProduct),
        Category.findAll({ order: [['category_name', 'ASC']] })
      ])

      return res.status(422).render('products/edit', {
        product,
        categories,
        errors: req.validationErrors,
        formData: { ...product.toJSON(), ...req.body }
      })
    }

    const [updatedCount] = await Product.update(req.body, {
      where: { product_id: req.params.id }
    })

    if (!updatedCount) {
      req.flash('error', 'Product not found')
      return res.redirect('/products')
    }

    req.flash('success', 'Product updated successfully')
    res.redirect(`/products/${req.params.id}`)
  } catch (error) {
    req.flash('error', `Failed to update product: ${error.message}`)
    res.redirect(`/products/${req.params.id}/edit`)
  }
}

exports.delete = async (req, res) => {
  try {
    const deletedCount = await Product.destroy({
      where: { product_id: req.params.id }
    })

    if (!deletedCount) {
      req.flash('error', 'Product not found')
      return res.redirect('/products')
    }

    req.flash('success', 'Product deleted successfully')
    res.redirect('/products')
  } catch (error) {
    req.flash('error', `Failed to delete product: ${error.message}`)
    res.redirect('/products')
  }
}

exports.report = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }],
      order: [['product_name', 'ASC']]
    })

    res.render('products/report', { products })
  } catch (error) {
    req.flash('error', `Failed to load printable report: ${error.message}`)
    res.redirect('/products')
  }
}
