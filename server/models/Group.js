const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 500 },
  avatar: { type: String },
  college: { type: String },
  subject: { type: String },
  category: { type: String, enum: ['Engineering', 'Medical', 'Arts', 'Science', 'Commerce', 'Other'], default: 'Other' },
  isPrivate: { type: Boolean, default: false },
  inviteCode: { type: String, unique: true },
  dailyTopic: {
    content: { type: String },
    updatedAt: { type: Date }
  },
  activeMeeting: {
    link: { type: String },
    platform: { type: String, enum: ['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'] },
    startTime: { type: Date }
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  memberCount: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
