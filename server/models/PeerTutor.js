const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },       // e.g. B.Tech, M.Sc, PhD
  field: { type: String, required: true },         // e.g. Computer Science
  institution: { type: String, required: true },   // e.g. IIT Bombay
  year: { type: String },                          // e.g. 2024 or "2022-2026"
  grade: { type: String },                         // e.g. 9.2 CGPA, 85%
}, { _id: false });

const workExperienceSchema = new mongoose.Schema({
  role: { type: String, required: true },          // e.g. Teaching Assistant
  organization: { type: String, required: true },  // e.g. IIT Madras
  duration: { type: String },                      // e.g. Jan 2023 – May 2023
  description: { type: String },
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g. AWS Certified Developer
  issuer: { type: String },                        // e.g. Amazon
  year: { type: String },
}, { _id: false });

const peerTutorSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Core tutoring fields
  subject: { type: String, required: true, trim: true },
  topics: [{ type: String, trim: true }],
  description: { type: String, maxlength: 1000 },
  hourlyRate: { type: Number, default: 0 },
  mode: { type: String, enum: ['online', 'offline', 'both'], default: 'online' },
  availability: { type: String, default: 'Weekdays 6-9 PM' },
  languages: [{ type: String }],

  // Professional profile
  education: [educationSchema],
  workExperience: [workExperienceSchema],
  certifications: [certificationSchema],
  skills: [{ type: String }],
  experience: { type: String },   // free-text summary

  // Resume / LinkedIn
  resumeUrl: { type: String },    // file path (served via /uploads) or external URL
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  portfolioUrl: { type: String },

  // Stats
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },

  // Reviews
  reviews: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // Session requests
  requests: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    subject: String,
    preferredTime: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
    tutorNote: String,
    requestedAt: { type: Date, default: Date.now },
    respondedAt: Date,
  }],

  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },  // admin verified
}, { timestamps: true });

// Recalculate average rating after save
peerTutorSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.totalRatings = 0; return; }
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
  this.totalRatings = this.reviews.length;
};

module.exports = mongoose.model('PeerTutor', peerTutorSchema);
