const Message = require('../models/Message')

exports.getMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const messages = await Message.find({ group: req.params.groupId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .populate('resource', 'title type fileUrl')

    res.status(200).json({ success: true, data: messages })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate('group')
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' })

    const isGroupAdmin = message.group.members.some(m => m.user.toString() === req.user.id && m.role === 'admin')
    if (message.sender.toString() !== req.user.id && !isGroupAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    message.isDeleted = true
    message.content = 'This message was deleted'
    await message.save()

    res.status(200).json({ success: true, data: message })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.editMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' })

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    message.content = req.body.content
    message.isEdited = true
    message.editedAt = Date.now()
    await message.save()

    res.status(200).json({ success: true, data: message })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
exports.getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const limit = parseInt(req.query.limit) || 50
    
    // Find messages where (sender=me AND recipient=them) OR (sender=them AND recipient=me)
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('replyTo')

    res.status(200).json({ success: true, data: messages })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
exports.getRecentChats = async (req, res) => {
  try {
    // Find all users who have sent messages to me or received messages from me
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
      recipient: { $exists: true }
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')

    const recentUsers = []
    const seenUsers = new Set()
    seenUsers.add(req.user.id.toString())

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user.id.toString() ? msg.recipient : msg.sender
      if (otherUser && !seenUsers.has(otherUser._id.toString())) {
        recentUsers.push(otherUser)
        seenUsers.add(otherUser._id.toString())
      }
    })

    res.status(200).json({ success: true, data: recentUsers })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' })
    }

    // Return the URL for the frontend to use in socket message
    const fileUrl = `/uploads/resources/${req.file.filename}`
    res.status(200).json({ success: true, data: fileUrl })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}
