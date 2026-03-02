const db = require('../models')

const OrderItem = db.OrderItem
const Order = db.Order
const Product = db.Product

async function recalculateOrderTotal(orderId) {
  const items = await OrderItem.findAll({ where: { order_id: orderId } })
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  await Order.update({ total_price: total }, { where: { order_id: orderId } })
}

exports.index = async (req, res) => {
  try {
    const orderItems = await OrderItem.findAll({
      include: [{ model: Order, include: [{ model: db.User }] }, { model: Product }],
      order: [['order_item_id', 'DESC']]
    })
    res.render('order_items/index', { orderItems })
  } catch (error) {
    req.flash('error', `Failed to load order items: ${error.message}`)
    res.redirect('/')
  }
}

exports.show = async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id, {
      include: [{ model: Order, include: [{ model: db.User }] }, { model: Product }]
    })

    if (!orderItem) {
      req.flash('error', 'Order item not found')
      return res.redirect('/order_items')
    }

    res.render('order_items/show', { orderItem })
  } catch (error) {
    req.flash('error', `Failed to load order item: ${error.message}`)
    res.redirect('/order_items')
  }
}

exports.newForm = async (req, res) => {
  try {
    const [orders, products] = await Promise.all([
      Order.findAll({ include: [{ model: db.User }], order: [['order_id', 'DESC']] }),
      Product.findAll({ order: [['product_name', 'ASC']] })
    ])
    res.render('order_items/new', { orders, products })
  } catch (error) {
    req.flash('error', `Failed to load order item form: ${error.message}`)
    res.redirect('/order_items')
  }
}

exports.create = async (req, res) => {
  try {
    const product = await Product.findByPk(req.body.product_id)
    if (!product) {
      req.flash('error', 'Selected product not found')
      return res.redirect('/order_items/new')
    }

    const quantity = Number(req.body.quantity) || 1
    const payload = {
      ...req.body,
      quantity,
      subtotal: quantity * Number(product.price)
    }

    const orderItem = await OrderItem.create(payload)
    await recalculateOrderTotal(orderItem.order_id)

    req.flash('success', 'Order item created successfully')
    res.redirect('/order_items')
  } catch (error) {
    req.flash('error', `Failed to create order item: ${error.message}`)
    res.redirect('/order_items/new')
  }
}

exports.editForm = async (req, res) => {
  try {
    const [orderItem, orders, products] = await Promise.all([
      OrderItem.findByPk(req.params.id),
      Order.findAll({ include: [{ model: db.User }], order: [['order_id', 'DESC']] }),
      Product.findAll({ order: [['product_name', 'ASC']] })
    ])

    if (!orderItem) {
      req.flash('error', 'Order item not found')
      return res.redirect('/order_items')
    }

    res.render('order_items/edit', { orderItem, orders, products })
  } catch (error) {
    req.flash('error', `Failed to load edit form: ${error.message}`)
    res.redirect('/order_items')
  }
}

exports.update = async (req, res) => {
  try {
    const existing = await OrderItem.findByPk(req.params.id)
    if (!existing) {
      req.flash('error', 'Order item not found')
      return res.redirect('/order_items')
    }

    const product = await Product.findByPk(req.body.product_id)
    if (!product) {
      req.flash('error', 'Selected product not found')
      return res.redirect(`/order_items/${req.params.id}/edit`)
    }

    const quantity = Number(req.body.quantity) || 1
    const payload = {
      ...req.body,
      quantity,
      subtotal: quantity * Number(product.price)
    }

    await OrderItem.update(payload, { where: { order_item_id: req.params.id } })
    await recalculateOrderTotal(existing.order_id)
    if (Number(existing.order_id) !== Number(payload.order_id)) {
      await recalculateOrderTotal(payload.order_id)
    }

    req.flash('success', 'Order item updated successfully')
    res.redirect(`/order_items/${req.params.id}`)
  } catch (error) {
    req.flash('error', `Failed to update order item: ${error.message}`)
    res.redirect(`/order_items/${req.params.id}/edit`)
  }
}

exports.delete = async (req, res) => {
  try {
    const existing = await OrderItem.findByPk(req.params.id)
    if (!existing) {
      req.flash('error', 'Order item not found')
      return res.redirect('/order_items')
    }

    await OrderItem.destroy({ where: { order_item_id: req.params.id } })
    await recalculateOrderTotal(existing.order_id)

    req.flash('success', 'Order item deleted successfully')
    res.redirect('/order_items')
  } catch (error) {
    req.flash('error', `Failed to delete order item: ${error.message}`)
    res.redirect('/order_items')
  }
}
