function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next()
  }

  req.flash('error', 'Please log in first.')
  return res.redirect('/auth/login')
}

function requireGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/')
  }
  return next()
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next()
  }

  req.flash('error', 'Admin access only.')
  return res.redirect('/')
}

module.exports = {
  requireAuth,
  requireGuest,
  requireAdmin
}

