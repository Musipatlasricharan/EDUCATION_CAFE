const User = require('../models/User')
const Collection = require('../models/Collection')
const Resource = require('../models/Resource')
const AgentHistory = require('../models/AgentHistory')
const Roadmap = require('../models/Roadmap')
const { verifyGithub, verifyLeetcode } = require('../services/verificationService');

exports.uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body
    if (!avatar) return res.status(400).json({ success: false, message: 'No avatar provided' })
    // avatar is expected to be a base64 data URL (e.g. data:image/png;base64,...)
    const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true })
    res.status(200).json({ success: true, data: { avatar: user.avatar } })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id)
    res.status(200).json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('badges')
      .select('-email -role')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, bio, college, course, year } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar, bio, college, course, year },
      { new: true, runValidators: true }
    )
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('badges').populate('groups', 'name');

    // AI Agent usage stats
    const aiHistory = await AgentHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const aiUsageByType = {
      PDF_SUMMARIZER: aiHistory.filter(h => h.agentType === 'PDF_SUMMARIZER').length,
      CAREER_SCOUT: aiHistory.filter(h => h.agentType === 'CAREER_SCOUT').length,
      INTERVIEW_PREP: aiHistory.filter(h => h.agentType === 'INTERVIEW_PREP').length,
    };

    const totalAiUsage = aiHistory.length;

    // Last 7 days AI activity (for sparkline)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAiActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = aiHistory.filter(h => {
        const hd = new Date(h.createdAt);
        return hd.toDateString() === d.toDateString();
      }).length;
      recentAiActivity.push({ day: dayStr, count });
    }

    // Roadmap stats
    const roadmaps = await Roadmap.find({ user: userId }).lean();
    const roadmapCount = roadmaps.length;
    const activeRoadmaps = roadmaps.filter(r => r.status === 'active').length;
    const completedRoadmaps = roadmaps.filter(r => r.status === 'completed').length;

    // Resources by subject (for pie chart)
    const userResources = await Resource.find({ uploadedBy: userId }).lean();
    // Resource distribution
    const subjectCounts = {};
    userResources.forEach(r => {
      const sub = r.subject || 'Other';
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });
    const resourcesBySubject = Object.entries(subjectCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Coding challenge stats
    const CodingSubmission = require('../models/CodingSubmission');
    const codingSubmissions = await CodingSubmission.find({ user: userId }).populate('problem');
    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const solvedProblems = new Set();
    const tagCounts = {};

    codingSubmissions.forEach(s => {
      if (s.verdict === 'Accepted ✅' && s.problem && !solvedProblems.has(s.problem._id.toString())) {
        solvedProblems.add(s.problem._id.toString());
        solvedByDifficulty[s.problem.difficulty] = (solvedByDifficulty[s.problem.difficulty] || 0) + 1;
        if (s.problem.tags) {
          s.problem.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    const codingStats = {
      totalSolved: solvedProblems.size,
      solvedByDifficulty,
      solvedByTags: Object.entries(tagCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      codingTrialCount: user.codingTrialCount
    };

    // Groups
    const groupsJoined = (user.groups || []).length;

    // Collections
    const collections = await Collection.find({ owner: userId }).lean();

    // Most recent AI interaction
    const lastAiInteraction = aiHistory[0]?.createdAt || null;

    res.status(200).json({
      success: true,
      data: {
        totalUploads: user.totalUploads,
        totalDownloads: user.totalDownloads,
        totalLikes: user.totalLikes,
        points: user.points,
        reputation: user.reputation,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badges: user.badges,
        isPremium: user.isPremium,
        dailyDownloadsUsed: user.dailyDownloadsUsed,
        groupsJoined,
        collectionsCount: collections.length,
        savedResourcesCount: user.savedResources?.length || 0,
        discussionWins: user.discussionWins || 0,
        verifiedSkills: user.verifiedSkills || [],
        // AI stats
        totalAiUsage,
        aiUsageByType,
        recentAiActivity,
        lastAiInteraction,
        // Roadmap stats
        roadmapCount,
        activeRoadmaps,
        completedRoadmaps,
        // Resource distribution
        resourcesBySubject,
        // Coding stats
        codingStats
      }
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.createCollection = async (req, res) => {
  try {
    req.body.owner = req.user.id
    const collection = await Collection.create(req.body)
    await User.findByIdAndUpdate(req.user.id, { $push: { collections: collection._id } })
    res.status(201).json({ success: true, data: collection })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user.id }).populate('resources')
    res.status(200).json({ success: true, count: collections.length, data: collections })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.saveToCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $addToSet: { resources: req.body.resourceId } },
      { new: true }
    )
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' })
    res.status(200).json({ success: true, data: collection })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.bookmarkResource = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const isBookmarked = user.savedResources.includes(req.params.resourceId)

    if (isBookmarked) {
      user.savedResources = user.savedResources.filter(id => id.toString() !== req.params.resourceId)
    } else {
      user.savedResources.push(req.params.resourceId)
    }
    
    await user.save({ validateBeforeSave: false })
    res.status(200).json({ success: true, data: user.savedResources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedResources')
    res.status(200).json({ success: true, count: user.savedResources.length, data: user.savedResources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getUserResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.params.userId })
    res.status(200).json({ success: true, count: resources.length, data: resources })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.verifyGithubAccount = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username required' });
    
    const verification = await verifyGithub(username);
    if (!verification.success) return res.status(404).json({ success: false, message: verification.message });
    
    await User.findByIdAndUpdate(req.user.id, { githubUsername: username });
    res.status(200).json({ success: true, data: verification.stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.verifyLeetcodeAccount = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username required' });
    
    const verification = await verifyLeetcode(username);
    if (!verification.success) return res.status(404).json({ success: false, message: verification.message });
    
    await User.findByIdAndUpdate(req.user.id, { leetcodeUsername: username });
    res.status(200).json({ success: true, data: verification.stats });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
