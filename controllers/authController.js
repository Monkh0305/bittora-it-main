const db = require('../models')

const User = db.User

exports.loginForm = (req, res) => {
  res.render('auth/login', {
    formData: { username: '' }
  })
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    const normalizedUsername = (username || '').trim()

    if (!normalizedUsername || !password) {
      req.flash('error', 'Username and password are required.')
      return res.status(400).render('auth/login', {
        formData: { username: normalizedUsername }
      })
    }

    const user = await User.findOne({
      where: {
        username: normalizedUsername,
        password
      }
    })

    if (!user) {
      req.flash('error', 'Invalid username or password.')
      return res.status(401).render('auth/login', {
        formData: { username: normalizedUsername }
      })
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    }

    req.flash('success', `Logged in as ${user.username} (${user.role}).`)
    return res.redirect('/')
  } catch (error) {
    req.flash('error', `Login failed: ${error.message}`)
    return res.status(500).render('auth/login', {
      formData: { username: (req.body.username || '').trim() }
    })
  }
}

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
}

