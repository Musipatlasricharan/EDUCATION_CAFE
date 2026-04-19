const Notification = require('../models/Notification')

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name avatar')

    res.status(200).json({ success: true, count: notifications.length, data: notifications })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })
    res.status(200).json({ success: true, data: notification })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { isRead: true })
    res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false })
    res.status(200).json({ success: true, count })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.createNotification = async (req, res) => {
  // Utility for internal usage 
}
