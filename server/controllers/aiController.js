const fs = require('fs');
const pdfParse = require('pdf-parse');
const { analyzePdfText, analyzeCareerProfile, searchOpportunities, generateInterviewPrep, generateStudyRoadmap, continueInterview, generateQuizAndCards: generateQuizService, generateQuestionPaper: generatePaperService, solveDoubtService, checkPlagiarism, autoTagDocument } = require('../services/aiService');
const AgentHistory = require('../models/AgentHistory');
const Roadmap = require('../models/Roadmap');

// Helper to check user limits
const checkUserLimit = async (user) => {
  if (!user) return true; // If no user object, allow (auth middleware handles auth)
  if (user.isPremium) return true; // Premium users have unlimited access
  
  // Allow up to 50 free trials
  return user.aiUsageCount < 50;
};


// Helper to increment usage (resilient to DB failures)
const incrementUsage = async (user) => {
  if (user && !user.isPremium) {
    try {
      user.aiUsageCount += 1;
      await user.save();
    } catch (e) {
      console.warn('[aiController] Could not save usage count (DB may be down):', e.message);
    }
  }
};

// Helper to save agent history (resilient to DB failures)
const saveHistory = async (data) => {
  try {
    await AgentHistory.create(data);
  } catch (e) {
    console.warn('[aiController] Could not save agent history (DB may be down):', e.message);
  }
};


exports.analyzePdf = async (req, res) => {
  let filePath = req.file ? req.file.path : null;
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      if (filePath) fs.unlinkSync(filePath);
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Clean up uploaded temp file early
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      filePath = null; // Mark as unlinked
    }

    const extractedText = data.text;
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'No extractable text found in this PDF.' });
    }

    const summaryMarkdown = await analyzePdfText(extractedText, req.user?.isPremium);
    
    if (!summaryMarkdown) {
      throw new Error('AI could not generate a summary. The document might be too complex or contain sensitive content.');
    }

    // Save history
    if (req.user) {
      await incrementUsage(req.user);
      await saveHistory({
        user: req.user._id,
        agentType: 'PDF_SUMMARIZER',
        inputText: `Uploaded PDF: ${req.file.originalname}`,
        result: summaryMarkdown
      });
    }

    return res.status(200).json({
      success: true,
      summary: summaryMarkdown
    });

  } catch (error) {
    console.error('API /analyze-pdf Error:', error);
    // Ensure file is cleaned up on error
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    return res.status(500).json({ success: false, message: error.message || 'Server Error analyzing PDF' });
  }
};

exports.careerScout = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });

    }

    const { careerText } = req.body;
    
    if (!careerText) {
      return res.status(400).json({ success: false, message: 'Please provide career text or LinkedIn profile content' });
    }

    // Step 1: Extract Skills, Industry, Experience
    const profileData = await analyzeCareerProfile(careerText, req.user?.isPremium);
    
    if (!profileData) {
      throw new Error('AI could not extract profile details. Please check your text.');
    }

    // Step 2: Deep Research via Search API
    const opportunitiesMarkdown = await searchOpportunities(
      profileData.skills || [], 
      profileData.industry || profileData.Industry || 'Tech'
    );

    // Step 3: Compile Report
    const reportMarkdown = `
## Career Scout Report
**Industry:** ${profileData.industry}
**Years of Experience:** ${profileData.yearsOfExperience}

**Identified Skills:** 
${profileData.skills ? profileData.skills.map(s => '- ' + s).join('\n') : 'None'}

## Opportunities & Deep Research
${opportunitiesMarkdown}
    `;

    // Save history
    if (req.user) {
      await incrementUsage(req.user);
      await saveHistory({
        user: req.user._id,
        agentType: 'CAREER_SCOUT',
        inputText: careerText.substring(0, 500) + (careerText.length > 500 ? '...' : ''), // truncate
        result: reportMarkdown,
        metadata: profileData
      });
    }

    return res.status(200).json({
      success: true,
      report: reportMarkdown,
      rawProfileData: profileData
    });
    
  } catch (error) {
    console.error('API /career-scout Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error scouting career' });
  }
};

exports.interviewPrep = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }

    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Please provide an interview topic' });
    }

    const reportMarkdown = await generateInterviewPrep(topic, req.user?.isPremium);

    if (!reportMarkdown) {
       throw new Error('AI failed to generate interview prep material.');
    }

    if (req.user) {
      await incrementUsage(req.user);
      await saveHistory({
        user: req.user._id,
        agentType: 'INTERVIEW_PREP',
        inputText: topic,
        result: reportMarkdown
      });
    }

    return res.status(200).json({
      success: true,
      report: reportMarkdown
    });
  } catch (error) {
    console.error('API /interview-prep Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error generating interview prep' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let history = [];
    try {
      history = await AgentHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    } catch (dbErr) {
      console.warn('Could not fetch history from DB:', dbErr.message);
    }
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('API /get-history Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching history' });
  }
};

exports.getTypedHistory = async (req, res) => {
  try {
    const { agentType, groupId } = req.query;
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    let query = { agentType };
    
    if (groupId) {
      query.groupId = groupId;
    } else {
      query.user = req.user._id;
    }

    const history = await AgentHistory.find(query).sort({ createdAt: 1 }).limit(50);
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('API /get-typed-history Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching typed history' });
  }
};

exports.generateRoadmap = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }
    const { goal, currentLevel, duration } = req.body;
    
    if (!goal || !currentLevel || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide goal, level and duration' });
    }

    const roadmapData = await generateStudyRoadmap({ goal, currentLevel, duration }, req.user?.isPremium);
    
    if (!roadmapData || !roadmapData.title || !roadmapData.phases) {
      throw new Error('AI generated an invalid roadmap structure. Please try again with a different goal.');
    }

    let roadmap = null;
    try {
      roadmap = await Roadmap.create({
        user: req.user._id,
        goal,
        currentLevel,
        durationInWeeks: duration,
        title: roadmapData.title,
        phases: roadmapData.phases
      });
    } catch (dbErr) {
      console.warn('Could not save roadmap to DB:', dbErr.message);
      // Fallback: return the data directly since we couldn't save
      roadmap = { ...roadmapData, _id: 'temp_' + Date.now(), createdAt: new Date() };
    }
    
    await incrementUsage(req.user);

    // Also save to Agent History for unified view
    await saveHistory({
      user: req.user._id,
      agentType: 'ROADMAP',
      inputText: `Goal: ${goal} (${duration} weeks)`,
      result: JSON.stringify(roadmapData)
    });

    return res.status(201).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('API /generate-roadmap Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error generating roadmap' });
  }
};

exports.getRoadmaps = async (req, res) => {
  try {
    let roadmaps = [];
    try {
      roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
    } catch (dbErr) {
      console.warn('Could not fetch roadmaps from DB:', dbErr.message);
    }
    return res.status(200).json({ success: true, data: roadmaps });
  } catch (error) {
    console.error('API /get-roadmaps Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching roadmaps' });
  }
};

exports.interactiveInterview = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }
    const { topic, history, userMessage } = req.body;
    
    if (!topic || !userMessage) {
      return res.status(400).json({ success: false, message: 'Please provide topic and message' });
    }

    const aiMessage = await continueInterview({ 
      topic, 
      history: history || [], 
      userMessage 
    }, req.user?.isPremium);

    // Save interactive interactions to history
    await saveHistory({
      user: req.user._id,
      agentType: 'INTERVIEW_SESSION',
      inputText: userMessage,
      result: aiMessage,
      metadata: { topic, sessionLength: (history?.length || 0) + 1, senderName: req.user.name }
    });

    await incrementUsage(req.user);

    return res.status(200).json({
      success: true,
      data: aiMessage
    });
  } catch (error) {
    console.error('API /interactive-interview Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error in interview' });
  }
};
exports.generateQuizAndCards = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Please provide text' });
    
    const data = await generateQuizService(text, req.user?.isPremium);
    
    if (!data || !data.quizzes || !data.flashcards) {
       throw new Error('AI failed to generate study materials (quizzes/flashcards).');
    }
    
    await saveHistory({
      user: req.user._id,
      agentType: 'FLASHCARDS',
      inputText: text.substring(0, 500),
      result: JSON.stringify(data)
    });

    await incrementUsage(req.user);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateQuestionPaper = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }
    const { topic, difficulty, totalMarks } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: 'Please provide topic' });
    
    const paper = await generatePaperService({ topic, difficulty, totalMarks }, req.user?.isPremium);
    
    if (!paper) {
      throw new Error('AI failed to generate a question paper.');
    }

    await saveHistory({
      user: req.user._id,
      agentType: 'QUESTION_PAPER',
      inputText: `Topic: ${topic}, Difficulty: ${difficulty}, Marks: ${totalMarks}`,
      result: paper
    });

    await incrementUsage(req.user);

    res.status(200).json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.solveDoubt = async (req, res) => {
  let filePath = req.file ? req.file.path : null;
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      if (filePath) try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }

    const { doubt } = req.body;
    if (!doubt && !req.file) {
      return res.status(400).json({ success: false, message: 'Please provide your doubt as text or upload an image.' });
    }

    const answer = await solveDoubtService(doubt, filePath, req.file ? req.file.mimetype : "image/jpeg", req.user?.isPremium);

    // Save history
    if (req.user) {
      await incrementUsage(req.user);
      await saveHistory({
        user: req.user._id,
        agentType: 'DOUBT_SOLVER',
        inputText: doubt || (req.file ? `Image: ${req.file.originalname}` : 'Visual Doubt'),
        result: answer
      });
    }

    // Cleanup
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    res.status(200).json({ success: true, data: answer });
  } catch (error) {
    console.error('API /solve-doubt Error:', error);
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    res.status(500).json({ success: false, message: error.message || 'Server Error solving doubt' });
  }
};

exports.getLearningPulse = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch data for analytics safely
    let history = [];
    let notesCount = 0;
    let recentActivityCount = 0;
    
    try {
      history = await AgentHistory.find({ user: userId });
      const Note = require('../models/Note');
      notesCount = await Note.countDocuments({ user: userId });
      
      recentActivityCount = await AgentHistory.countDocuments({ 
        user: userId, 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      });
    } catch (dbErr) {
      console.warn('Learning Pulse DB fetch failed:', dbErr.message);
    }
    
    const isBurnoutRisk = recentActivityCount > 15;

    res.status(200).json({
      success: true,
      data: {
        score: finalScore,
        advice,
        isBurnoutRisk,
        stats: {
          aiInteractions: history.length,
          notesTaken: notesCount,
          recentActivity: recentActivityCount
        }
      }
    });

  } catch (error) {
    console.error('getLearningPulse Error:', error);
    res.status(500).json({ success: false, message: 'Pulse analytics error' });
  }
};

exports.getAiStatus = async (req, res) => {
  try {
    const { checkAiHealth } = require('../services/aiService');
    const health = await checkAiHealth();
    res.status(200).json({ success: true, health });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handlePlagiarismCheck = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Limit reached.' });
    if (!req.body.text) return res.status(400).json({ success: false, message: 'Provide text.' });
    
    const data = await checkPlagiarism(req.body.text, req.user?.isPremium);
    await incrementUsage(req.user);
    await saveHistory({ user: req.user._id, agentType: 'PLAGIARISM_CHECKER', inputText: req.body.text.substring(0,200), result: JSON.stringify(data) });
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.handleAutoTagging = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Limit reached.' });
    if (!req.body.text) return res.status(400).json({ success: false, message: 'Provide text.' });
    
    const data = await autoTagDocument(req.body.text, req.user?.isPremium);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.studyRoomChat = async (req, res) => {
  try {
    const hasAccess = await checkUserLimit(req.user);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You have reached your limit of 50 free AI trials. Please upgrade to Premium to continue.' });
    }
    const { history, userMessage, groupId } = req.body;
    
    if (!userMessage) {
      return res.status(400).json({ success: false, message: 'Please provide message' });
    }

    const { studyChat } = require('../services/aiService');
    const aiMessage = await studyChat({ 
      history: history || [], 
      userMessage 
    }, req.user?.isPremium);

    // Save history tied to user and group
    await saveHistory({
      user: req.user._id,
      groupId: groupId || null,
      agentType: 'STUDY_BUDDY',
      inputText: userMessage,
      result: aiMessage,
      metadata: { sessionLength: (history?.length || 0) + 1, senderName: req.user.name }
    });

    await incrementUsage(req.user);

    return res.status(200).json({
      success: true,
      data: aiMessage
    });
  } catch (error) {
    console.error('API /study-chat Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error in study chat' });
  }
};
