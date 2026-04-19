const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createNote,
    getMyNotes,
    getNote,
    updateNote
} = require('../controllers/noteController');

router.use(protect);

router.route('/')
    .post(createNote)
    .get(getMyNotes);

router.route('/:id')
    .get(getNote)
    .put(updateNote);

module.exports = router;
