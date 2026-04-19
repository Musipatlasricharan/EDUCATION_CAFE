const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  topic: { type: String, required: true },
  content: { type: String },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'voting', 'closed'], default: 'active' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  responses: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  votingEndsAt: { type: Date },
  closedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
