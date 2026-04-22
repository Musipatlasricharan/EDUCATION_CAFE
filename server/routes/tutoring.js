const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
    registerTutor,
    getMyProfile,
    updateMyProfile,
    getTutors,
    getTutorById,
    requestSession,
    getMyRequests,
    respondToRequest,
    leaveReview,
    deleteMyProfile,
} = require('../controllers/tutoringController');

// ── Multer setup for resume uploads ───────────────────────────────────────────
const resumeDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, resumeDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `resume_${Date.now()}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files are allowed.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB max

// ── Routes ─────────────────────────────────────────────────────────────────────
router.use(protect);

router.get('/tutors',             getTutors);
router.get('/tutors/:id',         getTutorById);

router.post('/register',          upload.single('resume'), registerTutor);
router.get('/my-profile',         getMyProfile);
router.put('/my-profile',         upload.single('resume'), updateMyProfile);
router.delete('/my-profile',      deleteMyProfile);

router.get('/my-requests',        getMyRequests);
router.post('/request/:tutorId',  requestSession);
router.put('/request/:tutorId/:requestId', respondToRequest);

router.post('/review/:tutorId',   leaveReview);

module.exports = router;
