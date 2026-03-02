require('dotenv').config()
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const expressLayouts = require('express-ejs-layouts')
const db = require('./models')
const { requireAuth } = require('./middlewares/auth')

const app = express()


// ===== Basic Config =====
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set('layout', 'layouts/main')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// ===== Session + Flash =====
app.use(session({
  secret: 'bittora-secret',
  resave: false,
  saveUninitialized: true
}))

app.use(flash())

app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  res.locals.currentUser = req.session.user || null
  res.locals.isAdmin = !!(req.session.user && req.session.user.role === 'admin')
  res.locals.isUser = !!(req.session.user && req.session.user.role !== 'admin')
  next()
})

const authRoutes = require('./routes/authRoutes')
app.use('/auth', authRoutes)

app.use(requireAuth)

const homeRoutes = require('./routes/homeRoutes')
app.use('/', homeRoutes)

const productRoutes = require('./routes/productRoutes')
app.use('/products', productRoutes)

const categoryRoutes = require('./routes/categoryRoutes')
app.use('/categories', categoryRoutes)

const userRoutes = require('./routes/userRoutes')
app.use('/users', userRoutes)

const orderRoutes = require('./routes/orderRoutes')
app.use('/orders', orderRoutes)

const orderItemRoutes = require('./routes/orderItemRoutes')
app.use('/order-items', orderItemRoutes)
app.use('/order_items', orderItemRoutes)

const reportRoutes = require('./routes/reportRoutes')
app.use('/reports', reportRoutes)

db.sequelize.sync()
  .then(() => {
    console.log('Database synced')
  })
  .catch(err => console.log(err))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
})
