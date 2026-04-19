const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getLeaderboard, getMyRank } = require('../controllers/leaderboardController')

router.get('/', getLeaderboard)
router.get('/my-rank', protect, getMyRank)

module.exports = router
