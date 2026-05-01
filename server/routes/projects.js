const express = require('express')
const router = express.Router()
const { protect, optionalAuth } = require('../middleware/auth')
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  toggleStar, forkProject, toggleWatch,
  addComment, deleteComment,
  getMyProjects, getUserProjects, getTrendingTech,
  addAttachment, deleteAttachment, submitContribution, getMyContributions,
  addTask, updateTask, syncWithGithub
} = require('../controllers/projectController')

// Public routes (optional auth for star state info)
router.get('/', optionalAuth, getProjects)
router.get('/trending-tech', getTrendingTech)
router.get('/my', protect, getMyProjects)
router.get('/my-contributions', protect, getMyContributions)
router.get('/user/:userId', getUserProjects)
router.get('/:id', optionalAuth, getProject)

// Protected routes
router.post('/', protect, createProject)
router.put('/:id', protect, updateProject)
router.delete('/:id', protect, deleteProject)

// Interactions
router.post('/:id/star', protect, toggleStar)
router.post('/:id/fork', protect, forkProject)
router.post('/:id/watch', protect, toggleWatch)
router.post('/:id/sync', protect, syncWithGithub)

// Comments
router.post('/:id/comments', protect, addComment)
router.delete('/:id/comments/:commentId', protect, deleteComment)

// Attachments
router.post('/:id/attachments', protect, addAttachment)
router.delete('/:id/attachments/:attId', protect, deleteAttachment)

// Contributions
router.post('/:id/contributions', protect, submitContribution)

// Roadmap / Tasks
router.post('/:id/tasks', protect, addTask)
router.put('/:id/tasks/:taskId', protect, updateTask)

module.exports = router
