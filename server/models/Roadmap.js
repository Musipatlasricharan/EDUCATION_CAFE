const mongoose = require('mongoose');

const phaseSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: String, // e.g. "Week 1", "Day 1-2"
  tasks: [String],
  resources: [{
    label: String,
    url: String,
    type: { type: String, enum: ['video', 'reading', 'practice', 'article', 'link', 'book', 'tutorial', 'course', 'exercise', 'other'], default: 'other' }
  }]
});

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  goal: { type: String, required: true },
  currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  durationInWeeks: Number,
  phases: [phaseSchema],
  progress: { type: Number, default: 0 }, // percentage
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  isAdaptive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
