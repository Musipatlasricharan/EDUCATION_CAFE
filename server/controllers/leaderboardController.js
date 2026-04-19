const User = require('../models/User')

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', metric = 'points', college, limit = 20 } = req.query
    
    let match = {}
    if (college) match.college = college
    
    let sort = {}
    sort[metric] = -1

    let users = await User.find(match)
      .sort(sort)
      .limit(parseInt(limit))
      .select('name avatar college totalUploads totalDownloads totalLikes points reputation')
      .populate('badges')

    res.status(200).json({ success: true, data: users })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getMyRank = async (req, res) => {
  try {
    const { metric = 'points' } = req.query
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const rank = await User.countDocuments({ [metric]: { $gt: user[metric] } }) + 1
    
    res.status(200).json({ success: true, rank, user })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
