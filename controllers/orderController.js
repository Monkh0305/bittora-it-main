const { Op } = require('sequelize')
const db = require('../models')

const Order = db.Order
const User = db.User
const OrderItem = db.OrderItem
const Product = db.Product

function buildGroupedOrders(orders) {
  const groupedMap = orders.reduce((acc, order) => {
    const userId = order.user_id
    const username = order.User ? order.User.username : 'Unknown'

    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        username,
        total_orders: 0,
        total_revenue: 0,
        orders: []
      }
    }

    acc[userId].orders.push(order)
    acc[userId].total_orders += 1
    acc[userId].total_revenue += Number(order.total_price || 0)
    return acc
  }, {})

  return Object.values(groupedMap).sort((a, b) => a.username.localeCompare(b.username))
}

exports.index = async (req, res) => {
  try {
    const isAdmin = req.session.user && req.session.user.role === 'admin'
    const where = isAdmin
      ? { status: { [Op.ne]: 'cancelled' } }
      : { user_id: req.session.user.user_id, status: { [Op.ne]: 'cancelled' } }

    const orders = await Order.findAll({
      where,
      include: [{ model: User }],
      order: [['order_id', 'DESC']]
    })

    const groupedOrders = buildGroupedOrders(orders)

    res.render('orders/index', { orders, groupedOrders })
  } catch (error) {
    req.flash('error', `Failed to load orders: ${error.message}`)
    res.redirect('/')
  }
}

exports.realtime = async (req, res) => {
  try {
    const isAdmin = req.session.user && req.session.user.role === 'admin'
    const where = isAdmin
      ? { status: { [Op.ne]: 'cancelled' } }
      : { user_id: req.session.user.user_id, status: { [Op.ne]: 'cancelled' } }

    const orders = await Order.findAll({
      where,
      include: [{ model: User }],
      order: [['order_id', 'DESC']]
    })

    const groupedOrders = buildGroupedOrders(orders).map(group => ({
      user_id: group.user_id,
      username: group.username,
      total_orders: group.total_orders,
      total_revenue: Number(group.total_revenue)
    }))

    res.json({
      generated_at: new Date().toISOString(),
      grouped_orders: groupedOrders
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.show = async (req, res) => {
  try {
    const isAdmin = req.session.user && req.session.user.role === 'admin'
    const where = isAdmin
      ? { order_id: req.params.id }
      : { order_id: req.params.id, user_id: req.session.user.user_id }

    const order = await Order.findOne({
      where,
      include: [
        { model: User },
        {
          model: OrderItem,
          include: [{ model: Product }]
        }
      ]
    })

    if (!order) {
      req.flash('error', isAdmin ? 'Order not found' : 'Order not found or access denied')
      return res.redirect('/orders')
    }

    res.render('orders/show', { order })
  } catch (error) {
    req.flash('error', `Failed to load order: ${error.message}`)
    res.redirect('/orders')
  }
}

exports.newForm = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['username', 'ASC']] })
    res.render('orders/new', { users })
  } catch (error) {
    req.flash('error', `Failed to load order form: ${error.message}`)
    res.redirect('/orders')
  }
}

exports.create = async (req, res) => {
  try {
    await Order.create(req.body)
    req.flash('success', 'Order created successfully')
    res.redirect('/orders')
  } catch (error) {
    req.flash('error', `Failed to create order: ${error.message}`)
    res.redirect('/orders/new')
  }
}

exports.quickOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction()

  try {
    const currentUser = req.session.user
    const productId = Number(req.body.product_id)
    const quantity = Math.max(1, Number(req.body.quantity || 1))

    if (!currentUser || !currentUser.user_id) {
      await transaction.rollback()
      req.flash('error', 'Please log in first.')
      return res.redirect('/auth/login')
    }

    const product = await Product.findByPk(productId, { transaction })
    if (!product) {
      await transaction.rollback()
      req.flash('error', 'Product not found.')
      return res.redirect('/products')
    }

    if (Number(product.stock) < quantity) {
      await transaction.rollback()
      req.flash('error', 'Not enough stock.')
      return res.redirect('/products')
    }

    const subtotal = Number(product.price) * quantity

    const order = await Order.create({
      user_id: currentUser.user_id,
      order_date: new Date(),
      total_price: subtotal,
      status: 'pending'
    }, { transaction })

    await OrderItem.create({
      order_id: order.order_id,
      product_id: product.product_id,
      quantity,
      subtotal
    }, { transaction })

    await Product.update(
      { stock: Number(product.stock) - quantity },
      { where: { product_id: product.product_id }, transaction }
    )

    await transaction.commit()
    req.flash('success', `Ordered ${product.product_name} x${quantity} successfully.`)
    return res.redirect('/orders')
  } catch (error) {
    await transaction.rollback()
    req.flash('error', `Failed to create order: ${error.message}`)
    return res.redirect('/products')
  }
}

exports.editForm = async (req, res) => {
  try {
    const [order, users] = await Promise.all([
      Order.findByPk(req.params.id),
      User.findAll({ order: [['username', 'ASC']] })
    ])

    if (!order) {
      req.flash('error', 'Order not found')
      return res.redirect('/orders')
    }

    res.render('orders/edit', { order, users })
  } catch (error) {
    req.flash('error', `Failed to load edit form: ${error.message}`)
    res.redirect('/orders')
  }
}

exports.update = async (req, res) => {
  try {
    const [updatedCount] = await Order.update(req.body, {
      where: { order_id: req.params.id }
    })

    if (!updatedCount) {
      req.flash('error', 'Order not found')
      return res.redirect('/orders')
    }

    req.flash('success', 'Order updated successfully')
    res.redirect(`/orders/${req.params.id}`)
  } catch (error) {
    req.flash('error', `Failed to update order: ${error.message}`)
    res.redirect(`/orders/${req.params.id}/edit`)
  }
}

exports.delete = async (req, res) => {
  try {
    const deletedCount = await Order.destroy({ where: { order_id: req.params.id } })
    if (!deletedCount) {
      req.flash('error', 'Order not found')
      return res.redirect('/orders')
    }

    req.flash('success', 'Order deleted successfully')
    res.redirect('/orders')
  } catch (error) {
    req.flash('error', `Failed to delete order: ${error.message}`)
    res.redirect('/orders')
  }
}

exports.cancel = async (req, res) => {
  const transaction = await db.sequelize.transaction()

  try {
    const isAdmin = req.session.user && req.session.user.role === 'admin'
    const where = isAdmin
      ? { order_id: req.params.id }
      : { order_id: req.params.id, user_id: req.session.user.user_id }

    const order = await Order.findOne({
      where,
      include: [{ model: OrderItem }],
      transaction
    })

    if (!order) {
      await transaction.rollback()
      req.flash('error', 'Order not found or access denied')
      return res.redirect('/orders')
    }

    if (order.status === 'cancelled') {
      await transaction.rollback()
      req.flash('error', 'This order is already cancelled')
      return res.redirect('/orders')
    }

    await Order.update(
      { status: 'cancelled' },
      { where: { order_id: order.order_id }, transaction }
    )

    for (const item of (order.OrderItems || [])) {
      await Product.increment(
        { stock: Number(item.quantity || 0) },
        { where: { product_id: item.product_id }, transaction }
      )
    }

    await transaction.commit()
    req.flash('success', `Order #${order.order_id} cancelled successfully`)
    return res.redirect('/orders')
  } catch (error) {
    await transaction.rollback()
    req.flash('error', `Failed to cancel order: ${error.message}`)
    return res.redirect('/orders')
  }
}

exports.deleteOld = async (req, res) => {
  const transaction = await db.sequelize.transaction()

  try {
    const days = Math.max(1, Number(req.body.days || 30))
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const oldOrders = await Order.findAll({
      where: { order_date: { [Op.lt]: cutoff } },
      attributes: ['order_id'],
      transaction
    })

    const orderIds = oldOrders.map(order => order.order_id)
    if (!orderIds.length) {
      await transaction.rollback()
      req.flash('error', `No orders older than ${days} days.`)
      return res.redirect('/orders')
    }

    await OrderItem.destroy({
      where: { order_id: { [Op.in]: orderIds } },
      transaction
    })

    const deletedCount = await Order.destroy({
      where: { order_id: { [Op.in]: orderIds } },
      transaction
    })

    await transaction.commit()
    req.flash('success', `Deleted ${deletedCount} old orders (older than ${days} days).`)
    return res.redirect('/orders')
  } catch (error) {
    await transaction.rollback()
    req.flash('error', `Failed to delete old orders: ${error.message}`)
    return res.redirect('/orders')
  }
}
