const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    try {
      req.user = await User.findById(decoded.id).select('-password -verifyToken -resetToken')
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' })
      }
    } catch (dbErr) {
      // If DB is down, but token is valid, create a mock user object
      // so AI agents and non-DB dependent routes can still function.
      console.warn('[Auth Middleware] DB down, using mock user from JWT:', dbErr.message);
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        isPremium: false, // Default to false safely
        aiUsageCount: 0   // Default to safely pass trial checks
      };
    }
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

// Optionally authenticate if token is provided, but don't fail if not
exports.optionalAuth = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password -verifyToken -resetToken')
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  
  next()
}

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // If no user, reject
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Access denied. No user authenticated.' })
    }
    
    // If user role not in required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. This action requires ${roles.join(' or ')} role. Your role: ${req.user.role}` 
      })
    }
    next()
  }
}

// Ownership check for IDOR protection
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id)
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' })
    }

    // Admins and owners can proceed
    if (resource.uploadedBy?.toString() !== req.user.id && resource.creator?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action' })
    }
    next()
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.checkGroupAdmin = (model) => async (req, res, next) => {
  try {
    const group = await model.findById(req.params.id || req.params.groupId)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    const member = group.members.find(m => m.user.toString() === req.user.id)
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only group admins can perform this action' })
    }
    next()
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}
