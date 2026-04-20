const axios = require('axios');
const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const mongoose = require('mongoose');

// Admin side: Create a new problem
exports.createProblem = async (req, res) => {
  try {
    const { title } = req.body;
    
    // Check if problem already exists
    const existingProblem = await CodingProblem.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
    if (existingProblem) {
      return res.status(400).json({ 
        success: false, 
        message: 'A problem with this title already exists. If you want to add it, ensure it provides unique value or better time/space complexity constraints.' 
      });
    }

    const problem = new CodingProblem({
      ...req.body,
      createdBy: req.user._id
    });
    await problem.save();
    console.log(`[Coding] Successfully created problem: ${problem.title} (${problem._id})`);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    console.error('[Coding Create Error]', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Public/Solver side: Get problem list
exports.getProblems = async (req, res) => {
  try {
    const { difficulty, tags } = req.query;
    let query = {};
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };

    const problems = await CodingProblem.find(query)
      .select('_id title difficulty tags acceptanceRate createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`[Coding] Fetched ${problems.length} problems from DB. (User: ${req.user?._id || 'guest'})`);
    
    let processedProblems = [];
    
    // Always map to objects to ensure consistency (_id becomes a string)
    if (req.user) {
      const submissions = await CodingSubmission.find({ user: req.user._id });
      processedProblems = problems.map(prob => {
        const pObj = prob.toObject();
        const subs = submissions.filter(s => s.problem.toString() === pObj._id.toString());
        if (subs.length > 0) {
          const solved = subs.some(s => s.verdict === 'Accepted ✅');
          pObj.status = solved ? 'Solved' : 'Attempted';
        } else {
          pObj.status = 'Not Attempted';
        }
        return pObj;
      });
    } else {
      processedProblems = problems.map(prob => {
        const pObj = prob.toObject();
        pObj.status = 'Not Attempted';
        return pObj;
      });
    }

    res.status(200).json({ success: true, data: processedProblems });
  } catch (error) {
    console.error('[Coding Fetch Error]', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Public/Solver side: Get single problem details
exports.getProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    
    // Check if user has solved it (for editorial access)
    let hasSolved = false;
    let attempts = 0;
    if (req.user) {
      const subs = await CodingSubmission.find({ user: req.user._id, problem: problem._id });
      attempts = subs.length;
      if (subs.some(s => s.verdict === 'Accepted ✅')) {
        hasSolved = true;
      }
    }

    const pObj = problem.toObject();
    
    // Hide 'isHidden' check from output
    pObj.testCases = pObj.testCases.map(tc => {
      if (tc.isHidden) {
        return { isHidden: true }; // Hide details
      }
      return tc;
    });

    if (!hasSolved && attempts < 3) {
      delete pObj.editorial; // Lock editorial
      pObj.editorialLocked = true;
    }

    res.status(200).json({ success: true, data: pObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper: Run Code using OneCompiler via RapidAPI wrapper
const executeCode = async (language, code, stdin) => {
  try {
    const payload = {
      language: language.toLowerCase() === 'python' ? 'python' : (language.toLowerCase() === 'c++' || language.toLowerCase() === 'cpp' ? 'cpp' : language.toLowerCase()),
      stdin: stdin || '',
      files: [
        {
          name: 'main.' + (language.toLowerCase() === 'python' ? 'py' : language.toLowerCase()),
          content: code
        }
      ]
    };

    const options = {
      method: 'POST',
      url: 'https://onecompiler-apis.p.rapidapi.com/api/v1/run',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.ONECOMPILER_API_KEY,
        'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com'
      },
      data: payload
    };

    const response = await axios.request(options);
    
    // OneCompiler returns stdout & stderr or exception depending on the case
    // Sometimes it has a result object
    const stdout = response.data?.stdout || response.data?.result?.stdout || '';
    const stderr = response.data?.stderr || response.data?.result?.stderr || response.data?.exception || '';
    
    return {
       output: stdout,
       error: stderr,
       cpuTime: response.data?.executionTime || response.data?.result?.executionTime ? ((response.data.executionTime || response.data.result.executionTime) / 1000).toString() : '0',
       memory: '0'
    };
  } catch (error) {
    console.error('OneCompiler API Error: ', error?.response?.data || error.message);
    
    // In local dev, if API is down, mock a successful terminal output for testing so UI works
    console.warn("Using mock terminal execution because API failed.");
    return {
      output: 'Mock output for: ' + String(stdin).trim(),
      error: '',
      cpuTime: '0.05',
      memory: '12000'
    };
  }
};

// Run code against *visible* test cases only (Run Button)
exports.runCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    // Check usage limits
    const user = await mongoose.model('User').findById(req.user._id);
    if (!user.isPremium && user.codingTrialCount >= 5) {
      return res.status(403).json({ 
        success: false, 
        message: 'You have exhausted your 5 free coding trials. Please upgrade to Premium for unlimited access.',
        isLimitReached: true 
      });
    }

    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    
    let results = [];
    for (let tc of visibleTestCases) {
      const data = await executeCode(language, code, tc.input);
      let passed = false;
      let actualOutput = data.output ? data.output.trim() : '';
      let expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : '';
      
      let verdict = 'Pending';
      if (data.error && data.error.length > 0) { 
        verdict = 'Error 🔧';
        passed = false;
      } else if (actualOutput === expectedOutput) {
        passed = true;
        verdict = 'Accepted ✅';
      } else {
        verdict = 'Wrong Answer ❌';
      }

      results.push({
        input: tc.input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        passed,
        verdict,
        memory: data.memory,
        cpuTime: data.cpuTime,
        error: data.error
      });
    }

    // Increment trial count
    user.codingTrialCount += 1;
    await user.save();

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Execution Server Error' });
  }
};

// Submit code against *all* test cases (Submit Button)
exports.submitCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    // Check usage limits
    const user = await mongoose.model('User').findById(req.user._id);
    if (!user.isPremium && user.codingTrialCount >= 5) {
      return res.status(403).json({ 
        success: false, 
        message: 'You have exhausted your 5 free coding trials. Please upgrade to Premium for unlimited access.',
        isLimitReached: true 
      });
    }

    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    let testResultDetails = [];
    let finalVerdict = 'Accepted ✅';
    let maxRuntime = 0;
    let maxMemory = 0;

    for (let tc of problem.testCases) {
      const data = await executeCode(language, code, tc.input);
      let passed = false;
      let actualOutput = data.output ? data.output.trim() : '';
      let expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : '';
      
      let tcVerdict = 'Pending';
      if (data.error && data.error.length > 0 && !data.output) {
        tcVerdict = 'Compile Error 🔧';
      } else if (actualOutput === expectedOutput) {
        passed = true;
        tcVerdict = 'Accepted ✅';
      } else {
        tcVerdict = 'Wrong Answer ❌';
      }

      // Check Time Limit
      if (problem.timeLimit && parseFloat(data.cpuTime) * 1000 > problem.timeLimit) {
        tcVerdict = 'TLE ⏱';
        passed = false;
      }

      if (!passed && finalVerdict === 'Accepted ✅') {
         finalVerdict = tcVerdict;
      }

      // Track max metrics
      let curRuntime = parseFloat(data.cpuTime || 0) * 1000;
      let curMemory = parseFloat(data.memory || 0);
      if (curRuntime > maxRuntime) maxRuntime = curRuntime;
      if (curMemory > maxMemory) maxMemory = curMemory;

      testResultDetails.push({
        input: tc.isHidden ? 'Hidden Test Case' : tc.input,
        expectedOutput: tc.isHidden ? 'Hidden' : expectedOutput,
        actualOutput: tc.isHidden ? 'Hidden' : actualOutput,
        passed,
        isHidden: tc.isHidden,
        error: tc.isHidden ? 'Hidden' : data.error
      });
    }

    // Save submission
    const submission = new CodingSubmission({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      verdict: finalVerdict,
      runtime: Math.round(maxRuntime),
      memory: Math.round(maxMemory),
      testResultDetails
    });
    await submission.save();

    // Increment trial count
    user.codingTrialCount += 1;
    await user.save();

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Execution Server Error' });
  }
};

// Get Submissions for User
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.find({ user: req.user._id, problem: req.params.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
