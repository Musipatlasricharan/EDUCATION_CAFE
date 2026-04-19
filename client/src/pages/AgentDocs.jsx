import React, { useState } from 'react';
import { Bot, FileText, Briefcase, GraduationCap, Map, HelpCircle, Layout, Zap, CheckCircle, Info, Globe, ArrowLeft, Code, CreditCard, Activity, BarChart2, GitBranch, Search } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './AgentDocs.css';

const agentsData = [
  {
    id: "pdf-intelligence",
    title: "PDF Intelligence Agent",
    icon: FileText,
    description: "Sophisticated document analysis system using Gemini 2.5 Flash to extract insights from complex academic papers.",
    features: [
      "Executive multi-paragraph summaries",
      "Key takeaway extraction",
      "Technical terminology dictionary",
      "Supports documents up to 100k characters"
    ],
    usage: "Upload PDF -> Click 'Analyze' -> View Report",
    status: "Operational",
    importance: "In the modern academic landscape, students and researchers are overwhelmed by the sheer volume of papers and textbooks required for mastery. The PDF Intelligence Agent drastically reduces information absorption time by isolating core concepts, stripping away fluff, and automatically generating comprehensive digests. This capability transforms hours of reading into minutes of targeted learning.",
    executionFlow: [
      { step: "Upload & Ingestion", desc: "User uploads a PDF. The frontend extracts metadata and securely transmits the binary data to the backend storage layer." },
      { step: "Text Extraction", desc: "The backend uses specialized parsers to extract raw text content, thoroughly cleaning up document formatting and normalizing it for AI consumption." },
      { step: "Chunking & Tokenization", desc: "Due to maximum token limits, the text is strategically and semantically chunked for processing to ensure no context is lost." },
      { step: "Model Inference (Gemini 2.5)", desc: "Chunked text is processed by Gemini 2.5 Flash under strict system prompts to automatically extract multi-paragraph summaries, takeaways, and dictionary terms." },
      { step: "Synthesis & Delivery", desc: "The analytical insights are aggregated, synthesized into a predictable JSON schema, and dynamically presented to the user on the dashboard." }
    ],
    billingInfo: { label: "1 AI Trial / Request", cost: "1 Trial" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', tokens: 12000, reqs: 45 },
        { name: 'Tue', tokens: 15500, reqs: 55 },
        { name: 'Wed', tokens: 11000, reqs: 40 },
        { name: 'Thu', tokens: 18000, reqs: 65 },
        { name: 'Fri', tokens: 22000, reqs: 80 },
      ],
      performanceData: [
        { name: 'Mon', latency: 450, accuracy: 96 },
        { name: 'Tue', latency: 480, accuracy: 95 },
        { name: 'Wed', latency: 410, accuracy: 97 },
        { name: 'Thu', latency: 500, accuracy: 94 },
        { name: 'Fri', latency: 520, accuracy: 95 },
      ],
      activityData: [
        { name: 'W1', users: 150, pagesRead: 3000 },
        { name: 'W2', users: 200, pagesRead: 4500 },
        { name: 'W3', users: 280, pagesRead: 8000 },
        { name: 'W4', users: 400, pagesRead: 11000 },
      ]
    }
  },
  {
    id: "career-scout",
    title: "Career Scout Pro",
    icon: Briefcase,
    description: "Connects academic profiles to the global job market using multimodal analysis and deep web research via Tavily.",
    features: [
      "LinkedIn profile parsing",
      "Skill gap analysis",
      "Real-time internship discovery",
      "Upcoming webinar tracking"
    ],
    usage: "Paste Career Text -> 'Scout' -> View Opportunities",
    status: "Operational",
    importance: "Bridging the gap between education and employment is critical. Students often lack real-time visibility into the skills currently demanded by the industry. The Career Scout actively scrapes live datasets via Tavily to recommend internships, calculate exactly which skills the student is missing, and match their profile to high-impact external webinars.",
    executionFlow: [
      { step: "Profile Parsing", desc: "The user's career text, resume contents, or customized academic profile is ingested and analyzed." },
      { step: "Semantic Extraction", desc: "The Gemini model mathematically maps the text to extract core skills, specific domain expertise, and the user's granular experience level." },
      { step: "Live Web Scouting", desc: "The refined profile acts as a multi-parameter seed query for an intensive deep-web search via Tavily, targeting live job markets and current internships." },
      { step: "AI Matching & Filtering", desc: "Gemini executes a secondary pipeline to evaluate the live web data against the user's profile, scoring disparate opportunities based on skill-match percentage." },
      { step: "Insights Delivery", desc: "High-probability intern/job matches alongside actionable calculations of missing skills (skill gaps) are seamlessly shown to the user." }
    ],
    billingInfo: { label: "1 AI Trial / Request", cost: "1 Trial" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', searches: 40, scrapeVolume: 88 },
        { name: 'Tue', searches: 65, scrapeVolume: 91 },
        { name: 'Wed', searches: 80, scrapeVolume: 95 },
        { name: 'Thu', searches: 55, scrapeVolume: 92 },
        { name: 'Fri', searches: 90, scrapeVolume: 96 },
      ],
      performanceData: [
        { name: 'Mon', matchRate: 75, latency: 800 },
        { name: 'Tue', matchRate: 82, latency: 750 },
        { name: 'Wed', matchRate: 88, latency: 780 },
        { name: 'Thu', matchRate: 79, latency: 810 },
        { name: 'Fri', matchRate: 91, latency: 740 },
      ],
      activityData: [
        { name: 'W1', placements: 5, scouted: 150 },
        { name: 'W2', placements: 12, scouted: 220 },
        { name: 'W3', placements: 18, scouted: 350 },
        { name: 'W4', placements: 25, scouted: 480 },
      ]
    }
  },
  {
    id: "roadmap-architect",
    title: "Adaptive Roadmap Architect",
    icon: Map,
    description: "Generates personalized, day-by-day learning paths tailored to your specific goals and timeline.",
    features: [
      "Phase-based learning structure",
      "Actionable daily tasks",
      "Curated resource selection (Video/Text)",
      "Dynamic adjustability"
    ],
    usage: "Set Goal + Duration -> 'Generate' -> Start Learning",
    status: "Operational",
    importance: "Learning without structure leads to burnout and misdirection. The Roadmap Architect uses advanced semantic understanding to break down multi-month objectives into micro-tasks. By providing students with exact resources (videos, articles) per day, it eliminates “decision fatigue” and ensures consistent forward momentum.",
    executionFlow: [
      { step: "Goal Ingestion", desc: "The user explicitly provides an end goal, their current baseline proficiency level, and their available study duration (e.g., 30 Days)." },
      { step: "Cognitive Planning", desc: "The chosen generative model acts as a pedagogical expert, breaking down the massive overarching goal into logical macro-phases (e.g., Fundamentals, Advanced Concepts)." },
      { step: "Micro-Task Generation", desc: "Each macro-phase is further algorithmically segmented into actionable, daily atomic tasks ensuring a comfortable yet progressive learning curve." },
      { step: "Resource Curation", desc: "The model integrates specific internet keywords to programmatically recommend relevant learning formats and materials suitable for that exact day." },
      { step: "Dynamic Assembly", desc: "The fully detailed plan is mapped out chronologically, persisted in the database, and rendered in a step-by-step interactive roadmap interface." }
    ],
    billingInfo: { label: "2 AI Trials / Generation", cost: "2 Trials" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', generationTime: 1200, load: 45 },
        { name: 'Tue', generationTime: 1100, load: 50 },
        { name: 'Wed', generationTime: 1250, load: 38 },
        { name: 'Thu', generationTime: 1000, load: 60 },
        { name: 'Fri', generationTime: 980, load: 75 },
      ],
      performanceData: [
        { name: 'Mon', satisfaction: 90, completion: 40 },
        { name: 'Tue', satisfaction: 92, completion: 45 },
        { name: 'Wed', satisfaction: 89, completion: 42 },
        { name: 'Thu', satisfaction: 95, completion: 55 },
        { name: 'Fri', satisfaction: 98, completion: 60 },
      ],
      activityData: [
        { name: 'W1', mapsCreated: 150, goalsHit: 20 },
        { name: 'W2', mapsCreated: 240, goalsHit: 35 },
        { name: 'W3', mapsCreated: 310, goalsHit: 60 },
        { name: 'W4', mapsCreated: 420, goalsHit: 95 },
      ]
    }
  },
  {
    id: "doubt-solver",
    title: "Academic Doubt Solver",
    icon: HelpCircle,
    description: "A vision-enabled tutor that solves problems from text descriptions or uploaded photos of equations and diagrams.",
    features: [
      "Visual problem recognition",
      "Step-by-step mathematical solutions",
      "Conceptual explanations",
      "Simple language distillation"
    ],
    usage: "Type Question OR Upload Photo -> 'Solve' -> Review",
    status: "Operational",
    importance: "Not every student has 24/7 access to a human tutor. The Academic Doubt Solver leverages Gemini's multimodal vision to allow students to simply snap a picture of a handwritten math equation or complex biology diagram. It breaks down the answer step-by-step, providing immediate, judgment-free academic support.",
    executionFlow: [
      { step: "Multimodal Ingestion", desc: "The student inputs descriptive text or uploads an image (such as a photograph of a handwritten equation, a complex diagram, or textbook snippet)." },
      { step: "Image Processing", desc: "If visual data is submitted, its mime-type and binary footprint are perfectly formatted for broad multimodal model understanding." },
      { step: "Inference Deployment", desc: "Both the context text and the image data are concurrently sent to the Gemini Vision model to ensure complete situational context." },
      { step: "Contextual Resolution", desc: "Instead of a simple numeric output, the agent is instructed to isolate the core concept and formulate a true top-to-bottom step-by-step resolution." },
      { step: "Final Delivery", desc: "The logical response is compiled cleanly in Markdown with mathematical symbols and safely rendered into an elegant HTML format for the user." }
    ],
    billingInfo: { label: "1 AI Trial / Request", cost: "1 Trial" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', visionReqs: 200, textReqs: 400 },
        { name: 'Tue', visionReqs: 250, textReqs: 420 },
        { name: 'Wed', visionReqs: 220, textReqs: 380 },
        { name: 'Thu', visionReqs: 300, textReqs: 500 },
        { name: 'Fri', visionReqs: 310, textReqs: 550 },
      ],
      performanceData: [
        { name: 'Mon', textSuccess: 98, visionSuccess: 92 },
        { name: 'Tue', textSuccess: 97, visionSuccess: 94 },
        { name: 'Wed', textSuccess: 99, visionSuccess: 93 },
        { name: 'Thu', textSuccess: 96, visionSuccess: 90 },
        { name: 'Fri', textSuccess: 98, visionSuccess: 95 },
      ],
      activityData: [
        { name: 'W1', uniqueUsers: 400, resolved: 1200 },
        { name: 'W2', uniqueUsers: 450, resolved: 1500 },
        { name: 'W3', uniqueUsers: 600, resolved: 2200 },
        { name: 'W4', uniqueUsers: 850, resolved: 3100 },
      ]
    }
  },
  {
    id: "interview-prep",
    title: "Interview Prep Specialist",
    icon: GraduationCap,
    description: "Comprehensive preparation modules for technical and behavioral interviews in any domain.",
    features: [
      "Fundamental masterlists",
      "Scenario-based question sets",
      "Expert feedback loops",
      "Body language & soft-skill tips"
    ],
    usage: "Enter Topic -> 'Prepare' -> Study Module",
    status: "Operational",
    importance: "Technical intelligence alone does not pass interviews. This agent provides interactive, simulated pressure-testing for students. By simulating real-world technical and behavioral questions and providing immediate feedback on communication clarity, it serves as a relentless, free mock-interviewer.",
    executionFlow: [
      { step: "Topic Selection", desc: "The candidate configures their desired interview domain, specifically picking between Technical/Hard-Skills or Behavioral/Soft-Skills." },
      { step: "Context Instantiation", desc: "A rigorous, context-aware mock-interviewer persona is instantiated on the cloud backend through highly customized conversational system prompting." },
      { step: "Interactive Simulation", desc: "The model begins dynamically querying the user, throwing curveballs, and simulating a high-pressure, real-world interview environment." },
      { step: "Real-time Assessment", desc: "As the user types out responses, the underlying engine rapidly evaluates text for confidence, clarity of thought, and technical domain accuracy." },
      { step: "Feedback Loop & Handshake", desc: "Crucial, immediate, and highly constructive feedback loops help refine the candidate's initial answers iteratively before moving on." }
    ],
    billingInfo: { label: "Interactive Session", cost: "3 Trials" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', sessions: 45, duration: 15 },
        { name: 'Tue', sessions: 60, duration: 20 },
        { name: 'Wed', sessions: 55, duration: 18 },
        { name: 'Thu', sessions: 80, duration: 25 },
        { name: 'Fri', sessions: 100, duration: 30 },
      ],
      performanceData: [
        { name: 'Mon', confidenceResp: 82, qualityScore: 88 },
        { name: 'Tue', confidenceResp: 85, qualityScore: 90 },
        { name: 'Wed', confidenceResp: 84, qualityScore: 89 },
        { name: 'Thu', confidenceResp: 88, qualityScore: 92 },
        { name: 'Fri', confidenceResp: 92, qualityScore: 95 },
      ],
      activityData: [
        { name: 'W1', interviews: 200, passed: 45 },
        { name: 'W2', interviews: 280, passed: 70 },
        { name: 'W3', interviews: 350, passed: 110 },
        { name: 'W4', interviews: 500, passed: 180 },
      ]
    }
  },
  {
    id: "recall-generator",
    title: "Active-Recall Generator",
    icon: Zap,
    description: "Instantly transforms study material into interactive quizzes and flashcards to fight the forgetting curve.",
    features: [
      "MCQ generation with explanations",
      "Spaced-repetition flashcards",
      "Instant performance feedback",
      "Material-to-Quiz transformation"
    ],
    usage: "Input Material -> 'Generate' -> Start Quiz",
    status: "Operational",
    importance: "Research consistently shows active recall is the most effective study technique. Instead of passively re-reading notes, this agent autonomously converts passive text into rigorous MCQs and Flashcards. It guarantees higher retention rates by forcing the brain to retrieve information dynamically.",
    executionFlow: [
      { step: "Material Ingestion", desc: "The user seamlessly inputs raw, passive study notes, long textual transcripts, or full uploaded chapter contents into the text area." },
      { step: "Context Extraction", desc: "Working through the noise, the Gemini architecture dissects the information to cleanly isolate foundational facts, distinct topics, and critical definitions." },
      { step: "Asset Generation", desc: "Utilizing deep reasoning, the AI autonomously synthesizes the extracted data points into logical Multiple Choice Questions and focused Spaced-Repetition Flashcards." },
      { step: "Validation Schema", desc: "All outputs are strictly, cryptographically validated against a predefined JSON schema structure to ensure absolute UI reliability and prevent parse errors." },
      { step: "Interactive Testing", desc: "The generated assets are immediately persisted and presented inside an interactive testing application engineered exclusively to maximize daily memory retention." }
    ],
    billingInfo: { label: "Bulk Generation", cost: "2 Trials" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', cards: 500, mcqs: 300 },
        { name: 'Tue', cards: 800, mcqs: 450 },
        { name: 'Wed', cards: 1200, mcqs: 600 },
        { name: 'Thu', cards: 900, mcqs: 400 },
        { name: 'Fri', cards: 1500, mcqs: 850 },
      ],
      performanceData: [
        { name: 'Mon', accuracy: 99, retainRate: 75 },
        { name: 'Tue', accuracy: 98, retainRate: 78 },
        { name: 'Wed', accuracy: 99, retainRate: 82 },
        { name: 'Thu', accuracy: 97, retainRate: 80 },
        { name: 'Fri', accuracy: 99, retainRate: 85 },
      ],
      activityData: [
        { name: 'W1', testRetaken: 400, scoreAvg: 65 },
        { name: 'W2', testRetaken: 550, scoreAvg: 72 },
        { name: 'W3', testRetaken: 800, scoreAvg: 80 },
        { name: 'W4', testRetaken: 1200, scoreAvg: 88 },
      ]
    }
  },
  {
    id: "lecture-study-pack",
    title: "Lecture Study Pack",
    icon: Zap,
    description: "Converts raw lecture transcripts or rough notes into comprehensive, structured study materials, including summaries, flashcards, and quizzes.",
    features: [
      "Transcript parsing and summarization",
      "Automated flashcard generation",
      "Self-assessment quiz creation",
      "Key concept extraction"
    ],
    usage: "Paste Transcript -> 'Generate Study Pack' -> Review Cards & Quiz",
    status: "Operational",
    importance: "Students often struggle to synthesize hours of lecture transcripts into digestible, actionable study material. The Lecture Study Pack automates this painstaking process by reading unstructured notes, identifying the critical learning objectives, and instantaneously creating a multifaceted revision environment. This converts a passive listening experience into an active learning ecosystem.",
    executionFlow: [
      { step: "Text Ingestion", desc: "User inputs raw textual data from lecture transcripts or rough notes." },
      { step: "Semantic Cleansing", desc: "The natural language processor cleans the text, resolving grammatical errors from audio transcriptions and normalizing the data structure." },
      { step: "Extraction & Generation", desc: "The model simultaneously extracts core tenets for summarization, drafts spaced-repetition flashcards, and engineers multiple-choice questions." },
      { step: "Validation Packaging", desc: "Generated elements are strictly mapped to JSON schemas, verifying that questions have logical correct answers and clear explanations." },
      { step: "Interactive Delivery", desc: "The user is presented with a dynamic UI containing the condensed summary, interactive flip-cards, and a responsive quiz." }
    ],
    billingInfo: { label: "1 AI Trial / Generation", cost: "1 Trial" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', transcripts: 150, chars: 450000 },
        { name: 'Tue', transcripts: 210, chars: 620000 },
        { name: 'Wed', transcripts: 180, chars: 510000 },
        { name: 'Thu', transcripts: 250, chars: 780000 },
        { name: 'Fri', transcripts: 300, chars: 910000 },
      ],
      performanceData: [
        { name: 'Mon', accuracy: 94, latency: 600 },
        { name: 'Tue', accuracy: 96, latency: 580 },
        { name: 'Wed', accuracy: 95, latency: 620 },
        { name: 'Thu', accuracy: 97, latency: 550 },
        { name: 'Fri', accuracy: 98, latency: 530 },
      ],
      activityData: [
        { name: 'W1', users: 120, packs: 200 },
        { name: 'W2', users: 180, packs: 350 },
        { name: 'W3', users: 250, packs: 500 },
        { name: 'W4', users: 320, packs: 700 },
      ]
    }
  },
  {
    id: "question-paper-ai",
    title: "Question Paper AI",
    icon: FileText,
    description: "Dynamically formulates rigorous examination papers across different difficulty levels, complete with marking schemes.",
    features: [
      "Customizable difficulty matrix",
      "Total marks calculation",
      "Topic-specific targeting",
      "Print-ready document formatting"
    ],
    usage: "Enter Topic + Set Difficulty & Marks -> 'Generate' -> Export to Print",
    status: "Operational",
    importance: "Educators and self-studying students spend countless hours drafting balanced assessments. The Question Paper AI generates structured, curriculum-aligned tests on demand. By mathematically balancing difficulty parameters and ensuring comprehensive topic coverage, it produces high-fidelity examination papers that rival official academic standardized tests.",
    executionFlow: [
      { step: "Parameter Setting", desc: "The user configures the primary topic, sets the holistic difficulty (Easy, Medium, Hard), and defines the total required marks." },
      { step: "Knowledge Retrieval", desc: "The AI agent consults its expansive knowledge base to retrieve specific sub-topics, standard axioms, and common problem models related to the prompt." },
      { step: "Question Generation", desc: "A recursive generation loop designs a mixture of objective, short-answer, and long-form questions, assigning precise mark weights to each." },
      { step: "Balance Auditing", desc: "The model internally reviews the drafted paper to guarantee that the sum of question weights perfectly matches the requested total marks and the difficulty curve is appropriate." },
      { step: "Final Formatting", desc: "The verified test is rendered into clean Markdown, allowing for immediate review, easy sharing, or physical printing via the UI." }
    ],
    billingInfo: { label: "Standard Assessment", cost: "2 Trials" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', papers: 60, subjects: 15 },
        { name: 'Tue', papers: 85, subjects: 22 },
        { name: 'Wed', papers: 70, subjects: 20 },
        { name: 'Thu', papers: 110, subjects: 28 },
        { name: 'Fri', papers: 140, subjects: 35 },
      ],
      performanceData: [
        { name: 'Mon', relevance: 92, formatting: 99 },
        { name: 'Tue', relevance: 95, formatting: 99 },
        { name: 'Wed', relevance: 94, formatting: 99 },
        { name: 'Thu', relevance: 97, formatting: 99 },
        { name: 'Fri', relevance: 98, formatting: 99 },
      ],
      activityData: [
        { name: 'W1', educators: 40, students: 120 },
        { name: 'W2', educators: 55, students: 180 },
        { name: 'W3', educators: 80, students: 260 },
        { name: 'W4', educators: 110, students: 350 },
      ]
    }
  },
  {
    id: "plagiarism-checker",
    title: "AI Plagiarism & Integrity Checker",
    icon: Search,
    description: "Advanced semantic analysis engine designed to distinguish between human-written prose and LLM-generated content.",
    features: [
      "Perplexity and burstiness analysis",
      "Linguistic pattern recognition",
      "Probability scoring (0-100%)",
      "Flagging of suspected synthetic phrasing"
    ],
    usage: "Paste Text -> 'Scan' -> Review Integrity Verdict",
    status: "Operational",
    importance: "Maintaining academic integrity in the age of generative AI is a massive challenge. This tool doesn't just look for copied text; it analyzes the statistical structure of sentences. By evaluating perplexity (predictability of words) and burstiness (variance in sentence length), it provides educators and publishers with a robust probabilistic verdict on content originality.",
    executionFlow: [
      { step: "Text Submission", desc: "The user pastes a large block of prose or an essay into the analysis window." },
      { step: "Token Analysis", desc: "The text is tokenized, and the underlying AI computes perplexity models to determine the statistical likelihood of each token sequence." },
      { step: "Linguistic Profiling", desc: "The sentence structure is mapped to measure variance. Human writers tend to have high burstiness (mixing short and long sentences dynamically), whereas older AI models are uniform." },
      { step: "Scoring Matrix", desc: "A final multi-variable calculation generates a definitive AI Probability Score and formulates an easy-to-understand verdict (e.g., 'Likely Human', 'Highly Synthetic')." },
      { step: "Evidence Flagging", desc: "Specific sentences or paragraphs exhibiting maximum predictability are flagged and presented directly to the user as supporting evidence." }
    ],
    billingInfo: { label: "1 Scan / Request", cost: "1 Trial" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', scans: 300, flagged: 45 },
        { name: 'Tue', scans: 450, flagged: 60 },
        { name: 'Wed', scans: 400, flagged: 55 },
        { name: 'Thu', scans: 600, flagged: 90 },
        { name: 'Fri', scans: 850, flagged: 130 },
      ],
      performanceData: [
        { name: 'Mon', precision: 95, recall: 90 },
        { name: 'Tue', precision: 96, recall: 92 },
        { name: 'Wed', precision: 95, recall: 91 },
        { name: 'Thu', precision: 97, recall: 94 },
        { name: 'Fri', precision: 98, recall: 95 },
      ],
      activityData: [
        { name: 'W1', users: 200, avgScore: 18 },
        { name: 'W2', users: 350, avgScore: 22 },
        { name: 'W3', users: 500, avgScore: 20 },
        { name: 'W4', users: 800, avgScore: 25 },
      ]
    }
  },
  {
    id: "smart-tagger",
    title: "Smart Document Tagger",
    icon: Layout,
    description: "Intelligently extracts taxonomy, categorizations, and metadata tags from unstructured text to organize your workspace.",
    features: [
      "Semantic entity extraction",
      "Automated categorization",
      "Metadata taxonomy bounding",
      "Instant organization mapping"
    ],
    usage: "Paste Content -> 'Auto-Tag' -> View Categorization",
    status: "Operational",
    importance: "Information retrieval relies entirely on proper organization. Manual tagging of notes and files introduces human error and massive time sinks. The Smart Document Tagger scans granular details to infer topics, key entities, and overarching themes, seamlessly binding unstructured text to an organized library architecture.",
    executionFlow: [
      { step: "Unstructured Ingestion", desc: "User inputs a block of unstructured content, such as meeting minutes, random thoughts, or research excerpts." },
      { step: "Entity Extraction", desc: "The natural language model scans the text to extract named entities, technical jargon, and dominant subject matters." },
      { step: "Taxonomic Mapping", desc: "The extracted terms are evaluated against a localized taxonomy structure to group related concepts intelligently (e.g., mapping 'Photosynthesis' to 'Biology')." },
      { step: "Confidence Filtering", desc: "Potential tags are assigned a confidence score; only tags exceeding a high threshold are retained to prevent irrelevant metadata clustering." },
      { step: "Output Generation", desc: "The finalized tags and summary labels are returned in a clean array, ready to be immediately applied to the file system UI." }
    ],
    billingInfo: { label: "1 AI Trial / Request", cost: "1 Trial" },
    chartsOptions: {
      usageData: [
        { name: 'Mon', docs: 150, tags: 600 },
        { name: 'Tue', docs: 210, tags: 850 },
        { name: 'Wed', docs: 190, tags: 760 },
        { name: 'Thu', docs: 280, tags: 1100 },
        { name: 'Fri', docs: 350, tags: 1400 },
      ],
      performanceData: [
        { name: 'Mon', accuracy: 96, speed: 99 },
        { name: 'Tue', accuracy: 97, speed: 99 },
        { name: 'Wed', accuracy: 96, speed: 99 },
        { name: 'Thu', accuracy: 98, speed: 99 },
        { name: 'Fri', accuracy: 98, speed: 99 },
      ],
      activityData: [
        { name: 'W1', usage: 300, clicks: 1200 },
        { name: 'W2', usage: 450, clicks: 1800 },
        { name: 'W3', usage: 600, clicks: 2500 },
        { name: 'W4', usage: 850, clicks: 3600 },
      ]
    }
  }
];

const AgentDetail = ({ agent, onBack }) => {
  const Icon = agent.icon;
  
  const { usageData, performanceData, activityData } = agent.chartsOptions;
  
  const usageKeys = Object.keys(usageData[0]).filter(k => k !== 'name');
  const perfKeys = Object.keys(performanceData[0]).filter(k => k !== 'name');
  const actKeys = Object.keys(activityData[0]).filter(k => k !== 'name');

  return (
    <div className="agent-detail-wrapper">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Ecosystem
      </button>

      <div className="detail-header">
        <div className="detail-icon">
          <Icon size={48} />
        </div>
        <div className="detail-title">
          <h2>{agent.title}</h2>
          <p>{agent.description}</p>
        </div>
      </div>

      <div className="detail-content-grid">
        <div className="detail-left-col flex flex-col gap-6">
          <div className="detail-section">
            <h3><Info size={18} className="icon" /> Why it reflects excellence</h3>
            <div className="importance-text">
              <p>{agent.importance}</p>
            </div>
          </div>

          <div className="detail-section">
            <h3><GitBranch size={18} className="icon" /> End-to-End Execution Flow</h3>
            <div className="workflow-steps">
              {agent.executionFlow.map((flow, index) => (
                <div key={index} className="workflow-step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-details">
                    <h4>{flow.step}</h4>
                    <p>{flow.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-right-col flex flex-col gap-6">
          <div className="detail-section">
            <h3><CreditCard size={18} className="icon" /> Billing & Quota</h3>
            <div className="billing-card">
              <div className="billing-info">
                <h4>Standard Usage Cost</h4>
                <p>{agent.billingInfo.label}</p>
                <p className="text-sm mt-2 text-accent">Premium: Unlimited Access</p>
              </div>
              <div className="billing-cost">
                {agent.billingInfo.cost}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-section" style={{ marginTop: 'var(--s-6)' }}>
        <h3><Activity size={18} className="icon" /> Advanced Live Metrics & Analytics</h3>
        
        <div className="charts-grid">
          {/* Chart 1: Line Chart (Usage/Traffic) */}
          <div className="chart-wrapper">
            <h4 className="chart-title">Weekly API Throughput</h4>
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickMargin={5} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickMargin={5} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey={usageKeys[0]} stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  {usageKeys[1] && <Line type="monotone" dataKey={usageKeys[1]} stroke="var(--accent-secondary)" strokeWidth={3} dot={{ r: 4 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Area Chart (Performance / Latency) */}
          <div className="chart-wrapper">
            <h4 className="chart-title">Quality & Latency Index</h4>
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPerf1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPerf2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickMargin={5} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickMargin={5} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey={perfKeys[0]} stroke="var(--success)" fillOpacity={1} fill="url(#colorPerf1)" strokeWidth={2} />
                  {perfKeys[1] && <Area type="monotone" dataKey={perfKeys[1]} stroke="var(--warning)" fillOpacity={1} fill="url(#colorPerf2)" strokeWidth={2} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Bar Chart (User Impact / Monthly Activity) */}
          <div className="chart-wrapper">
            <h4 className="chart-title"><BarChart2 size={12} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '1px' }}/> Monthly Impact Tracking</h4>
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickMargin={5} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickMargin={5} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Bar dataKey={actKeys[0]} fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={30} />
                  {actKeys[1] && <Bar dataKey={actKeys[1]} fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} barSize={30} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentDocs = () => {
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const selectedAgent = agentsData.find(a => a.id === selectedAgentId);

  return (
    <div className="agent-docs-container">
      {!selectedAgent ? (
        <>
          <header className="agent-docs-header">
            <div className="docs-badge">
              <Bot size={16} />
              <span>Internal Documentation</span>
            </div>
            <h1 className="agent-docs-title">
              AI Agent <span>Ecosystem</span>
            </h1>
            <p className="agent-docs-subtitle">
              Detailed specifications, usage guidelines, and operational status for our fleet of Gemini-powered intelligent agents.
            </p>
          </header>

          <div className="agent-grid">
            {agentsData.map((agent) => {
              const Icon = agent.icon;
              return (
                <div key={agent.id} className="agent-card" onClick={() => setSelectedAgentId(agent.id)}>
                  <div className="agent-card-header">
                    <div className="agent-icon-wrapper">
                      <Icon size={24} />
                    </div>
                    <div className="status-badge">
                      <div className="status-dot"></div>
                      <span>{agent.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="agent-card-title">{agent.title}</h3>
                  <p className="agent-card-desc">
                    {agent.description}
                  </p>

                  <div className="agent-features">
                    <h4>
                      <Zap size={14} /> Core Capabilities
                    </h4>
                    <ul>
                      {agent.features.map((f, i) => (
                        <li key={i}>
                          <CheckCircle size={14} className="icon" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="agent-usage">
                    <h4>Usage Example</h4>
                    <code>{agent.usage}</code>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="arch-section glass">
            <Bot size={280} className="arch-bg-icon" />
            <div className="arch-content">
              <h2>
                <Info className="icon text-accent" /> Technical Architecture
              </h2>
              <p>
                Our AI ecosystem leverages the <strong>Gemini 2.5 Flash</strong> and <strong>Pro</strong> models for low-latency reasoning 
                and large context window processing (up to 1M tokens). Each agent is isolated for specific tasks to ensure 
                maximum reliability and prompt precision.
              </p>
              <div className="arch-grid">
                <div className="arch-item">
                  <h4>
                    <Layout size={16} className="icon" /> Multimodal Engine
                  </h4>
                  <p>Agents can process text, images, and documents simultaneously for cross-domain intelligence.</p>
                </div>
                <div className="arch-item">
                  <h4>
                    <Globe size={16} className="icon" /> Live Web Search
                  </h4>
                  <p>Integrated with Tavily and Serper APIs for real-time market data and opportunity tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <AgentDetail 
          agent={selectedAgent} 
          onBack={() => setSelectedAgentId(null)} 
        />
      )}
    </div>
  );
};

export default AgentDocs;
