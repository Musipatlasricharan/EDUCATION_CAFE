const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getProfile, updateProfile, getMyStats,
  createCollection, getCollections, saveToCollection,
  bookmarkResource, getBookmarks, getUserResources,
  uploadAvatar, deleteAccount, verifyGithubAccount, verifyLeetcodeAccount
} = require('../controllers/userController')

router.get('/me/stats', protect, getMyStats)
router.put('/profile', protect, updateProfile)
router.post('/avatar', protect, uploadAvatar)
router.delete('/me', protect, deleteAccount)
router.post('/verify/github', protect, verifyGithubAccount)
router.post('/verify/leetcode', protect, verifyLeetcodeAccount)

router.route('/collections')
  .post(protect, createCollection)
  .get(protect, getCollections)

router.post('/collections/:id/resources', protect, saveToCollection)

router.get('/bookmarks', protect, getBookmarks)
router.post('/bookmarks/:resourceId', protect, bookmarkResource)

router.get('/:id', getProfile)
router.get('/:userId/resources', getUserResources)

module.exports = router
