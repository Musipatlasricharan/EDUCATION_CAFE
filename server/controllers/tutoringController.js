const PeerTutor = require('../models/PeerTutor');
const User = require('../models/User');

// @desc    Register as a tutor
// @route   POST /api/tutoring/register
// @access  Private
exports.registerTutor = async (req, res) => {
    try {
        const existingTutor = await PeerTutor.findOne({ tutor: req.user.id });
        if (existingTutor) {
            return res.status(400).json({ success: false, message: 'You are already registered as a tutor' });
        }

        req.body.tutor = req.user.id;
        const tutor = await PeerTutor.create(req.body);
        res.status(201).json({ success: true, data: tutor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all tutors
// @route   GET /api/tutoring/tutors
// @access  Private
exports.getTutors = async (req, res) => {
    try {
        const tutors = await PeerTutor.find({ isActive: true }).populate('tutor', 'name avatar college');
        res.status(200).json({ success: true, data: tutors });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Request a session
// @route   POST /api/tutoring/request/:tutorId
// @access  Private
exports.requestSession = async (req, res) => {
    try {
        const tutor = await PeerTutor.findById(req.params.tutorId);
        if (!tutor) {
            return res.status(404).json({ success: false, message: 'Tutor not found' });
        }

        tutor.requests.push({
            student: req.user.id,
            message: req.body.message
        });

        await tutor.save();
        res.status(200).json({ success: true, message: 'Request sent successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
