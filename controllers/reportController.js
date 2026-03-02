const { Op, fn, col, literal } = require('sequelize')
const db = require('../models')

const Order = db.Order
const OrderItem = db.OrderItem
const Product = db.Product

exports.index = async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenueRaw,
      totalProducts,
      totalCustomers,
      salesRows,
      bestSelling
    ] = await Promise.all([
      Order.count(),
      Order.sum('total_price'),
      Product.count(),
      db.User.count(),
      Order.findAll({
        attributes: [
          [fn('date', col('order_date')), 'order_date'],
          [fn('COUNT', col('order_id')), 'total_orders'],
          [fn('SUM', col('total_price')), 'total_revenue']
        ],
        group: [fn('date', col('order_date'))],
        order: [[fn('date', col('order_date')), 'DESC']],
        limit: 10
      }),
      Product.findAll({
        attributes: [
          'product_id',
          'product_name',
          [fn('COALESCE', fn('SUM', col('OrderItems.quantity')), 0), 'total_quantity_sold'],
          [fn('COALESCE', fn('SUM', col('OrderItems.subtotal')), 0), 'total_revenue']
        ],
        include: [
          {
            model: OrderItem,
            attributes: [],
            include: [{ model: Order, attributes: [] }],
            required: false
          }
        ],
        group: ['Product.product_id'],
        order: [literal('total_quantity_sold DESC')],
        limit: 10
      })
    ])

    res.render('reports/index', {
      summary: {
        totalOrders,
        totalRevenue: Number(totalRevenueRaw || 0),
        totalProducts,
        totalCustomers
      },
      salesRows,
      bestSelling
    })
  } catch (error) {
    req.flash('error', `Failed to generate report dashboard: ${error.message}`)
    res.redirect('/')
  }
}

exports.sales = async (req, res) => {
  try {
    const { date, month } = req.query
    const where = {}

    if (date) {
      const start = new Date(`${date}T00:00:00`)
      const end = new Date(`${date}T23:59:59.999`)
      where.order_date = { [Op.between]: [start, end] }
    } else if (month) {
      const start = new Date(`${month}-01T00:00:00`)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      where.order_date = { [Op.gte]: start, [Op.lt]: end }
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: db.User }],
      order: [['order_date', 'DESC']]
    })

    const salesRows = await Order.findAll({
      attributes: [
        [fn('date', col('order_date')), 'order_date'],
        [fn('COUNT', col('order_id')), 'total_orders'],
        [fn('SUM', col('total_price')), 'total_revenue']
      ],
      where,
      group: [fn('date', col('order_date'))],
      order: [[fn('date', col('order_date')), 'DESC']]
    })

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0)

    res.render('reports/sales', {
      orders,
      salesRows,
      totalOrders,
      totalRevenue,
      filters: { date: date || '', month: month || '' }
    })
  } catch (error) {
    req.flash('error', `Failed to generate sales report: ${error.message}`)
    res.redirect('/reports')
  }
}

exports.bestProducts = async (req, res) => {
  try {
    const bestSelling = await Product.findAll({
      attributes: [
        'product_id',
        'product_name',
        [fn('COALESCE', fn('SUM', col('OrderItems.quantity')), 0), 'total_quantity_sold'],
        [fn('COALESCE', fn('SUM', col('OrderItems.subtotal')), 0), 'total_revenue']
      ],
      include: [
        {
          model: OrderItem,
          attributes: [],
          include: [
            {
              model: Order,
              attributes: []
            }
          ],
          required: false
        }
      ],
      group: ['Product.product_id'],
      order: [literal('total_quantity_sold DESC')]
    })

    res.render('reports/best-products', { bestSelling })
  } catch (error) {
    req.flash('error', `Failed to generate best-selling report: ${error.message}`)
    res.redirect('/reports')
  }
}

// Backward-compatible aliases for existing handlers
exports.salesByDate = exports.sales
exports.bestSellingProducts = exports.bestProducts
