const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  displayName: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: { type: String, default: '' },
  college: { type: String, required: true },
  course: { type: String },
  year: { type: String },
  bio: { type: String, maxlength: 200, default: '' },
  subjects: [{ type: String, trim: true }],
  isPremium: { type: Boolean, default: false },
  aiUsageCount: { type: Number, default: 0 },
  codingTrialCount: { type: Number, default: 0 },
  dailyDownloadsUsed: { type: Number, default: 0 },
  lastDownloadDate: { type: Date },
  reputation: { type: Number, default: 0 },
  totalUploads: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  savedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  timezone: { type: String, default: 'UTC' },
  lastActiveDate: { type: Date },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  streakHistory: [{
    date: Date,
    action: { type: String, enum: ['access', 'download'] }
  }],
  discussionWins: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String, select: false },
  otpExpire: { type: Date, select: false },
  googleId: { type: String },
  role: { type: String, enum: ['user', 'moderator', 'admin', 'teacher'], default: 'user' },
  notifications: {
    groupMessages: { type: Boolean, default: true },
    badgeAwards: { type: Boolean, default: true },
    uploadAlerts: { type: Boolean, default: true },
  },
  privacy: {
    showProfile: { type: Boolean, default: true },
    showActivity: { type: Boolean, default: true },
    allowDMs: { type: Boolean, default: true },
  },
  githubUsername: { type: String, default: '' },
  leetcodeUsername: { type: String, default: '' },
  verifiedSkills: [{
    skill: String,
    level: Number,
    lastVerified: Date
  }],
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
