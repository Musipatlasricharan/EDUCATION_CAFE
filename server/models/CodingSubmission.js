const mongoose = require('mongoose');

const CodingSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  verdict: { type: String, enum: ['Accepted ✅', 'Wrong Answer ❌', 'TLE ⏱', 'Runtime Error 💥', 'Compile Error 🔧', 'Pending'], required: true },
  runtime: { type: Number, default: 0 }, // in ms
  memory: { type: Number, default: 0 }, // in bytes/KB
  testResultDetails: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    error: String,
    isHidden: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('CodingSubmission', CodingSubmissionSchema);
