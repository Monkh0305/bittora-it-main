const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { requireAuth, requireGuest } = require('../middlewares/auth')

router.get('/login', requireGuest, authController.loginForm)
router.post('/login', requireGuest, authController.login)
router.post('/logout', requireAuth, authController.logout)

module.exports = router

