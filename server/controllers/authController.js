const User = require('../models/User')
const Group = require('../models/Group')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
const bcrypt = require('bcryptjs')
const { checkAndAward } = require('../utils/badgeEngine')

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id)

  // Create a safe user object by removing sensitive fields
  const safeUser = user.toObject()
  delete safeUser.password
  delete safeUser.password
  delete safeUser.otpCode
  delete safeUser.otpExpire

  res.status(statusCode).json({ success: true, token, user: safeUser })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, college, course, year } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' })

    const user = await User.create({ name, email, password, college, course, year, isVerified: true })

    // Auto-join or create General group for the college
    try {
      let group = await Group.findOne({ name: `General-${college}`, college });
      if (!group) {
        group = await Group.create({
          name: `General-${college}`,
          description: `General discussion group for ${college} students.`,
          college,
          creator: user._id,
          members: [{ user: user._id, role: 'admin' }],
          category: 'Other',
          isPrivate: false,
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        });
      } else {
        await Group.findByIdAndUpdate(group._id, {
          $addToSet: { members: { user: user._id, role: 'member' } },
          $inc: { memberCount: 1 }
        });
      }
      await User.findByIdAndUpdate(user._id, { $addToSet: { groups: group._id } });
    } catch (groupError) {
      console.error('Auto-join group error:', groupError);
      // Don't fail registration if group join fails
    }

    sendTokenResponse(user, 201, res)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' })
    }

    const user = await User.findOne({ email }).select('+otpCode +otpExpire')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' })
    }

    const isMatch = await bcrypt.compare(otp, user.otpCode)
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid OTP' })

    user.isVerified = true
    user.otpCode = undefined
    user.otpExpire = undefined
    await user.save({ validateBeforeSave: false })

    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const isMatch = await user.matchPassword(password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    // Evaluate Engagement Badges on Login
    const earned = await checkAndAward(user._id, 'Engagement')
    if (earned && earned.length > 0) {
      req.app.get('io').to(user._id.toString()).emit('badge_earned', earned)
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('badges savedResources collections groups')
    res.status(200).json({ success: true, user })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Please provide an email' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ success: false, message: 'No user found with that email' })

    // Generate 6-digit OTP
    const otp = generateOTP()
    const otpExpire = Date.now() + 10 * 60 * 1000 // 10 minutes
    const salt = await bcrypt.genSalt(10)
    user.otpCode = await bcrypt.hash(otp, salt)
    user.otpExpire = otpExpire

    await user.save({ validateBeforeSave: false })

    console.log(`[AUTH] Password Reset OTP for ${email}: ${otp}`);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP - EduCafe',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #4F46E5; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #333;">Hello ${user.name || 'User'},</p>
            <p style="font-size: 16px; color: #333;">You requested a password reset. Your One-Time Password (OTP) is:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #666;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
            <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      })

      res.status(200).json({ success: true, message: 'Password reset OTP sent to email' })
    } catch (err) {
      console.error('Forgot Password Email Error:', err)
      user.otpCode = undefined
      user.otpExpire = undefined
      await user.save({ validateBeforeSave: false })
      res.status(500).json({ success: false, message: 'Could not process request: ' + err.message })
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP and new password' })
    }

    const user = await User.findOne({ email }).select('+password +otpCode +otpExpire')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' })
    }

    const isMatch = await bcrypt.compare(otp, user.otpCode)
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid OTP' })

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' })
    }

    // Set new password
    user.password = password
    user.otpCode = undefined
    user.otpExpire = undefined
    user.isVerified = true // Auto-verify on password reset
    await user.save()

    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password')

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      displayName: req.body.displayName,
      college: req.body.college,
      course: req.body.course,
      year: req.body.year,
      bio: req.body.bio,
      subjects: req.body.subjects,
      notifications: req.body.notifications,
      privacy: req.body.privacy,
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key])

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    })

    res.status(200).json({ success: true, data: user })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}
