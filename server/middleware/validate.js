const { validationResult, body } = require('express-validator')

const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() })
  }
  next()
}

exports.validateRegister = [
  body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('college').trim().notEmpty().withMessage('College is required').escape(),
  handleValidation
]

exports.validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
]

exports.validateResource = [
  body('title').trim().notEmpty().withMessage('Title is required').escape(),
  body('subject').trim().notEmpty().withMessage('Subject is required').escape(),
  body('description').optional().trim().escape(),
  handleValidation
]
