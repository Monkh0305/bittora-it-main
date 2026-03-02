const db = require('../models')

exports.index = async (req, res) => {
  try {
    const [totalProducts, totalStockAgg, totalCategories, latestProducts] = await Promise.all([
      db.Product.count(),
      db.Product.sum('stock'),
      db.Category.count(),
      db.Product.findAll({
        include: [{ model: db.Category }],
        order: [['product_id', 'DESC']],
        limit: 5
      })
    ])

    res.render('home', {
      stats: {
        totalProducts,
        totalStock: Number(totalStockAgg || 0),
        totalCategories
      },
      latestProducts
    })
  } catch (error) {
    req.flash('error', `Failed to load dashboard: ${error.message}`)
    res.render('home', {
      stats: {
        totalProducts: 0,
        totalStock: 0,
        totalCategories: 0
      },
      latestProducts: []
    })
  }
}
