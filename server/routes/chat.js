const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getMessages, deleteMessage, editMessage } = require('../controllers/chatController')

router.get('/:groupId', protect, getMessages)
router.get('/private/recent', protect, require('../controllers/chatController').getRecentChats)
router.post('/upload', protect, require('../config/cloudinary').upload.single('file'), require('../controllers/chatController').uploadChatFile)
router.get('/private/:userId', protect, require('../controllers/chatController').getPrivateMessages)
router.delete('/message/:id', protect, deleteMessage)
router.put('/message/:id', protect, editMessage)

module.exports = router
