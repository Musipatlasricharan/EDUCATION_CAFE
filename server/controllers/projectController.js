const Project = require('../models/Project')
const User = require('../models/User')
const mongoose = require('mongoose')

// Helper: check if user starred
const hasStarred = (project, userId) =>
  project.stars.some(id => id.toString() === userId.toString())

// ─── GET ALL PROJECTS (Browse / Explore) ────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const {
      search = '',
      tech = '',
      tag = '',
      sort = 'newest',
      page = 1,
      limit = 12,
      college = ''
    } = req.query

    const filter = { isPublic: true }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } }
      ]
    }
    if (tech) filter.techStack = { $regex: tech, $options: 'i' }
    if (tag) filter.tags = { $regex: tag, $options: 'i' }
    if (college) filter.college = { $regex: college, $options: 'i' }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      stars: { 'stars': -1 },
      views: { views: -1 },
      forks: { 'forks': -1 }
    }
    const sortOpt = sortMap[sort] || { createdAt: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name avatar college')
        .populate('collaborators', 'name avatar')
        .sort(sortOpt)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-readme -comments'),
      Project.countDocuments(filter)
    ])

    res.json({
      success: true,
      projects,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── GET SINGLE PROJECT ──────────────────────────────────────────────────────
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar college course year bio')
      .populate('collaborators', 'name avatar college')
      .populate('comments.user', 'name avatar')
      .populate('contributions.user', 'name avatar')
      .populate('forkedFrom', 'title owner')

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (!project.isPublic && project.owner._id.toString() !== req.user?.id)
      return res.status(403).json({ success: false, message: 'This project is private' })

    // Increment view count (don't await - fire and forget)
    Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec()

    res.json({ success: true, project })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── CREATE PROJECT ──────────────────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const { 
      title, description, readme, repoUrl, demoUrl, techStack, tags, 
      isPublic, screenshots, status, projectType, institution, paperDoi,
      acceptingContributions
    } = req.body

    const user = await User.findById(req.user.id)

    const project = await Project.create({
      title,
      description,
      readme: readme || '',
      owner: req.user.id,
      repoUrl: repoUrl || '',
      demoUrl: demoUrl || '',
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(t => t.trim()) : []),
      tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase().trim()) : (tags ? tags.split(',').map(t => t.toLowerCase().trim()) : []),
      isPublic: isPublic !== false,
      screenshots: screenshots || [],
      status: status || 'active',
      projectType: projectType || 'project',
      institution: institution || '',
      paperDoi: paperDoi || '',
      acceptingContributions: acceptingContributions !== false,
      college: user?.college || ''
    })

    await project.populate('owner', 'name avatar college')

    res.status(201).json({ success: true, project })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// ─── UPDATE PROJECT ──────────────────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })

    const { title, description, readme, repoUrl, demoUrl, techStack, tags, isPublic, screenshots, status } = req.body

    if (title !== undefined) project.title = title
    if (description !== undefined) project.description = description
    if (readme !== undefined) project.readme = readme
    if (repoUrl !== undefined) project.repoUrl = repoUrl
    if (demoUrl !== undefined) project.demoUrl = demoUrl
    if (isPublic !== undefined) project.isPublic = isPublic
    if (status !== undefined) project.status = status
    if (screenshots !== undefined) project.screenshots = screenshots

    if (techStack !== undefined)
      project.techStack = Array.isArray(techStack) ? techStack : techStack.split(',').map(t => t.trim())
    if (tags !== undefined)
      project.tags = Array.isArray(tags) ? tags.map(t => t.toLowerCase().trim()) : tags.split(',').map(t => t.toLowerCase().trim())

    await project.save()
    await project.populate('owner', 'name avatar college')

    res.json({ success: true, project })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// ─── DELETE PROJECT ──────────────────────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })

    await project.deleteOne()
    res.json({ success: true, message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── STAR / UNSTAR ───────────────────────────────────────────────────────────
exports.toggleStar = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

    const userId = req.user.id
    const idx = project.stars.findIndex(id => id.toString() === userId)

    if (idx > -1) {
      project.stars.splice(idx, 1)
    } else {
      project.stars.push(userId)
    }

    await project.save()
    res.json({ success: true, starred: idx === -1, starCount: project.stars.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── FORK PROJECT ────────────────────────────────────────────────────────────
exports.forkProject = async (req, res) => {
  try {
    const original = await Project.findById(req.params.id).populate('owner', 'name')
    if (!original) return res.status(404).json({ success: false, message: 'Project not found' })
    if (original.owner._id.toString() === req.user.id)
      return res.status(400).json({ success: false, message: 'Cannot fork your own project' })

    const user = await User.findById(req.user.id)

    // Record the fork on original
    if (!original.forks.includes(req.user.id)) {
      original.forks.push(req.user.id)
      await original.save()
    }

    // Create forked copy
    const forked = await Project.create({
      title: original.title,
      description: original.description,
      readme: original.readme,
      owner: req.user.id,
      repoUrl: original.repoUrl,
      demoUrl: '',
      techStack: [...original.techStack],
      tags: [...original.tags],
      isPublic: true,
      screenshots: [...original.screenshots],
      status: 'active',
      college: user?.college || '',
      forkedFrom: original._id
    })

    await forked.populate('owner', 'name avatar college')
    await forked.populate('forkedFrom', 'title owner')

    res.status(201).json({ success: true, project: forked })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── WATCH / UNWATCH ─────────────────────────────────────────────────────────
exports.toggleWatch = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

    const userId = req.user.id
    const idx = project.watchers.findIndex(id => id.toString() === userId)

    if (idx > -1) {
      project.watchers.splice(idx, 1)
    } else {
      project.watchers.push(userId)
    }

    await project.save()
    res.json({ success: true, watching: idx === -1, watcherCount: project.watchers.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ success: false, message: 'Comment content required' })

    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

    project.comments.push({ user: req.user.id, content })
    await project.save()
    await project.populate('comments.user', 'name avatar')

    const newComment = project.comments[project.comments.length - 1]
    res.status(201).json({ success: true, comment: newComment })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── DELETE COMMENT ──────────────────────────────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

    const comment = project.comments.id(req.params.commentId)
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' })

    if (comment.user.toString() !== req.user.id && project.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })

    comment.deleteOne()
    await project.save()

    res.json({ success: true, message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── MY PROJECTS ─────────────────────────────────────────────────────────────
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate('owner', 'name avatar college')
      .sort({ createdAt: -1 })
      .select('-readme -comments')

    res.json({ success: true, projects })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── USER PROJECTS (public) ──────────────────────────────────────────────────
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.params.userId, isPublic: true })
      .populate('owner', 'name avatar college')
      .sort({ createdAt: -1 })
      .select('-readme -comments')

    res.json({ success: true, projects })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── TRENDING TECH TAGS ──────────────────────────────────────────────────────
exports.getTrendingTech = async (req, res) => {
  try {
    const result = await Project.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$techStack' },
      { $group: { _id: '$techStack', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])
    res.json({ success: true, tech: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── MY CONTRIBUTIONS ────────────────────────────────────────────────────────
exports.getMyContributions = async (req, res) => {
  try {
    // Find projects where the user has submitted a contribution
    const projects = await Project.find({ 'contributions.user': req.user.id })
      .populate('owner', 'name avatar college')
      .select('title owner description contributions updatedAt')

    // Filter out only the relevant contributions for the user if needed, 
    // but usually, we just show the projects they contributed to.
    res.json({ success: true, contributions: projects })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ATTACHMENTS ─────────────────────────────────────────────────────────────
exports.addAttachment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })

    const { name, url, fileType, size } = req.body
    
    project.attachments.push({ name, url, fileType, size })
    await project.save()
    
    res.json({ success: true, attachment: project.attachments[project.attachments.length - 1] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.deleteAttachment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' })

    project.attachments = project.attachments.filter(a => a._id.toString() !== req.params.attId)
    await project.save()
    
    res.json({ success: true, message: 'Attachment deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── CONTRIBUTIONS ───────────────────────────────────────────────────────────
exports.submitContribution = async (req, res) => {
  try {
    const { title, description, branch } = req.body
    const project = await Project.findById(req.params.id)
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (!project.acceptingContributions)
      return res.status(400).json({ success: false, message: 'This project is not accepting contributions' })

    project.contributions.push({
      user: req.user.id,
      title,
      description,
      branch: branch || 'main',
      status: 'open'
    })
    
    await project.save()
    await project.populate('contributions.user', 'name avatar')
    
    res.status(201).json({ success: true, contribution: project.contributions[project.contributions.length - 1] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
// ─── GITHUB SYNC ───────────────────────────────────────────────────────────────
exports.syncWithGithub = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (!project.repoUrl || !project.repoUrl.includes('github.com')) {
      return res.status(400).json({ success: false, message: 'No valid GitHub URL connected' })
    }

    // Robust parsing of owner/repo from URL
    const url = project.repoUrl.replace(/\/$/, '') // Remove trailing slash
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) return res.status(400).json({ success: false, message: 'Invalid GitHub URL format' })
    
    const owner = match[1]
    const repo = match[2].split('.git')[0].split('#')[0].split('?')[0]

    const axios = require('axios')
    const config = { headers: { 'User-Agent': 'EduCafe-Innovation-Hub' } }
    
    // 1. Fetch Basic Repo Info
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, config)
    
    // 2. Fetch README (Raw)
    const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      ...config,
      headers: { ...config.headers, 'Accept': 'application/vnd.github.v3.raw' }
    })

    project.readme = readmeRes.data
    if (!project.description) project.description = repoRes.data.description

    await project.save()
    res.json({ success: true, message: 'Synchronized with GitHub', project })
  } catch (err) { 
    const msg = err.response?.status === 404 ? 'Repository not found. Ensure it is Public and the URL is correct.' : (err.response?.data?.message || err.message)
    res.status(500).json({ success: false, message: 'GitHub Sync Failed: ' + msg }) 
  }
}
exports.addTask = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' })

    project.tasks.push({ title: req.body.title })
    await project.save()
    res.status(201).json({ success: true, task: project.tasks[project.tasks.length - 1] })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

exports.updateTask = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' })

    const task = project.tasks.id(req.params.taskId)
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })

    task.status = req.body.status
    await project.save()
    res.json({ success: true, task })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}
