const mongoose = require('mongoose');

const earnedBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  triggerData: {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
    streakCount: Number
  },
  isUnread: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EarnedBadge', earnedBadgeSchema);
