const db = require('../models')
const Category = db.Category

exports.index = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['category_name', 'ASC']] })
    res.render('categories/index', { categories })
  } catch (error) {
    req.flash('error', `Failed to load categories: ${error.message}`)
    res.redirect('/')
  }
}

exports.create = async (req, res) => {
  try {
    await Category.create({
      category_name: req.body.category_name
    })

    req.flash('success', 'Category created successfully')
    res.redirect('/categories')

  } catch (error) {
    req.flash('error', `Error creating category: ${error.message}`)
    res.redirect('/categories')
  }
}
