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
      { product_name: 'Notebook HP OmniBook X Flip 14-fk0054AU', price: 749, stock: 18, category: 0, image_url: '/images/products/24.jpg' },
      { product_name: 'Apple MacBook Air 13 M4/16GB/512 - Sky Blue', price: 1299, stock: 10, category: 0, image_url: '/images/products/A0167646OK_BIG_1.jpg' },
      { product_name: 'Nimbus - iPhone X / XS Case', price: 599, stock: 30, category: 1, image_url: '/images/products/AR-02-DAC.webp' },
      { product_name: 'Apple iPhone 17 Pro Max 256GB Cosmic Orange', price: 399, stock: 25, category: 1, image_url: '/images/products/iPhone_17_Pro_Max_7-square_medium.jpg' },
      { product_name: 'จอมอนิเตอร์ SAMSUNG Odyssey G50F LS32FG502EEXXT Gaming Monitor (IPS 2K 180Hz)', price: 229, stock: 15, category: 2, image_url: '/images/products/samsung-monitor-odyssey-g50f-ls32fg502eexxt-ips-2k-180hz-g-sync-amd-freesync-8806097820079-1-square_medium.jpg' },
      { product_name: 'จอมอนิเตอร์ SAMSUNG Odyssey G53F LS27FG530EEXXT Gaming Monitor (IPS 2K 200Hz)', price: 319, stock: 12, category: 2, image_url: '/images/products/samsung-monitor-odyssey-g53f-ls27fg530eexxt-ips-2k-200hz-8806097738879-1-square_medium.jpg' },
      { product_name: 'แว่นวีอาร์ Sony PlayStation VR2', price: 89, stock: 40, category: 3, image_url: '/images/products/Sony-PlayStation-VR2-6-square_medium.jpg' },
      { product_name: 'จอยคอนโทรลเลอร์ Sony DualSense Gray Camouflage', price: 49, stock: 55, category: 3, image_url: '/images/products/Sony-DualSense-Wireless-Controller-Grey-Camouflage-1-square_medium.jpg' },
      { product_name: 'เราเตอร์ Asus Network TUF-AX4200 Dual Band WiFi 6 Gaming Router', price: 179, stock: 20, category: 4, image_url: '/images/products/Asus-Network-TUF-AX4200-Dual-Band-WiFi-6-Gaming-Router-1-square_medium.jpg' },
      { product_name: 'เราเตอร์ TP-Link Network TL-WA1201 AC1200 Access Point', price: 249, stock: 14, category: 4, image_url: '/images/products/TP-Link-Access-Point-TL-WA1201-AC1200-1-square_medium.jpg' },
      { product_name: 'หูฟังเกมมิ่ง HyperX Gaming Headset Cloud Alpha Wireless', price: 139, stock: 22, category: 3, image_url: '/images/products/Hyper-X-Gaming-Headset-Cloud-Alpha-Wireless-02-square_medium.jpg' },
      { product_name: 'จอยพวงมาลัย Logitech Gaming G923 Racing Wheel', price: 109, stock: 28, category: 3, image_url: '/images/products/Logitech-Gaming-G923-Racing-Wheel-1.-square_medium.jpg' },
      { product_name: 'สวิตช์ฮับ TP-Link Network TL-SG108 8-Port Gigabit Switch', price: 159, stock: 16, category: 4, image_url: '/images/products/TP-Link-TL-SG108-8-Port-101001000Mbps-Desktop-Switch-2-square_medium.jpg' },
      { product_name: 'คีย์บอร์ดเกมมิ่ง SteelSeries Apex Pro Mini Omnipoint Key US Magnetic Wrist Rest', price: 69, stock: 38, category: 3, image_url: '/images/products/steelseries-gaming-keyboard-apex-pro-mini-omnipoint-key-us-magnetic-wrist-rest-gen-3-square_medium.jpg '},
      { product_name: 'คีย์บอร์ดเกมมิ่ง Ajazz Gaming AK820MaxPlus Gasket Tri-Mod RGB Hardie - Avo Switch', price: 79, stock: 31, category: 3, image_url: '/images/products/ajazz-gaming-keyboard-ak820maxplus-hardie-gasket-tri-mod-rgb-avo-switch-2-square_medium.jpg' },
      { product_name: 'จอมอนิเตอร์ SAMSUNG Odyssey G9 LS49FG912EEXXT Gaming Monitor (VA Curved 144Hz)', price: 189, stock: 18, category: 2, image_url: '/images/products/samsung-monitor-odyssey-ls49fg912eexxt-va-curved-dqhd-144hz-1ms-8806095976426-1-square_medium.jpg' }
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
