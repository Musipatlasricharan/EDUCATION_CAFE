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

// Manual Seed route (For admins or for fixing empty DB)
router.post('/seed', protect, authorize('admin'), (req, res, next) => {
  require('../utils/seeder')()
    .then(() => res.status(200).json({ success: true, message: 'Problems seeded successfully' }))
    .catch(err => res.status(500).json({ success: false, message: err.message }));
});

module.exports = router;
