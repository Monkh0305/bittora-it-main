const { Sequelize } = require('sequelize')
const path = require('path')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/database.sqlite'),
  logging: false
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Import Models
db.User = require('./User')(sequelize, Sequelize)
db.Product = require('./Product')(sequelize, Sequelize)
db.Category = require('./category')(sequelize, Sequelize)
db.Order = require('./Order')(sequelize, Sequelize)
db.OrderItem = require('./OrderItem')(sequelize, Sequelize)

// ===== Associations =====

// User 1:N Order
db.User.hasMany(db.Order, { foreignKey: 'user_id', onDelete: 'CASCADE' })
db.Order.belongsTo(db.User, { foreignKey: 'user_id' })

// Order N:M Product through OrderItem
db.Order.belongsToMany(db.Product, {
  through: db.OrderItem,
  foreignKey: 'order_id',
  otherKey: 'product_id'
})
db.Product.belongsToMany(db.Order, {
  through: db.OrderItem,
  foreignKey: 'product_id',
  otherKey: 'order_id'
})

// Order 1:N OrderItem
db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' })
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id' })

// Product 1:N OrderItem
db.Product.hasMany(db.OrderItem, { foreignKey: 'product_id', onDelete: 'CASCADE' })
db.OrderItem.belongsTo(db.Product, { foreignKey: 'product_id' })

// Category 1:N Product
db.Category.hasMany(db.Product, { foreignKey: 'category_id' })
db.Product.belongsTo(db.Category, { foreignKey: 'category_id' })

module.exports = db
