const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, min: 1, max: 5 },
  review: { type: String },
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
}, { timestamps: true });

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 1000 },
  type: { type: String, enum: ['pdf', 'notes', 'slides', 'video', 'link', 'live', 'other'], required: true },
  subject: { type: String, required: true },
  topic: { type: String },
  semester: { type: Number },
  examType: { type: String, enum: ['midterm', 'final', 'assignment', 'other'] },
  difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  tags: [String],
  college: { type: String, required: true },
  fileUrl: { type: String },
  fileSize: { type: Number },
  fileName: { type: String },
  publicId: { type: String },
  previewUrl: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  ratings: [ratingSchema],
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
  reports: [reportSchema],
  quizzes: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  flashcards: [{
    front: String,
    back: String
  }]
}, { timestamps: true });

resourceSchema.index({ title: 'text', description: 'text', tags: 'text', subject: 'text' });
resourceSchema.index({ createdAt: -1, uploadedBy: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
