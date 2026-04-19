const mongoose = require('mongoose');

const peerTutorSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  topics: [{ type: String, trim: true }],
  description: { type: String, maxlength: 500 },
  hourlyRate: { type: Number, default: 0 }, // 0 = free / volunteer
  mode: { type: String, enum: ['online', 'offline', 'both'], default: 'online' },
  availability: { type: String, default: 'Weekdays 6-9 PM' },
  experience: { type: String },
  resumeUrl: { type: String },
  rating: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  reviews: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  requests: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PeerTutor', peerTutorSchema);
