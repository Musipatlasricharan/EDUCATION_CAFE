const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max 25MB allowed.' })
  }
  
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found / Invalid ID format' })
  }

  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate field value entered' })
  }
  
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    return res.status(400).json({ success: false, message })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  })
}

module.exports = errorHandler
