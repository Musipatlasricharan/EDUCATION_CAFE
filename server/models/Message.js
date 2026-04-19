const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'resource', 'file', 'image', 'discussion_launch'], default: 'text' },
  fileUrl: { type: String },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: { type: Map, of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] },
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
