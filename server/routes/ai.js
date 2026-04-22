const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzePdf, careerScout, interviewPrep, getHistory, getTypedHistory, generateRoadmap, getRoadmaps, interactiveInterview, generateQuizAndCards, generateQuestionPaper, solveDoubt, getLearningPulse, getAiStatus, handlePlagiarismCheck, handleAutoTagging } = require('../controllers/aiController');
const path = require('path');
const fs = require('fs');

// Assure tmp uploads directory exists
const tmpDir = path.join(__dirname, '../uploads/tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs and Images (JPG, PNG, WEBP) are allowed'));
    }
  }
});

const { protect } = require('../middleware/auth');

router.post('/analyze-pdf', protect, upload.single('pdf'), analyzePdf);
router.post('/career-scout', protect, careerScout);
router.post('/interview-prep', protect, interviewPrep);
router.get('/history', protect, getHistory);
router.get('/typed-history', protect, getTypedHistory);
router.post('/generate-roadmap', protect, generateRoadmap);
router.get('/roadmaps', protect, getRoadmaps);
router.post('/interactive-interview', protect, interactiveInterview);
router.post('/study-chat', protect, require('../controllers/aiController').studyRoomChat);
router.post('/generate-quiz', protect, generateQuizAndCards);
router.post('/generate-question-paper', protect, generateQuestionPaper);
router.post('/solve-doubt', protect, upload.single('image'), solveDoubt);
router.get('/learning-pulse', protect, getLearningPulse);

router.post('/check-plagiarism', protect, handlePlagiarismCheck);
router.post('/auto-tag', protect, handleAutoTagging);

router.get('/status', protect, getAiStatus);
module.exports = router;
