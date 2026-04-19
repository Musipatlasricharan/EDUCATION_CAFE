const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetCourse: { type: String },
  targetYear: { type: String },
  questions: [{
    question: String,
    type: { type: String, enum: ['mcq', 'short', 'descriptive'], default: 'short' },
    options: [String],
    correctAnswer: String,
    marks: { type: Number, default: 10 }
  }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [{ questionIndex: Number, answer: String }],
    score: Number,
    feedback: String,
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' }
  }],
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
