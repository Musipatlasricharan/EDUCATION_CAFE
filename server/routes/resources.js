const express = require('express')
const router = express.Router()
const { protect, authorize, checkOwnership } = require('../middleware/auth')
const Resource = require('../models/Resource')
const { upload } = require('../config/cloudinary')
const {
  getResources, getSingleResource, uploadResource,
  deleteResource, rateResource, toggleLike,
  downloadResource, getMyResources, getTrendingResources,
  reportResource, verifyResource, bookmarkResource, getRecommendations
} = require('../controllers/resourceController')
const { getComments, addComment } = require('../controllers/commentController')
const { validateResource } = require('../middleware/validate')

router.get('/my', protect, getMyResources)
router.get('/trending', getTrendingResources)
router.get('/recommendations', protect, getRecommendations)

router.route('/')
  .get(getResources)
  .post(protect, upload.single('file'), validateResource, uploadResource)

router.get('/:id', getSingleResource)
router.delete('/:id', protect, checkOwnership(Resource), deleteResource)
router.post('/:id/rate', protect, rateResource)
router.post('/:id/like', protect, toggleLike)
router.get('/:id/download', protect, downloadResource)
router.post('/:id/report', protect, reportResource)
router.put('/:id/verify', protect, authorize('moderator', 'admin'), verifyResource)
router.post('/:id/bookmark', protect, bookmarkResource)
router.get('/:id/comments', getComments)
router.post('/:id/comments', protect, addComment)

module.exports = router
