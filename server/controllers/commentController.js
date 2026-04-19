const Comment = require('../models/Comment')
const User = require('../models/User')

// GET /api/resources/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ resource: req.params.id, parentComment: null })
      .populate('author', 'name avatar college reputation')
      .sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: comments.length, data: comments })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// POST /api/resources/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' })
    }

    const comment = await Comment.create({
      resource: req.params.id,
      author: req.user.id,
      content: content.trim(),
      parentComment: req.body.parentComment || null
    })

    // Award posting user 1 point for commenting
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 1, reputation: 1 } })

    const populated = await comment.populate('author', 'name avatar college reputation')
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// POST /api/comments/:id/like
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })

    const isLiked = comment.likes.includes(req.user.id)
    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id)
      comment.likeCount -= 1
      // Reduce comment author's reputation
      await User.findByIdAndUpdate(comment.author, { $inc: { reputation: -1, points: -1 } })
    } else {
      comment.likes.push(req.user.id)
      comment.likeCount += 1
      // Boost comment author's reputation
      await User.findByIdAndUpdate(comment.author, { $inc: { reputation: 1, points: 1 } })
    }

    await comment.save({ validateBeforeSave: false })
    res.status(200).json({ success: true, data: { likeCount: comment.likeCount, likes: comment.likes } })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await comment.deleteOne()
    res.status(200).json({ success: true, data: {} })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}
