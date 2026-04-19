const Discussion = require('../models/Discussion')
const Group = require('../models/Group')
const { checkAndAward } = require('../utils/badgeEngine')

exports.getGroupDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ group: req.params.groupId })
      .sort({ createdAt: -1 })
      .populate('admin', 'name avatar')
      .populate('winner', 'name avatar')
      .populate('responses.user', 'name avatar')
    
    res.status(200).json({ success: true, data: discussions })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.startDiscussion = async (req, res) => {
  try {
    const { groupId, topic, content } = req.body
    const group = await Group.findById(groupId)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    // Check if user is admin
    const isAdmin = group.members.some(m => m.user.toString() === req.user.id && m.role === 'admin')
    if (!isAdmin) {
       return res.status(403).json({ success: false, message: 'Only admin can start discussions' })
    }

    const discussion = await Discussion.create({
      group: groupId,
      topic,
      content,
      admin: req.user.id
    })
    
    await discussion.populate('admin', 'name avatar')

    res.status(201).json({ success: true, data: discussion })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.postResponse = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
    if (!discussion || discussion.status !== 'active') {
       return res.status(400).json({ success: false, message: 'Discussion is not active' })
    }

    discussion.responses.push({
      user: req.user.id,
      content: req.body.content,
      createdAt: new Date()
    })
    
    if (!discussion.participants.includes(req.user.id)) {
        discussion.participants.push(req.user.id)
    }

    await discussion.save()
    await discussion.populate('responses.user', 'name avatar')
    await discussion.populate('admin', 'name avatar')

    res.status(200).json({ success: true, data: discussion })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.voteResponse = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
    if (discussion.status !== 'voting') {
        return res.status(400).json({ success: false, message: 'Voting is not open' })
    }

    const response = discussion.responses.id(req.params.responseId)
    if (!response) return res.status(404).json({ success: false, message: 'Response not found' })

    // Prevent double voting
    const hasVoted = response.votes.includes(req.user.id)
    if (hasVoted) return res.status(400).json({ success: false, message: 'Already voted' })

    response.votes.push(req.user.id)
    response.voteCount += 1
    await discussion.save()

    res.status(200).json({ success: true, data: discussion })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.closeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
    if (discussion.admin.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Only admin can close' })
    }

    if (discussion.status === 'active') {
        discussion.status = 'voting'
        discussion.votingEndsAt = Date.now() + 48 * 60 * 60 * 1000 // 48 hours
    } else if (discussion.status === 'voting') {
        discussion.status = 'closed'
        discussion.closedAt = Date.now()
        
        // Determine winner
        let winnerResponse = null
        let maxVotes = -1
        discussion.responses.forEach(r => {
            if (r.voteCount > maxVotes) {
                maxVotes = r.voteCount
                winnerResponse = r
            }
        })

        if (winnerResponse) {
            discussion.winner = winnerResponse.user
            // Award badges
            const isUnanimous = winnerResponse.voteCount / discussion.participants.length >= 0.9
            const uniqueGroupsWon = 1 // Simplified: need aggregate query for real check
            
            await checkAndAward(winnerResponse.user, 'Discussion', {
                isUnanimous,
                uniqueGroupsWon
            })
        }
    }

    await discussion.save()
    res.status(200).json({ success: true, data: discussion })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}
