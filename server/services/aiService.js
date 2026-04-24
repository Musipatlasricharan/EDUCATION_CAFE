const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');

// Initialize Gemini API
console.log("🚀 Initializing Gemini AI Service...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key-for-now');

// Model constants
// Model constants with fallback pool
const MODEL_POOL = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-001",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
  "gemini-flash-lite-latest",
  "gemini-2.0-pro-exp-02-05"
];

const getModel = (isPremium = false, isJson = false) => {
  // Use the first model by default. If it fails, the service functions should ideally retry with the next one.
  // For simplicity, we'll keep the first one as default but allow the environment to override.
  const modelName = process.env.PREFERRED_MODEL || MODEL_POOL[0];
  const config = isJson ? { responseMimeType: "application/json" } : {};
  return genAI.getGenerativeModel({ model: modelName, generationConfig: config });
};

/**
 * Intelligent wrapper to handle quota issues by switching models
 */
async function generateWithFallback(prompt, isJson = false, isPremium = false, parts = null) {
  let lastError = null;
  
  for (const modelName of MODEL_POOL) {
    try {
      console.log(`[AI] Attempting generation with ${modelName}...`);
      const config = isJson ? { responseMimeType: "application/json" } : {};
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: config });
      
      let result;
      if (parts) {
        result = await model.generateContent(parts);
      } else {
        result = await model.generateContent(prompt);
      }
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('503')) {
        console.warn(`[AI] Model ${modelName} exhausted or busy. Trying next in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error; // If it's not a quota/busy error, throw immediately
    }
  }
  
  throw lastError || new Error("All models in pool failed.");
}

/**
 * Executes a function with model fallback
 */
async function runWithModelFallback(fn, isPremium = false, isJson = false) {
  let lastError = null;
  for (const modelName of MODEL_POOL) {
    try {
      console.log(`[AI] Attempting action with ${modelName}...`);
      const config = isJson ? { responseMimeType: "application/json" } : {};
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: config });
      return await fn(model);
    } catch (error) {
      lastError = error;
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('503')) {
        console.warn(`[AI] Model ${modelName} exhausted or busy. Trying next in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error("All models in pool failed.");
}




/**
 * Robust JSON parser for AI responses.
 * Handles markdown code blocks and potential extra text.
 */
function parseJsonResponse(text) {
  if (!text) throw new Error('Empty response from AI');
  
  const cleanText = text.trim();
  
  try {
    // Attempt 1: Clean JSON
    return JSON.parse(cleanText);
  } catch (e) {
    // Attempt 2: Markdown block extraction
    const markdownMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch (e2) {
        console.warn("Failed to parse JSON inside markdown block, trying raw extraction...");
      }
    }

    // Attempt 3: Bracket extraction (most robust)
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonCandidate = cleanText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e3) {
        // Attempt 4: Fix common JSON issues
        try {
          const fixed = jsonCandidate
            .replace(/,\s*([\]}])/g, '$1') // dangling commas
            .replace(/([^\\])"\s*\+/g, '$1') // string concatenation
            .replace(/\n/g, ' '); // newlines in strings (risky but sometimes needed)
          return JSON.parse(fixed);
        } catch (e4) {
          console.error("Final JSON parse attempt failed. Candidate:", jsonCandidate);
        }
      }
    }
    
    console.error("AI Response could not be parsed as JSON:", cleanText);
    throw new Error('Could not parse JSON from AI response');
  }
}

/**
 * Split text into chunks to avoid token limits for basic recursive splitting.
 */
function splitTextIntoChunks(text, maxChars = 8000) {
  const chunks = [];
  let currentChunk = '';

  // Very basic splitting by newline or space
  const lines = text.split('\n');
  for (const line of lines) {
    if ((currentChunk.length + line.length) > maxChars) {
      chunks.push(currentChunk);
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk);
  }
  return chunks;
}

/**
 * Summarize PDF text using Gemini
 */
exports.analyzePdfText = async (text, isPremium = false) => {
  try {
    const maxChars = isPremium ? 500000 : 200000;
    let processText = text;

    if (text.length > maxChars) {
      processText = text.substring(0, maxChars);
    }

    const model = getModel(isPremium);


    const prompt = `Act as a research assistant. Analyze the following text and provide a 3-paragraph summary, 5 key takeaways, and a list of all technical terms mentioned. 
    Format your response in clean Markdown.

    Text:
    ${processText}
    `;

    const textResponse = await generateWithFallback(prompt, false, isPremium);
    return textResponse;
  } catch (error) {
    console.error('Error analyzing PDF:', error.message);
    throw new Error('Failed to analyze PDF content');
  }
};

/**
 * Analyze LinkedIn Profile or Career Text
 */
exports.analyzeCareerProfile = async (careerText, isPremium = false) => {
  try {
    const model = getModel(isPremium, true);


    const prompt = `Extract the following information from the provided career profile text:
    - Skills (as a list)
    - Years of Experience (total number or descriptive string)
    - Industry (e.g. Software, Finance, Healthcare)
    
    Structure the response strictly as a JSON object:
    {
      "skills": ["skill1", "skill2"],
      "yearsOfExperience": "...",
      "industry": "..."
    }
    
    Profile Text:
    ${careerText}
    `;

    const textResponse = await generateWithFallback(prompt, true, isPremium);
    console.log("Career Scout Raw Response:", textResponse);
    return parseJsonResponse(textResponse);
  } catch (error) {
    console.error('Error analyzing career profile:', error.message);
    throw new Error('Failed to analyze career profile');
  }
};

/**
 * Search opportunities via Tavily API
 */
exports.searchOpportunities = async (skills, industry) => {
  try {
    if (!process.env.TAVILY_API_KEY) {
       return `*No search API configured.* \n\n**Simulated Search Results based on ${industry}**:
       \n### Jobs
       \n1. [Senior ${industry} Engineer - TechCorp](https://example.com/job1)
       \n2. [${industry} Specialist - Innovate](https://example.com/job2)
       \n3. [${industry} Lead - Global Solutions](https://example.com/job3)
       \n### Internships
       \n1. [Summer Intern - Base](https://example.com/intern1)
       \n2. [Graduate Intern - Base](https://example.com/intern2)
       \n### Upcoming Workshops
       \n1. [${industry} NextGen Webinar 2026](https://example.com/webinar1)
       \n2. [Mastering ${skills[0] || 'Tech'} Workshop](https://example.com/workshop1)`;
    }

    const query = `Find 3 recent job openings, 2 internships, and 2 upcoming workshops or webinars for a professional in ${industry} with skills in ${skills.slice(0,3).join(', ')}. Include specific links.`;

    const response = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "advanced",
      include_answer: true
    });

    return response.data.answer || "No suitable opportunities automatically discovered.";
  } catch (error) {
    console.error('Error searching opportunities:', error.message);
    return "Error occurred while fetching opportunities.";
  }
};

/**
 * Generate Mock Interview Prep Questions
 */
exports.generateInterviewPrep = async (topic, isPremium = false) => {
  try {
    const model = getModel(isPremium);


    const prompt = `Act as an expert technical interviewer. Create a comprehensive mock interview preparation plan for the topic: "${topic}".
    
    Your response MUST be in high-quality Markdown and include:
    # Interview Preparation: ${topic}
    
    ## 🎯 Key Focus Areas
    - 3-5 critical concepts to master.
    
    ## 📚 Fundamental Questions
    1. [Question] - [Brief Answer/Key point]
    2. [Question] - [Brief Answer/Key point]
    3. [Question] - [Brief Answer/Key point]
    
    ## 🧠 Advanced & Scenario-Based Questions
    1. [Scenario] - [How to approach]
    2. [Scenario] - [How to approach]
    3. [Scenario] - [How to approach]
    
    ## 💡 Expert Tips
    - Provide advice on body language, technical communication, and problem-solving strategy.
    
    Ensure the content is technical, professional, and directly useful for ${topic}.
    `;

    const textResponse = await generateWithFallback(prompt, false, isPremium);
    return textResponse;
  } catch (error) {
    console.error('Error generating interview prep:', error.message);
    throw new Error('Failed to generate interview prep items');
  }
};

/**
 * Generate Quiz and Flashcards from text
 */
exports.generateQuizAndCards = async (text, isPremium = false) => {
  try {
    const model = getModel(isPremium, true);


    const maxChars = 50000;
    const processText = text.length > maxChars ? text.substring(0, maxChars) : text;

    const prompt = `Based on the following study material, generate a comprehensive summary, 5 multiple-choice questions (MCQs), and 5 flashcards for active recall.
    
    Return ONLY a JSON object with this structure:
    {
      "summary": "Markdown formatted summary of the core concepts...",
      "quizzes": [
        {
          "question": "The question string",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Why this is correct"
        }
      ],
      "flashcards": [
        {
          "front": "Question/Term",
          "back": "Answer/Definition"
        }
      ]
    }
    
    Study Material:
    ${processText}
    `;

    const textResponse = await generateWithFallback(prompt, true, isPremium);
    return parseJsonResponse(textResponse);
  } catch (error) {
    console.error('Error generating quiz and cards:', error.message);
    return { quizzes: [], flashcards: [] };
  }
};

/**
 * Generate Question Paper using Gemini
 */
exports.generateQuestionPaper = async ({ topic, difficulty, totalMarks }, isPremium = false) => {
  try {
    const model = getModel(isPremium);


    const prompt = `Act as an expert professor. Create a professional question paper for the topic: "${topic}".
    Difficulty Level: ${difficulty}
    Total Marks: ${totalMarks}
    
    The paper should include:
    - Section A: Short answer questions (2 marks each)
    - Section B: Medium answer questions (5 marks each)
    - Section C: Detailed/Case study questions (10 marks each)
    
    Structure the response strictly in Markdown format, ready to be printed. Include a marking scheme at the end.
    `;

    const textResponse = await generateWithFallback(prompt, false, isPremium);
    return textResponse;
  } catch (error) {
    console.error('Error generating question paper:', error.message);
    throw new Error('Failed to generate comprehensive question paper');
  }
};

/**
 * Generate a personalized study roadmap
 */
exports.generateStudyRoadmap = async ({ goal, currentLevel, duration }, isPremium = false) => {
  try {
    const model = getModel(isPremium, true);


    const prompt = `Act as an expert academic counselor. Create a personalized, day-by-day study roadmap for a student.
    
    Goal: ${goal}
    Current Knowledge Level: ${currentLevel}
    Preferred Duration: ${duration} weeks
    
    Return ONLY a JSON object.
    
    JSON Structure:
    {
      "title": "Roadmap Title",
      "phases": [
        {
          "title": "Phase 1: Getting Started",
          "description": "Short overview of this phase",
          "duration": "Days 1-7",
          "tasks": ["Specific Task 1", "Specific Task 2", "Specific Task 3"],
          "resources": [
            { "label": "Comprehensive Tutorial", "type": "video", "url": "https://youtube.com" }
          ]
        }
      ]
    }
    
    Rules:
    - Resource types allowed: 'video', 'reading', 'practice', 'article', 'link', 'book', 'tutorial', 'course', 'exercise', 'other'.
    - Provide at least 3-4 phases for a ${duration} week duration.
    - Tasks must be actionable.
    `;

    const textResponse = await generateWithFallback(prompt, true, isPremium);
    return parseJsonResponse(textResponse);
  } catch (error) {
    console.error('Error generating roadmap:', error.message);
    throw new Error('Failed to generate study roadmap');
  }
};

/**
 * Interactive Interview Chat
 */
exports.continueInterview = async ({ topic, history, userMessage }, isPremium = false) => {
  try {
    return await runWithModelFallback(async (model) => {
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `Act as a professional interviewer for the topic: ${topic}. Start the interview by asking one technical question. Wait for my answer. Then provide feedback and ask the next question. Keep it professional and realistic.` }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I'm ready to begin the mock interview. Let's start with the first question." }],
          },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    }, isPremium);
  } catch (error) {
    console.error('Error in interview chat:', error.message);
    throw new Error('Failed to generate interview response');
  }
};

/**
 * Solve academic doubt (Supports Text and Images)
 */
exports.solveDoubtService = async (doubt, filePath = null, mimeType = "image/jpeg", isPremium = false) => {
  try {
    const model = getModel(isPremium);

    
    let parts = [];
    
    if (filePath) {
      const imageData = fs.readFileSync(filePath);
      const base64Image = imageData.toString('base64');
      
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      });
    }
    
    const prompt = `You are an expert academic tutor. A student has the following question or doubt:
    ${doubt ? `\n\nText Doubt: "${doubt}"` : ""}
    
    If there is an image, analyze it carefully (it might be a math problem, a diagram, or handwritten notes). 
    Please provide a clear, detailed, step-by-step explanation. Use simple language. Include examples if helpful. Format your response in clean, readable Markdown.`;

    parts.push({ text: prompt });

    const textResponse = await generateWithFallback(null, false, isPremium, parts);
    return textResponse;
  } catch (error) {
    console.error('Error solving doubt:', error.message);
    throw error; // Let the controller handle and report the specific error
  }
};

/**
 * Health check for all AI APIs
 */
exports.checkAiHealth = async () => {
    const results = { gemini: { success: false }, tavily: { success: false } };
    
    // Test Gemini
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const res = await model.generateContent("ping");
        results.gemini.success = !!res.response.text();
        results.gemini.model = "gemini-2.5-flash";
    } catch (e) {
        results.gemini.error = e.message;
    }

    // Test Tavily
    try {
        if (!process.env.TAVILY_API_KEY) {
            results.tavily.error = "No API key configured";
        } else {
            const response = await axios.post('https://api.tavily.com/search', {
                api_key: process.env.TAVILY_API_KEY,
                query: "ping",
                search_depth: "basic"
            });
            results.tavily.success = !!response.data;
        }
    } catch (e) {
        results.tavily.error = e.message;
    }

    return results;
};

/**
 * AI Plagiarism & Integrity Checker
 */
exports.checkPlagiarism = async (text, isPremium = false) => {
  try {
    const model = getModel(isPremium, true);
    const processText = text.substring(0, 15000);
    const prompt = `Analyze text for AI generation or plagiarism. Return ONLY JSON.
    {
      "aiProbabilityScore": 85,
      "verdict": "Likely AI-Generated",
      "analysis": "Explanation...",
      "flaggedPhrases": ["phrase 1"]
    }
    
    Text: ${processText}`;
    
    const textResponse = await generateWithFallback(prompt, true, isPremium);
    return parseJsonResponse(textResponse);
  } catch (error) {
    console.error('Plagiarism check error:', error.message);
    throw new Error('Failed to analyze text for integrity.');
  }
};

/**
 * Automated Document Auto-Tagging
 */
exports.autoTagDocument = async (text, isPremium = false) => {
  try {
    const model = getModel(isPremium, true);
    const processText = text.substring(0, 8000);
    const prompt = `Generate metadata tags for this study document. Return ONLY JSON.
    {
      "primaryCategory": "Category",
      "topic": "Topic",
      "difficulty": "Easy/Medium/Hard",
      "tags": ["Tag1", "Tag2"]
    }
    
    Text: ${processText}`;
    
    const textResponse = await generateWithFallback(prompt, true, isPremium);
    return parseJsonResponse(textResponse);
  } catch (error) {
    console.error('Auto-tagging error:', error.message);
    return { primaryCategory: 'General', tags: [] };
  }
};

exports.studyChat = async ({ history, userMessage }, isPremium = false) => {
  try {
    return await runWithModelFallback(async (model) => {
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Act as an expert academic tutor and study buddy. The user is in a study room. Answer their doubts clearly, concisely, and with accurate explanations. Use Markdown for formatting. Do NOT act as an interviewer." }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I am your expert academic tutor. I'm ready to help you with your doubts." }],
          },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    }, isPremium);
  } catch (error) {
    console.error('Error in study chat:', error.message, error.stack);
    throw new Error('Failed to generate study chat response. Please ask again.');
  }
};
