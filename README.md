# Bittora IT Store

## Description
Bittora IT Store is a university Full Stack Web Development project for managing an online IT equipment shop.  
The project uses MVC architecture with Express.js, EJS views, Sequelize ORM, and SQLite.

## Tech Stack
- Node.js
- Express.js
- EJS
- Sequelize ORM
- SQLite
- CSS

## Database Design
Main tables:
- `users`
- `products`
- `orders`
- `order_items` (junction table)
- `categories` (supporting product classification)

Key Sequelize associations:
- `User.hasMany(Order)`
- `Order.belongsTo(User)`
- `Order.belongsToMany(Product, { through: OrderItem })`
- `Product.belongsToMany(Order, { through: OrderItem })`
- `Order.hasMany(OrderItem)`
- `OrderItem.belongsTo(Order)`
- `Product.hasMany(OrderItem)`
- `OrderItem.belongsTo(Product)`
- `Category.hasMany(Product)`
- `Product.belongsTo(Category)`

## Features
- Full CRUD for:
  - Users
  - Products
  - Orders
  - Order Items
- Dashboard with aggregate statistics:
  - Total users
  - Total products
  - Total orders
  - Total revenue
- Reports:
  - Sales report with date/month filter and summary totals
  - Best-selling products report with quantity and revenue ranking
- Responsive UI with shared navbar partial
- Flash success/error alerts
- Delete confirmation dialogs

## Reports Explanation
1. Sales Report (`/reports/sales`)
- Filters by specific date or month
- Shows summary by order date:
  - Order date
  - Total orders
  - Total revenue
- Also shows detailed order rows for verification

2. Best Products Report (`/reports/best-products`)
- Uses `order_items` join aggregation
- Shows:
  - Product name
  - Total quantity sold
  - Total revenue per product

## Installation
```bash
git clone https://github.com/TypeN2003/bittora-it.git
cd bittora-it
npm install
```

## Run Instructions
Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Open:
`http://localhost:3000`

## Seed Command
```bash
npm run seed
```

Seed includes:
- 10+ users
- 15+ products
- 15+ orders
- realistic order items

## Route Overview
- `/` dashboard
- `/users`
- `/products`
- `/orders`
- `/order_items` (also supports `/order-items`)
- `/reports`
- `/reports/sales`
- `/reports/best-products`

## Screenshots
- Dashboard page
- Products CRUD page
- Orders + Order Items CRUD page
- Sales report page
- Best products report page

Add your screenshots in this section before final submission.
