const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    registerTutor,
    getTutors,
    requestSession
} = require('../controllers/tutoringController');

router.use(protect);

router.post('/register', registerTutor);
router.get('/tutors', getTutors);
router.post('/request/:tutorId', requestSession);

module.exports = router;
