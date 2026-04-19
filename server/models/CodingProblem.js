const mongoose = require('mongoose');

const CodingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags: [{ type: String }],
  description: { type: String, required: true }, // Rich Text
  explanation: { type: String, default: '' }, // Rich Text
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: { type: String, default: '' }, // Text area
  timeComplexity: { type: String, default: '' }, // e.g. O(n log n)
  spaceComplexity: { type: String, default: '' }, // e.g. O(n)
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  starterCode: {
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' }
  },
  editorial: { type: String, default: '' },
  timeLimit: { type: Number, default: 1000 }, // ms
  memoryLimit: { type: Number, default: 256 }, // MB
  tolerance: { type: Number, default: 0 }, // For float outputs, e.g. 6 decimal places (currently not strictly enforced by piston but good to store)
  orderInsensitive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptanceRate: { type: Number, default: 0 }, // Computed later or stored
}, { timestamps: true });

module.exports = mongoose.model('CodingProblem', CodingProblemSchema);
