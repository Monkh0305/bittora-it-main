const db = require('../models')

const User = db.User

function normalizeRole(role) {
  return role === 'admin' ? 'admin' : 'customer'
}

exports.index = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['user_id', 'ASC']] })
    res.render('users/index', { users })
  } catch (error) {
    req.flash('error', `Failed to load users: ${error.message}`)
    res.redirect('/')
  }
}

exports.show = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: [{ model: db.Order }] })
    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/users')
    }
    res.render('users/show', { user })
  } catch (error) {
    req.flash('error', `Failed to load user: ${error.message}`)
    res.redirect('/users')
  }
}

exports.newForm = (req, res) => {
  res.render('users/new')
}

exports.create = async (req, res) => {
  try {
    await User.create({
      ...req.body,
      role: normalizeRole(req.body.role)
    })
    req.flash('success', 'User created successfully')
    res.redirect('/users')
  } catch (error) {
    req.flash('error', `Failed to create user: ${error.message}`)
    res.redirect('/users/new')
  }
}

exports.editForm = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/users')
    }
    res.render('users/edit', { user })
  } catch (error) {
    req.flash('error', `Failed to load edit form: ${error.message}`)
    res.redirect('/users')
  }
}

exports.update = async (req, res) => {
  try {
    const [updatedCount] = await User.update({
      ...req.body,
      role: normalizeRole(req.body.role)
    }, {
      where: { user_id: req.params.id }
    })

    if (!updatedCount) {
      req.flash('error', 'User not found')
      return res.redirect('/users')
    }

    req.flash('success', 'User updated successfully')
    res.redirect(`/users/${req.params.id}`)
  } catch (error) {
    req.flash('error', `Failed to update user: ${error.message}`)
    res.redirect(`/users/${req.params.id}/edit`)
  }
}

exports.delete = async (req, res) => {
  try {
    const deletedCount = await User.destroy({ where: { user_id: req.params.id } })
    if (!deletedCount) {
      req.flash('error', 'User not found')
      return res.redirect('/users')
    }

    req.flash('success', 'User deleted successfully')
    res.redirect('/users')
  } catch (error) {
    req.flash('error', `Failed to delete user: ${error.message}`)
    res.redirect('/users')
  }
}
