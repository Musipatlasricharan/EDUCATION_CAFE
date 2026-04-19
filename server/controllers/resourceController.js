const Resource = require('../models/Resource')
const User = require('../models/User')
const { checkAndAward } = require('../utils/badgeEngine')
const { cloudinary } = require('../config/cloudinary')
const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const { generateQuizAndCards } = require('../services/aiService')

exports.uploadResource = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ success: false, message: req.fileValidationError })
    }
    
    if (!req.file && !req.body.linkUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a file or provide a link' })
    }

    // Check if the user is non-premium and has reached the upload limit
    const user = await User.findById(req.user.id)
    if (user.totalUploads >= 5 && !user.isPremium) {
      return res.status(403).json({ 
        success: false, 
        message: 'Upgrade to membership to upload more resources!',
        redirectUrl: 'https://musipatlasricharan36.mojo.page/join-us' 
      })
    }

    let aiData = { quizzes: [], flashcards: [] };
    
    // If it's a PDF, try to generate questions
    if (req.file && req.file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        const extractedText = data.text;
        
        if (extractedText && extractedText.trim().length > 100) {
          aiData = await generateQuizAndCards(extractedText);
        }
      } catch (err) {
        console.error('Error generating AI content for resource:', err);
      }
    }

    const newResource = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      subject: req.body.subject,
      topic: req.body.topic,
      semester: req.body.semester,
      examType: req.body.examType,
      difficultyLevel: req.body.difficultyLevel,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      college: req.body.college || req.user.college,
      fileUrl: req.file ? `/uploads/resources/${req.file.filename}` : req.body.linkUrl,
      fileSize: req.file ? req.file.size : 0,
      fileName: req.file ? req.file.originalname : req.body.title,
      publicId: req.file ? req.file.filename : null,
      uploadedBy: req.user.id,
      quizzes: aiData.quizzes || [],
      flashcards: aiData.flashcards || []
    }

    const resource = await Resource.create(newResource)

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalUploads: 1, points: 10, reputation: 10 }
    })

    const earned = await checkAndAward(req.user.id, 'Resource')
    if (earned && earned.length > 0) {
      req.app.get('io').to(req.user.id.toString()).emit('badge_earned', earned)
    }

    res.status(201).json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getResources = async (req, res) => {
  try {
    const { search, college, type, subject, semester, sort, page = 1, limit = 12 } = req.query
    let query = {}

    if (search) {
      query.$text = { $search: search }
    }
    if (college) query.college = college
    if (type) query.type = type
    if (subject) query.subject = { $regex: subject, $options: 'i' }
    if (semester) query.semester = semester

    let sortOption = { createdAt: -1 }
    if (sort === 'popular') sortOption = { downloads: -1 }
    if (sort === 'rated') sortOption = { avgRating: -1 }
    if (sort === 'liked') sortOption = { likeCount: -1 }
    if (sort === 'oldest') sortOption = { createdAt: 1 }

    const startIndex = (page - 1) * limit
    const total = await Resource.countDocuments(query)

    const resources = await Resource.find(query)
      .sort(sortOption)
      .skip(startIndex)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name avatar college')

    res.status(200).json({
      success: true,
      count: resources.length,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
      data: resources,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getSingleResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name avatar college')
      .populate('ratings.user', 'name avatar')

    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })

    // Only run the premium check if the user is authenticated
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id)
      if (user && !user.isPremium && (resource.college?.toLowerCase().includes('stanford') || resource.type === 'live')) {
        return res.status(403).json({
          success: false,
          message: 'This is a premium resource! Upgrade to membership.',
          redirectUrl: 'https://musipatlasricharan36.mojo.page/join-us'
        })
      }
    }

    resource.views += 1
    await resource.save({ validateBeforeSave: false })

    res.status(200).json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })

    const user = await User.findById(req.user.id)
    if (!user.isPremium && user.totalDownloads >= 5) {
      return res.status(403).json({
        success: false,
        message: 'Download limit reached! Upgrade to membership.',
        redirectUrl: 'https://musipatlasricharan36.mojo.page/join-us'
      })
    }

    // 1. Increment stats on the resource
    resource.downloads += 1
    await resource.save({ validateBeforeSave: false })

    // 2. Give points/reputation to the UPLOADER
    await User.findByIdAndUpdate(resource.uploadedBy, {
      $inc: { points: 2, reputation: 2 }
    });
    
    // 3. Increment totalDownloads for the DOWNLOADER
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalDownloads: 1 }
    });
    
    // 4. Check for download badges for the DOWNLOADER
    const earned = await checkAndAward(req.user.id, 'Download')
    if (earned && earned.length > 0) {
      req.app.get('io').to(req.user.id.toString()).emit('badge_earned', earned)
    }

    let fileUrl = resource.fileUrl;
    if (fileUrl && fileUrl.startsWith('/uploads')) {
      fileUrl = `${req.protocol}://${req.get('host')}${resource.fileUrl}`
    }
    res.status(200).json({ success: true, fileUrl })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.toggleLike = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })

    const isLiked = resource.likes.includes(req.user.id)
    if (isLiked) {
      resource.likes = resource.likes.filter(id => id.toString() !== req.user.id)
      resource.likeCount -= 1
      await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { totalLikes: -1, points: -1, reputation: -1 } })
    } else {
      resource.likes.push(req.user.id)
      resource.likeCount += 1
      await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { totalLikes: 1, points: 1, reputation: 1 } })
    }

    await resource.save({ validateBeforeSave: false })
    res.status(200).json({ success: true, count: resource.likeCount, data: resource.likes })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.rateResource = async (req, res) => {
  try {
    const { value, review } = req.body
    const resource = await Resource.findById(req.params.id)

    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })

    const existingRating = resource.ratings.find(r => r.user.toString() === req.user.id)
    if (existingRating) {
      existingRating.value = value
      existingRating.review = review
    } else {
      resource.ratings.push({ user: req.user.id, value, review })
      resource.ratingCount += 1
    }

    resource.avgRating = resource.ratings.reduce((acc, item) => item.value + acc, 0) / resource.ratings.length
    await resource.save({ validateBeforeSave: false })

    res.status(200).json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })

    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    if (resource.publicId) {
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(__dirname, '..', 'uploads', 'resources', resource.publicId)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    
    await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { totalUploads: -1 } })
    await resource.deleteOne()

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.reportResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })

    resource.isReported = true
    resource.reports.push({ user: req.user.id, reason: req.body.reason })
    await resource.save({ validateBeforeSave: false })

    res.status(200).json({ success: true, message: 'Resource reported' })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.verifyResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true })
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' })
    res.status(200).json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: resources.length, data: resources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getTrendingResources = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const resources = await Resource.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ downloads: -1, likeCount: -1 })
      .limit(8)
      .populate('uploadedBy', 'name avatar')
    res.status(200).json({ success: true, data: resources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.bookmarkResource = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const isBookmarked = user.savedResources.includes(req.params.id)
    
    if (isBookmarked) {
      user.savedResources = user.savedResources.filter(id => id.toString() !== req.params.id)
    } else {
      user.savedResources.push(req.params.id)
    }
    
    await user.save({ validateBeforeSave: false })
    res.status(200).json({ success: true, data: user.savedResources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getRecommendations = async (req, res) => {
  try {
    const AgentHistory = require('../models/AgentHistory');
    const lastInteraction = await AgentHistory.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    
    let query = {};
    if (lastInteraction && lastInteraction.inputText) {
      // Use the last AI interaction as a semantic hint
      const keyword = lastInteraction.inputText.split(' ').slice(0, 2).join(' ');
      query = { $or: [{ subject: { $regex: keyword, $options: 'i' } }, { topic: { $regex: keyword, $options: 'i' } }] };
    } else {
      // Fallback: Recommend popular if no history
      query = { downloads: { $gt: 5 } };
    }

    const resources = await Resource.find(query)
      .limit(4)
      .populate('uploadedBy', 'name avatar');

    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
