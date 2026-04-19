const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isExample: { type: Boolean, default: false }
}, { _id: false });

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  problemStatement: { type: String, required: true },
  
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  
  tags: [{ type: String }],
  category: { type: String },
  
  constraints: [{ type: String }],
  examples: [{
    explanation: String,
    input: String,
    output: String
  }],
  
  testCases: [testCaseSchema],
  
  // Complexity expectations
  timeComplexityExpected: { type: String },
  spaceComplexityExpected: { type: String },
  
  // Boilerplate code for each language
  boilerplateCode: {
    cpp: { type: String, default: '' },
    c: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' }
  },
  
  // Reference solution (not exposed to users)
  referenceSolution: {
    cpp: { type: String, default: '' },
    c: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' }
  },
  
  // Statistics
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  totalAccepted: { type: Number, default: 0 },
  
  // Author (Admin) - Optional for anonymous submissions
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  
  // Status
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  
  // Badges awarded for solving
  relatedBadges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  
}, { timestamps: true });

// Index for better performance
codingQuestionSchema.index({ difficulty: 1, tags: 1 });
// Note: slug already has unique index from field definition

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
