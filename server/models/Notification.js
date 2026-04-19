const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['comment', 'download', 'badge', 'reply', 'group_message', 'like', 'rating', 'report_resolved'], required: true },
  message: { type: String, required: true },
  link: { type: String },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
