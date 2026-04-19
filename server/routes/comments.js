const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { likeComment, deleteComment } = require('../controllers/commentController')

router.post('/:id/like', protect, likeComment)
router.delete('/:id', protect, deleteComment)

module.exports = router
