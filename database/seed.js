const db = require('../models')

const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateInLastMonths(monthsBack = 6) {
  const now = new Date()
  const start = new Date()
  start.setMonth(now.getMonth() - monthsBack)
  const timestamp = randomInt(start.getTime(), now.getTime())
  return new Date(timestamp)
}

async function seed() {
  try {
    await db.sequelize.sync({ force: true })

    const categories = await db.Category.bulkCreate([
      { category_name: 'Laptops' },
      { category_name: 'Smartphones' },
      { category_name: 'Monitors' },
      { category_name: 'Accessories' },
      { category_name: 'Networking' }
    ])

    const users = await db.User.bulkCreate([
      { username: 'admin01', email: 'admin01@bittora.com', password: 'pass1234', role: 'admin' },
      { username: 'alice', email: 'alice@example.com', password: 'pass1234', role: 'customer' },
      { username: 'bob', email: 'bob@example.com', password: 'pass1234', role: 'customer' },
      { username: 'charlie', email: 'charlie@example.com', password: 'pass1234', role: 'customer' },
      { username: 'diana', email: 'diana@example.com', password: 'pass1234', role: 'customer' },
      { username: 'eric', email: 'eric@example.com', password: 'pass1234', role: 'customer' },
      { username: 'fiona', email: 'fiona@example.com', password: 'pass1234', role: 'customer' },
      { username: 'george', email: 'george@example.com', password: 'pass1234', role: 'customer' },
      { username: 'hana', email: 'hana@example.com', password: 'pass1234', role: 'customer' },
      { username: 'ivan', email: 'ivan@example.com', password: 'pass1234', role: 'customer' },
      { username: 'julia', email: 'julia@example.com', password: 'pass1234', role: 'customer' },
      { username: 'kevin', email: 'kevin@example.com', password: 'pass1234', role: 'customer' }
    ])

    const productSeeds = [
      { product_name: 'ApexBook 14', price: 749, stock: 18, category: 0, image_url: '/images/products/laptop.jpg' },
      { product_name: 'ApexBook Pro 16', price: 1299, stock: 10, category: 0, image_url: '/images/products/24.jpg' },
      { product_name: 'Nimbus Phone X', price: 599, stock: 30, category: 1, image_url: '/images/products/nimbusphonex.svg' },
      { product_name: 'Nimbus Phone Lite', price: 399, stock: 25, category: 1, image_url: '/images/products/nimbusphonelite.svg' },
      { product_name: 'UltraView 27', price: 229, stock: 15, category: 2, image_url: '/images/products/ultraview27.svg' },
      { product_name: 'UltraView 32', price: 319, stock: 12, category: 2, image_url: '/images/products/ultraview32.svg' },
      { product_name: 'MechKeys K87', price: 89, stock: 40, category: 3, image_url: '/images/products/mechkeysk87.svg' },
      { product_name: 'PulseMouse M5', price: 49, stock: 55, category: 3, image_url: '/images/products/pulsemousem5.svg' },
      { product_name: 'StormRouter AX5400', price: 179, stock: 20, category: 4, image_url: '/images/products/stormrouterax5400.svg' },
      { product_name: 'StormMesh Duo', price: 249, stock: 14, category: 4, image_url: '/images/products/stormmeshduo.svg' },
      { product_name: 'DeskCam 4K', price: 139, stock: 22, category: 3, image_url: '/images/products/deskcam4k.svg' },
      { product_name: 'PowerDock 11-in-1', price: 109, stock: 28, category: 3, image_url: '/images/products/powerdock11in1.svg' },
      { product_name: 'FiberLink Switch 16', price: 159, stock: 16, category: 4, image_url: '/images/products/fiberlinkswitch16.svg' },
      { product_name: 'QuantumPad Pro', price: 69, stock: 38, category: 3, image_url: '/images/products/pad.jpg' },
      { product_name: 'OrbitCam FHD', price: 79, stock: 31, category: 3, image_url: '/images/products/web.jpg' },
      { product_name: 'ViewMax 24', price: 189, stock: 18, category: 2, image_url: '/images/products/viewmax24.svg' }
    ]

    const products = await db.Product.bulkCreate(
      productSeeds.map((p) => ({
        product_name: p.product_name,
        price: p.price,
        stock: p.stock,
        category_id: categories[p.category].category_id,
        description: `${p.product_name} for IT professionals and students.`,
        image_url: p.image_url || ''
      }))
    )

    const orders = []
    for (let i = 0; i < 18; i += 1) {
      const order = await db.Order.create({
        user_id: users[randomInt(0, users.length - 1)].user_id,
        order_date: randomDateInLastMonths(8),
        total_price: 0,
        status: statuses[randomInt(0, statuses.length - 1)]
      })
      orders.push(order)
    }

    for (const order of orders) {
      const productPool = [...products]
      const itemCount = randomInt(1, 3)
      let total = 0

      for (let i = 0; i < itemCount; i += 1) {
        const selectedIndex = randomInt(0, productPool.length - 1)
        const product = productPool.splice(selectedIndex, 1)[0]
        const quantity = randomInt(1, 4)
        const subtotal = quantity * Number(product.price)

        await db.OrderItem.create({
          order_id: order.order_id,
          product_id: product.product_id,
          quantity,
          subtotal
        })

        total += subtotal
      }

      await db.Order.update({ total_price: total }, { where: { order_id: order.order_id } })
    }

    console.log('Seed completed successfully.')
    console.log(`Users: ${users.length}, Products: ${products.length}, Orders: ${orders.length}`)
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
