const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');

// Initialize Gemini API
console.log("🚀 Initializing Gemini AI Service...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key-for-now');

// Model constants
const FREE_MODEL = "gemini-2.5-flash";
const PREMIUM_MODEL = "gemini-3-pro-preview";

const getModel = (isPremium = false) => {
  return genAI.getGenerativeModel({ model: isPremium ? PREMIUM_MODEL : FREE_MODEL });
};


/**
 * Robust JSON parser for AI responses.
 * Handles markdown code blocks and potential extra text.
 */
function parseJsonResponse(text) {
  try {
    // Attempt 1: Regular JSON parse if it's already a clean string
    return JSON.parse(text);
  } catch (e) {
    // Attempt 2: Extract JSON from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/i);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (e2) {}
    }

    // Attempt 3: Robust Regex to find the first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e3) {
        // Attempt 4: Even more desperate - try to fix common JSON errors (like dangling commas)
        const fixedJson = jsonStr.replace(/,\s*([\]}])/g, '$1');
        try {
          return JSON.parse(fixedJson);
        } catch (e4) {
          console.error("Failed to parse JSON even after all attempts:", e4);
        }
      }
    }
    
    console.error("Full text response that failed parsing:", text);
    // Return a fallback object instead of throwing if possible, or throw a descriptive error
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
    const maxChars = isPremium ? 200000 : 100000;
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
    const model = getModel(isPremium);


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

    const result = await model.generateContent(prompt);
    const textResponse = await result.response.text();
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
    const model = getModel(isPremium);


    const maxChars = 50000;
    const processText = text.length > maxChars ? text.substring(0, maxChars) : text;

    const prompt = `Based on the following study material, generate 5 multiple-choice questions (MCQs) and 5 flashcards for active recall.
    
    The response MUST be ONLY a JSON object. Do not include any text like "Here is the JSON" or markdown formatting outside the JSON block.
    
    JSON Structure:
    {
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

    const result = await model.generateContent(prompt);
    const textResponse = await result.response.text();
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
    const model = getModel(isPremium);


    const prompt = `Act as an expert academic counselor. Create a personalized, day-by-day study roadmap for a student.
    
    Goal: ${goal}
    Current Knowledge Level: ${currentLevel}
    Preferred Duration: ${duration} weeks
    
    The response MUST be ONLY a JSON object. Ensure all strings are valid JSON strings.
    
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

    const result = await model.generateContent(prompt);
    const textResponse = await result.response.text();
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
    const model = getModel(isPremium);


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

    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const res = await model.generateContent("ping");
        results.gemini.success = !!res.response.text();
        results.gemini.model = "gemini-1.5-flash-latest";
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
    const model = getModel(isPremium);
    const processText = text.substring(0, 15000);
    const prompt = `You are an advanced academic integrity detector. Analyze the following text and determine if it was likely generated by an AI (like ChatGPT), copied from the web, or is highly likely human-written. 
    
    Respond STRICTLY in JSON format with no markdown wrappers:
    {
      "aiProbabilityScore": 85, // out of 100
      "verdict": "Likely AI-Generated", // or "Human Written", "Highly Suspicious"
      "analysis": "The text contains repetitive transition words commonly used by LLMs...",
      "flaggedPhrases": ["phrase 1 that sounds robotic"]
    }
    
    Text to analyze:
    ${processText}`;
    
    const result = await model.generateContent(prompt);
    const textResponse = await result.response.text();
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
    const model = getModel(isPremium);
    const processText = text.substring(0, 8000);
    const prompt = `Analyze this document content and generate precise metadata tags to categorize it in a study platform database.
    
    Respond STRICTLY in JSON format with no markdown wrappers:
    {
      "primaryCategory": "Computer Science",
      "topic": "Data Structures",
      "difficulty": "Intermediate",
      "tags": ["Arrays", "Pointers", "Memory Management", "C++"]
    }
    
    Document Text:
    ${processText}`;
    
    const result = await model.generateContent(prompt);
    const textResponse = await result.response.text();
    return parseJsonResponse(textResponse);
  } catch (error) {
    console.error('Auto-tagging error:', error.message);
    return { primaryCategory: 'General', tags: [] };
  }
};

exports.studyChat = async ({ history, userMessage }, isPremium = false) => {
  try {
    const model = getModel(isPremium);
    
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
  } catch (error) {
    console.error('Error in study chat:', error.message);
    throw new Error('Failed to generate study chat response. Please ask again.');
  }
};
