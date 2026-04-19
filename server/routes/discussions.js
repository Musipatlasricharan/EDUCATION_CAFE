const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  startDiscussion, postResponse, voteResponse, closeDiscussion, getGroupDiscussions
} = require('../controllers/discussionController')

router.get('/group/:groupId', protect, getGroupDiscussions)

router.post('/', protect, startDiscussion)
router.post('/:id/responses', protect, postResponse)
router.post('/:id/responses/:responseId/vote', protect, voteResponse)
router.put('/:id/close', protect, closeDiscussion)

module.exports = router
