const Note = require('../models/Note');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
    try {
        req.body.owner = req.user.id;
        const note = await Note.create(req.body);
        res.status(201).json({ success: true, data: note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get user's notes
// @route   GET /api/notes
// @access  Private
exports.getMyNotes = async (req, res) => {
    try {
        const notes = await Note.find({
            $or: [
                { owner: req.user.id },
                { collaborators: req.user.id }
            ]
        }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).populate('owner', 'name').populate('collaborators', 'name');
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
        
        // Authorization check
        if (note.owner.toString() !== req.user.id && !note.collaborators.some(c => c._id.toString() === req.user.id) && !note.isPublic) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a note content
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
        
        // Authorization check
        if (note.owner.toString() !== req.user.id && !note.collaborators.some(c => c.toString() === req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        note.content = req.body.content || note.content;
        note.title = req.body.title || note.title;
        note.lastModifiedBy = req.user.id;
        
        await note.save();
        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
