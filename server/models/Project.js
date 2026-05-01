const mongoose = require('mongoose')

const projectCommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
})

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  readme: { type: String, default: '' }, // Full markdown readme
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Visibility
  isPublic: { type: Boolean, default: true },

  // Links
  repoUrl: { type: String, default: '' },   // External GitHub URL (optional)
  demoUrl: { type: String, default: '' },   // Live demo URL

  // Tech Stack
  techStack: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true, lowercase: true }],

  // GitHub-like metrics
  stars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  forks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },

  // Research/Academic Info
  projectType: { type: String, default: 'project' }, // 'research-paper', 'dataset', etc.
  institution: { type: String, default: '' },
  paperDoi: { type: String, default: '' },

  // Files / Screenshots
  screenshots: [{ type: String }], // Cloudinary URLs
  attachments: [{
    name: String,
    url: String,
    fileType: String,
    size: Number,
    createdAt: { type: Date, default: Date.now }
  }],

  // Contributions (Pull Requests)
  contributions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    branch: String,
    status: { type: String, enum: ['open', 'merged', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Comments
  comments: [projectCommentSchema],

  // Roadmap / Tasks
  tasks: [{
    title: String,
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'wip'],
    default: 'active'
  },

  acceptingContributions: { type: Boolean, default: true },
  college: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true })

// Virtual for star count
projectSchema.virtual('starCount').get(function () {
  return this.stars.length
})

projectSchema.virtual('forkCount').get(function () {
  return this.forks.length
})

projectSchema.virtual('healthScore').get(function () {
  let score = 0
  if (this.readme && this.readme.length > 500) score += 40
  if (this.stars?.length > 5) score += 20
  if (this.isVerified) score += 20
  if (this.techStack?.length > 2) score += 20
  return score
})

projectSchema.virtual('apaCitation').get(function () {
  const year = new Date(this.createdAt).getFullYear()
  return `${this.institution || 'Author'}. (${year}). ${this.title}. Student Dev Hub.`
})

projectSchema.set('toJSON', { virtuals: true })
projectSchema.set('toObject', { virtuals: true })

// Full-text search index
projectSchema.index({ title: 'text', description: 'text', tags: 'text', techStack: 'text' })

module.exports = mongoose.model('Project', projectSchema)
