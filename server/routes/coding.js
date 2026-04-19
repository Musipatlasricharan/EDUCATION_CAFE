const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { createProblem, getProblems, getProblem, runCode, submitCode, getUserSubmissions } = require('../controllers/codingController');

// Admin side (Allowing all authenticated users for now for testing)
router.post('/admin/problems', protect, createProblem);

// Public / Solver side
router.get('/problems', optionalAuth, getProblems); 
router.get('/problems/:id', optionalAuth, getProblem);

// Execute Code
router.post('/problems/:id/run', protect, runCode);
router.post('/problems/:id/submit', protect, submitCode);
router.get('/problems/:id/submissions', protect, getUserSubmissions);

module.exports = router;
