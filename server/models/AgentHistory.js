const mongoose = require('mongoose');

const agentHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous/unauthenticated users if necessary, though ideally it should be required
  },
  agentType: {
    type: String,
    enum: ['PDF_SUMMARIZER', 'CAREER_SCOUT', 'INTERVIEW_PREP', 'INTERVIEW_SESSION', 'ROADMAP', 'FLASHCARDS', 'QUESTION_PAPER', 'DOUBT_SOLVER'],
    required: true
  },
  inputText: {
    type: String, // Can be the raw profile text or "PDF uploaded"
    required: true
  },
  result: {
    type: String, // The generated markdown report or summary
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Storing extracted parsed skills, etc
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AgentHistory', agentHistorySchema);
