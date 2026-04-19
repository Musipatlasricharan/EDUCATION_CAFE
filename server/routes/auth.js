const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const {
  register, login, getMe, verifyOTP,
  forgotPassword, resetPassword, updatePassword, updateDetails
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { validateRegister, validateLogin } = require('../middleware/validate')

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.get('/me', protect, getMe)
router.post('/verify-otp', verifyOTP)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.put('/update-password', protect, updatePassword)
router.put('/update-details', protect, updateDetails)

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, sign token and redirect
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}&user=${JSON.stringify({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role
  })}`)
})

module.exports = router
