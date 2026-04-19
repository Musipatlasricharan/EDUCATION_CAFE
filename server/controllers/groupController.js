const crypto = require('crypto')
const Group = require('../models/Group')
const User = require('../models/User')
const { checkAndAward } = require('../utils/badgeEngine')

exports.createGroup = async (req, res) => {
  let group, attempts = 0
  while (attempts < 3) {
    try {
      const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()
      group = await Group.create({
        ...req.body,
        creator: req.user._id,
        members: [{ user: req.user._id, role: 'admin' }],
        inviteCode
      })
      await User.findByIdAndUpdate(req.user._id, { $push: { groups: group._id } })
      await checkAndAward(req.user._id, 'first_group')
      break
    } catch (err) {
      if (err.code === 11000) { attempts++; continue }
      return res.status(400).json({ success: false, message: err.message })
    }
  }
  if (!group) return res.status(500).json({ success: false, message: 'Could not generate unique invite code' })
  res.status(201).json({ success: true, data: group })
}

exports.getGroups = async (req, res) => {
  try {
    const { discover } = req.query
    let query = { 'members.user': req.user.id }
    
    if (discover === 'true') {
      // Find public groups the user is NOT a member of
      query = { 
        isPrivate: false, 
        'members.user': { $ne: req.user.id } 
      }
    }

    const groups = await Group.find(query)
      .populate('creator', 'name avatar')
    res.status(200).json({ success: true, count: groups.length, data: groups })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.updateDailyTopic = async (req, res) => {
  try {
    const { topic } = req.body
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members': { $elemMatch: { user: req.user.id, role: 'admin' } } },
      { dailyTopic: { content: topic, updatedAt: Date.now() } },
      { new: true }
    )
    if (!group) return res.status(403).json({ success: false, message: 'Not authorized or group not found' })
    
    // Broadcast update to the group
    req.app.get('io').to(req.params.id).emit('group_updated', group)
    
    res.status(200).json({ success: true, data: group })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.updateMeetingLink = async (req, res) => {
  try {
    const { link, platform } = req.body
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, 'members': { $elemMatch: { user: req.user.id, role: 'admin' } } },
      { activeMeeting: { link, platform, startTime: Date.now() } },
      { new: true }
    )
    if (!group) return res.status(403).json({ success: false, message: 'Not authorized or group not found' })
    
    // Broadcast update to the group
    req.app.get('io').to(req.params.id).emit('group_updated', group)
    
    res.status(200).json({ success: true, data: group })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getSingleGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar college reputation points badges')
      .populate('resources')
    
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })
    res.status(200).json({ success: true, data: group })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    const isMember = group.members.find(m => m.user.toString() === req.user.id)
    if (isMember) return res.status(400).json({ success: false, message: 'Already a member' })

    group.members.push({ user: req.user.id })
    group.memberCount += 1
    await group.save()

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { groups: group._id } })
    res.status(200).json({ success: true, data: group })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.joinByInviteCode = async (req, res) => {
  try {
    const code = req.params.code?.toUpperCase()
    const group = await Group.findOne({ inviteCode: code })
    if (!group) return res.status(404).json({ success: false, message: 'Invalid invite code' })

    const isMember = group.members.find(m => m.user.toString() === req.user.id)
    if (isMember) return res.status(200).json({ success: true, data: group, joined: true })

    group.members.push({ user: req.user.id })
    group.memberCount += 1
    await group.save()

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { groups: group._id } })
    
    res.status(200).json({ success: true, data: group })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    group.members = group.members.filter(m => m.user.toString() !== req.user.id)
    group.memberCount -= 1
    await group.save()

    await User.findByIdAndUpdate(req.user.id, { $pull: { groups: group._id } })
    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.user', 'name email avatar college reputation points badges')
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })
    res.status(200).json({ success: true, data: group.members })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    // Only creator can delete
    if (group.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this group' })
    }

    await group.deleteOne()
    
    // Also remove from all members' groups list
    await User.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    )

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.addResourceToGroup = async (req, res) => {
  try {
    const { resourceId } = req.body
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    const isMember = group.members.find(m => m.user.toString() === req.user.id)
    if (!isMember) return res.status(403).json({ success: false, message: 'Must be a member to add resources' })

    if (group.resources.includes(resourceId)) {
      return res.status(400).json({ success: false, message: 'Resource already in group' })
    }

    group.resources.push(resourceId)
    await group.save()

    res.status(200).json({ success: true, data: group })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getGroupResources = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('resources')
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })
    res.status(200).json({ success: true, data: group.resources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
exports.assignGroupWinner = async (req, res) => {
  try {
    const { userId } = req.body
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

    // Only admin can assign winner
    const isAdmin = group.members.find(m => m.user.toString() === req.user.id && m.role === 'admin')
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Only an admin can assign a winner' })

    const winner = await User.findById(userId)
    if (!winner) return res.status(404).json({ success: false, message: 'User not found' })

    // Award a special group champion badge
    const earned = await checkAndAward(userId, 'Discussion', { isVictory: true, groupId: group._id })
    
    if (earned && earned.length > 0) {
      req.app.get('io').to(userId.toString()).emit('badge_earned', earned)
    }

    res.status(200).json({ success: true, message: 'Winner assigned and badge awarded', earned })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
