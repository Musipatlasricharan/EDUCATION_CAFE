const PeerTutor = require('../models/PeerTutor');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// ─── Helper ────────────────────────────────────────────────────────────────────
const parseJSON = (val) => {
    if (!val) return undefined;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return undefined; }
};

// ─── @desc  Register / create tutor profile ────────────────────────────────────
// @route POST /api/tutoring/register
// @access Private
exports.registerTutor = async (req, res) => {
    try {
        const existing = await PeerTutor.findOne({ tutor: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You are already registered as a tutor. Use the update endpoint.' });
        }

        const {
            subject, topics, description, mode, availability,
            experience, hourlyRate, languages, skills,
            linkedinUrl, githubUrl, portfolioUrl, resumeUrl,
        } = req.body;

        const education = parseJSON(req.body.education) || [];
        const workExperience = parseJSON(req.body.workExperience) || [];
        const certifications = parseJSON(req.body.certifications) || [];

        // Handle resume file upload
        let finalResumeUrl = resumeUrl || '';
        if (req.file) {
            finalResumeUrl = `/uploads/resumes/${req.file.filename}`;
        }

        const tutor = await PeerTutor.create({
            tutor: req.user.id,
            subject,
            topics: Array.isArray(topics) ? topics : (topics || '').split(',').map(t => t.trim()).filter(Boolean),
            description,
            mode: mode || 'online',
            availability,
            experience,
            hourlyRate: Number(hourlyRate) || 0,
            languages: Array.isArray(languages) ? languages : (languages || '').split(',').map(l => l.trim()).filter(Boolean),
            skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(s => s.trim()).filter(Boolean),
            education,
            workExperience,
            certifications,
            resumeUrl: finalResumeUrl,
            linkedinUrl,
            githubUrl,
            portfolioUrl,
        });

        res.status(201).json({ success: true, data: tutor });
    } catch (error) {
        console.error('[registerTutor]', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Get my own tutor profile ───────────────────────────────────────────
// @route GET /api/tutoring/my-profile
// @access Private
exports.getMyProfile = async (req, res) => {
    try {
        const profile = await PeerTutor.findOne({ tutor: req.user.id })
            .populate('tutor', 'name avatar college course year')
            .populate('requests.student', 'name avatar college');
        if (!profile) return res.status(404).json({ success: false, message: 'No tutor profile found', data: null });
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Update tutor profile ───────────────────────────────────────────────
// @route PUT /api/tutoring/my-profile
// @access Private
exports.updateMyProfile = async (req, res) => {
    try {
        const profile = await PeerTutor.findOne({ tutor: req.user.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found. Register first.' });

        const fields = [
            'subject', 'description', 'mode', 'availability',
            'experience', 'hourlyRate', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'isActive'
        ];
        fields.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });

        if (req.body.topics) {
            profile.topics = Array.isArray(req.body.topics)
                ? req.body.topics
                : req.body.topics.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (req.body.languages) {
            profile.languages = Array.isArray(req.body.languages)
                ? req.body.languages
                : req.body.languages.split(',').map(l => l.trim()).filter(Boolean);
        }
        if (req.body.skills) {
            profile.skills = Array.isArray(req.body.skills)
                ? req.body.skills
                : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const edu = parseJSON(req.body.education);
        if (edu) profile.education = edu;
        const we = parseJSON(req.body.workExperience);
        if (we) profile.workExperience = we;
        const certs = parseJSON(req.body.certifications);
        if (certs) profile.certifications = certs;

        if (req.file) {
            // Remove old file if it was a local upload
            if (profile.resumeUrl && profile.resumeUrl.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', profile.resumeUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            profile.resumeUrl = `/uploads/resumes/${req.file.filename}`;
        } else if (req.body.resumeUrl !== undefined) {
            profile.resumeUrl = req.body.resumeUrl;
        }

        await profile.save();
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('[updateMyProfile]', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Get all active tutors ──────────────────────────────────────────────
// @route GET /api/tutoring/tutors
// @access Private
exports.getTutors = async (req, res) => {
    try {
        const { subject, mode, search, minRating } = req.query;
        const filter = { isActive: true };
        if (subject && subject !== 'All') filter.subject = subject;
        if (mode && mode !== 'All') filter.mode = mode.toLowerCase();
        if (minRating) filter.rating = { $gte: Number(minRating) };

        let tutors = await PeerTutor.find(filter)
            .populate('tutor', 'name avatar college course year')
            .sort({ rating: -1, totalSessions: -1 });

        if (search) {
            const q = search.toLowerCase();
            tutors = tutors.filter(t =>
                t.tutor?.name?.toLowerCase().includes(q) ||
                t.subject?.toLowerCase().includes(q) ||
                t.topics?.some(tp => tp.toLowerCase().includes(q))
            );
        }

        res.status(200).json({ success: true, count: tutors.length, data: tutors });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Get a single tutor by ID ───────────────────────────────────────────
// @route GET /api/tutoring/tutors/:id
// @access Private
exports.getTutorById = async (req, res) => {
    try {
        const tutor = await PeerTutor.findById(req.params.id)
            .populate('tutor', 'name avatar college course year bio')
            .populate('reviews.reviewer', 'name avatar');
        if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });
        res.status(200).json({ success: true, data: tutor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Submit a request for a session ─────────────────────────────────────
// @route POST /api/tutoring/request/:tutorId
// @access Private
exports.requestSession = async (req, res) => {
    try {
        const tutor = await PeerTutor.findById(req.params.tutorId);
        if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

        // Prevent self-request
        if (tutor.tutor.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot request yourself.' });
        }

        // Check if student already has a pending request
        const existing = tutor.requests.find(
            r => r.student.toString() === req.user.id && r.status === 'pending'
        );
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have a pending request with this tutor.' });
        }

        tutor.requests.push({
            student: req.user.id,
            message: req.body.message || '',
            subject: req.body.subject || tutor.subject,
            preferredTime: req.body.preferredTime || '',
        });

        await tutor.save();
        res.status(200).json({ success: true, message: 'Request sent successfully!' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Get all my outgoing requests (as student) ──────────────────────────
// @route GET /api/tutoring/my-requests
// @access Private
exports.getMyRequests = async (req, res) => {
    try {
        // Find all tutor profiles that have a request from this user
        const tutors = await PeerTutor.find({ 'requests.student': req.user.id })
            .populate('tutor', 'name avatar college')
            .populate('requests.student', 'name avatar');

        const myRequests = [];
        tutors.forEach(t => {
            t.requests.forEach(r => {
                if (r.student._id?.toString() === req.user.id || r.student?.toString() === req.user.id) {
                    myRequests.push({
                        requestId: r._id,
                        tutorProfileId: t._id,
                        tutor: t.tutor,
                        subject: r.subject || t.subject,
                        message: r.message,
                        preferredTime: r.preferredTime,
                        status: r.status,
                        tutorNote: r.tutorNote,
                        requestedAt: r.requestedAt,
                        respondedAt: r.respondedAt,
                    });
                }
            });
        });

        myRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
        res.status(200).json({ success: true, data: myRequests });
    } catch (error) {
        console.error('[getMyRequests]', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Accept or reject a request (tutor only) ───────────────────────────
// @route PUT /api/tutoring/request/:tutorId/:requestId
// @access Private
exports.respondToRequest = async (req, res) => {
    try {
        const tutor = await PeerTutor.findById(req.params.tutorId);
        if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

        if (tutor.tutor.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the tutor can respond to requests.' });
        }

        const request = tutor.requests.id(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        const { status, tutorNote } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
        }

        request.status = status;
        request.tutorNote = tutorNote || '';
        request.respondedAt = new Date();

        if (status === 'accepted') {
            tutor.totalSessions += 1;
        }

        await tutor.save();
        res.status(200).json({ success: true, message: `Request ${status}`, data: request });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Leave a review ─────────────────────────────────────────────────────
// @route POST /api/tutoring/review/:tutorId
// @access Private
exports.leaveReview = async (req, res) => {
    try {
        const tutor = await PeerTutor.findById(req.params.tutorId);
        if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

        // Check if already reviewed
        const already = tutor.reviews.find(r => r.reviewer.toString() === req.user.id);
        if (already) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this tutor.' });
        }

        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
        }

        tutor.reviews.push({ reviewer: req.user.id, rating: Number(rating), comment });
        tutor.recalcRating();
        await tutor.save();

        res.status(201).json({ success: true, message: 'Review submitted!', rating: tutor.rating });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ─── @desc  Deactivate / delete tutor profile ─────────────────────────────────
// @route DELETE /api/tutoring/my-profile
// @access Private
exports.deleteMyProfile = async (req, res) => {
    try {
        const profile = await PeerTutor.findOneAndDelete({ tutor: req.user.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.status(200).json({ success: true, message: 'Tutor profile deleted.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
