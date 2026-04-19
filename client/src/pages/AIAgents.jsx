import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, Search, Briefcase, File, Loader, Clock, X, MessageSquare, History, Map, Check, Calendar, Send, Layout as LayoutIcon, Lightbulb, Sparkles, Brain, Zap, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line
import SubscriptionCard from '../components/ui/SubscriptionCard';
import './AIAgents.css';

const agentLabels = {
  'PDF_SUMMARIZER': 'PDF Summarizer',
  'CAREER_SCOUT': 'LinkedIn Career Scout',
  'INTERVIEW_PREP': 'Mock Interview Prep',
  'INTERVIEW_SESSION': 'Interview Chat',
  'ROADMAP': 'Study Roadmap',
  'FLASHCARDS': 'AI Flashcards',
  'QUESTION_PAPER': 'Question Paper',
  'DOUBT_SOLVER': 'Doubt Explanation',
  'LECTURE_SUMMARIZER': 'Lecture Study Pack',
  'PLAGIARISM_CHECKER': 'AI Plagiarism Checker',
  'AUTO_TAGGER': 'Smart Document Tagger'
};

export default function AIAgents() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pdf');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // History & Modal State
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  // Agent States
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfResult, setPdfResult] = useState('');
  const [pdfStep, setPdfStep] = useState(0);

  const [careerText, setCareerText] = useState('');
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerResult, setCareerResult] = useState('');
  const [careerStep, setCareerStep] = useState(0);

  const [interviewTopic, setInterviewTopic] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewResult, setInterviewResult] = useState('');
  const [interviewStep, setInterviewStep] = useState(0);
  const [roadmapGoal, setRoadmapGoal] = useState('');
  const [roadmapLevel, setRoadmapLevel] = useState('beginner');
  const [roadmapDuration, setRoadmapDuration] = useState(4);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [roadmapStep, setRoadmapStep] = useState(0);

  const [flashcardText, setFlashcardText] = useState('');
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcardResult, setFlashcardResult] = useState(null);
  const [flashcardStep, setFlashcardStep] = useState(0);

  const [paperTopic, setPaperTopic] = useState('');
  const [paperDifficulty, setPaperDifficulty] = useState('medium');
  const [paperMarks, setPaperMarks] = useState(100);
  const [paperLoading, setPaperLoading] = useState(false);
  const [paperResult, setPaperResult] = useState('');
  const [paperStep, setPaperStep] = useState(0);

  const [doubtText, setDoubtText] = useState('');
  const [doubtImage, setDoubtImage] = useState(null);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [doubtResult, setDoubtResult] = useState('');
  const [doubtStep, setDoubtStep] = useState(0);

  const [lectureText, setLectureText] = useState('');
  const [lectureLoading, setLectureLoading] = useState(false);
  const [lectureResult, setLectureResult] = useState(null);
  const [lectureStep, setLectureStep] = useState(0);

  const [plagiarismText, setPlagiarismText] = useState('');
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState(null);

  const [tagText, setTagText] = useState('');
  const [tagLoading, setTagLoading] = useState(false);
  const [tagResult, setTagResult] = useState(null);

  // Interview Live Session
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [userMsg, setUserMsg] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserMsg(prev => prev + ' ' + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const startInterview = () => {
    setIsInterviewActive(true);
    setInterviewMessages([{ role: 'model', text: `Hello! I'm your AI interviewer today. We'll be focusing on ${interviewTopic}. Ready to start? Give me a quick intro or just say "Let's go!"` }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMsg.trim() || isAiTyping) return;

    const newMessage = { role: 'user', text: userMsg };
    setInterviewMessages(prev => [...prev, newMessage]);
    setUserMsg('');
    setIsAiTyping(true);

    try {
      const response = await api.post('/ai/interactive-interview', {
        topic: interviewTopic,
        history: interviewMessages,
        userMessage: userMsg
      });
      setInterviewMessages(prev => [...prev, { role: 'model', text: response.data.data }]);
    } catch (err) {
      console.error('Interview Error:', err);
      toast.error('Failed to get AI response');
    } finally {
      setIsAiTyping(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const progressTexts = {
    pdf: ["Uploading Document...", "Parsing Text from PDF...", "Extracting Key Insights...", "Formulating Summary..."],
    career: ["Analyzing Profile...", "Extracting Skills & Experience...", "Searching Live Web for Opportunities...", "Compiling Career Report..."],
    interview: ["Analyzing Topic...", "Generating Fundamental Questions...", "Crafting Scenario Based Cases...", "Finalizing Prep Plan..."],
    roadmap: ["Synthesizing Goal...", "Curating Learning Modules...", "Sequencing Phases...", "Personalizing Schedule..."],
    flashcard: ["Reading Material...", "Identifying Concepts...", "Forming Q&A Pairs...", "Finalizing Deck..."],
    paper: ["Analyzing Curriculum...", "Generating Questions...", "Balancing Difficulty...", "Formatting Document..."],
    doubts: ["Analyzing Question...", "Retrieving Knowledge...", "Synthesizing Explanation...", "Finalizing Answer..."],
    lecture: ["Parsing Lecture Material...", "Generating Summary...", "Creating Flashcards...", "Designing Self-Assessment..."],
    plag: ["Scanning Text Fingerprints...", "Analyzing Linguistic Patterns...", "Cross-checking Known Sources...", "Finalizing Integrity Score..."],
    tag: ["Extracting Semantic Entities...", "Generating Taxonomy...", "Applying Category Labels...", "Finalizing Metadata..."]
  };

  const simulateProgress = (type, setStepFn, setLoadingFn) => {
    setLoadingFn(true);
    setStepFn(0);
    const steps = progressTexts[type].length;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps) {
        setStepFn(currentStep);
      }
    }, 1500);

    return () => clearInterval(interval);
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return toast.error('Please select a PDF file first.');

    const clearIntervalFn = simulateProgress('pdf', setPdfStep, setPdfLoading);
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const response = await api.post(`/ai/analyze-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPdfResult(response.data.summary);
      toast.success('PDF Analyzed successfully!');
      fetchHistory();
    } catch (error) {
      if (error.response?.status === 403) setShowUpgradeModal(true);
      toast.error(error.response?.data?.message || 'Error analyzing PDF');
    } finally {
      clearIntervalFn();
      setPdfLoading(false);
    }
  };

  const handleCareerScout = async (e) => {
    e.preventDefault();
    if (!careerText.trim()) return toast.error('Please enter profile text.');

    const clearIntervalFn = simulateProgress('career', setCareerStep, setCareerLoading);
    try {
      const response = await api.post(`/ai/career-scout`, { careerText });
      setCareerResult(response.data.report);
      toast.success('Career Report Generated!');
      fetchHistory();
    } catch (error) {
      if (error.response?.status === 403) setShowUpgradeModal(true);
      toast.error(error.response?.data?.message || 'Error scouting career');
    } finally {
      clearIntervalFn();
      setCareerLoading(false);
    }
  };

  const handleInterviewPrep = async (e) => {
    e.preventDefault();
    if (!interviewTopic.trim()) return toast.error('Please enter a topic.');

    const clearIntervalFn = simulateProgress('interview', setInterviewStep, setInterviewLoading);
    try {
      const response = await api.post(`/ai/interview-prep`, { topic: interviewTopic });
      setInterviewResult(response.data.report);
      toast.success('Interview Prep generated!');
      fetchHistory();
    } catch (error) {
      if (error.response?.status === 403) setShowUpgradeModal(true);
      toast.error(error.response?.data?.message || 'Error generating prep material');
    } finally {
      clearIntervalFn();
      setInterviewLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!roadmapGoal.trim()) return toast.error('Please enter a goal.');

    const clearIntervalFn = simulateProgress('roadmap', setRoadmapStep, setRoadmapLoading);
    try {
      const response = await api.post(`/ai/generate-roadmap`, { 
        goal: roadmapGoal, 
        currentLevel: roadmapLevel, 
        duration: roadmapDuration 
      });
      setRoadmapResult(response.data.data);
      toast.success('Personalized Roadmap generated!');
      fetchHistory();
    } catch (error) {
      if (error.response?.status === 403) setShowUpgradeModal(true);
      toast.error(error.response?.data?.message || 'Error generating roadmap');
    } finally {
      clearIntervalFn();
      setRoadmapLoading(false);
    }
  };

  const handleGenerateFlashcards = async (e) => {
    e.preventDefault();
    if (!flashcardText.trim()) return toast.error('Please provide study material.');
    const clearIntervalFn = simulateProgress('flashcard', setFlashcardStep, setFlashcardLoading);
    try {
      const response = await api.post('/ai/generate-quiz', { text: flashcardText });
      setFlashcardResult(response.data.data.flashcards);
      toast.success('Flashcards generated!');
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 403) setShowUpgradeModal(true);
      toast.error('Failed to generate flashcards');
    } finally {
      clearIntervalFn();
      setFlashcardLoading(false);
    }
  };

  const handleGeneratePaper = async (e) => {
    e.preventDefault();
    if (!paperTopic.trim()) return toast.error('Please enter a topic.');
    const clearIntervalFn = simulateProgress('paper', setPaperStep, setPaperLoading);
    try {
      const response = await api.post('/ai/generate-question-paper', {
        topic: paperTopic,
        difficulty: paperDifficulty,
        totalMarks: paperMarks
      });
      setPaperResult(response.data.paper);
      toast.success('Question paper generated!');
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 403) setShowUpgradeModal(true);
      toast.error('Failed to generate paper');
    } finally {
      clearIntervalFn();
      setPaperLoading(false);
    }
  };

  const handleSolveDoubt = async (e) => {
    e.preventDefault();
    if (!doubtText.trim() && !doubtImage) return toast.error('Please provide a doubt or upload an image.');
    
    const clearIntervalFn = simulateProgress('doubts', setDoubtStep, setDoubtLoading);
    const formData = new FormData();
    if (doubtText.trim()) formData.append('doubt', doubtText);
    if (doubtImage) formData.append('image', doubtImage);

    try {
      const response = await api.post('/ai/solve-doubt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDoubtResult(response.data.data);
      toast.success('Doubt solved!');
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 403) setShowUpgradeModal(true);
      toast.error(err.response?.data?.message || 'Failed to solve doubt');
    } finally {
      clearIntervalFn();
      setDoubtLoading(false);
    }
  };

  const handleLectureProcess = async (e) => {
    e.preventDefault();
    if (!lectureText.trim()) return toast.error('Please provide lecture text.');
    const clearIntervalFn = simulateProgress('lecture', setLectureStep, setLectureLoading);
    try {
      const response = await api.post('/ai/generate-quiz', { text: lectureText });
      // The generate-quiz endpoint already returns flashcards and quizzes.
      // We can use it as a study pack engine.
      setLectureResult(response.data.data);
      toast.success('Lecture Study Pack generated!');
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 403) setShowUpgradeModal(true);
      toast.error('Failed to process lecture');
    } finally {
      clearIntervalFn();
      setLectureLoading(false);
    }
  };

  const handlePlagiarismCheck = async (e) => {
    e.preventDefault();
    if (!plagiarismText.trim()) return toast.error('Please provide text to scan.');
    setPlagiarismLoading(true);
    try {
      const response = await api.post('/ai/check-plagiarism', { text: plagiarismText });
      setPlagiarismResult(response.data.data);
      toast.success('Plagiarism scan complete!');
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 403) setShowUpgradeModal(true);
      toast.error('Failed to scan for plagiarism');
    } finally {
      setPlagiarismLoading(false);
    }
  };

  const handleAutoTag = async (e) => {
    e.preventDefault();
    if (!tagText.trim()) return toast.error('Please provide text to tag.');
    setTagLoading(true);
    try {
      const response = await api.post('/ai/auto-tag', { text: tagText });
      setTagResult(response.data.data);
      toast.success('Metadata auto-generated!');
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 403) setShowUpgradeModal(true);
      toast.error('Failed to auto-tag');
    } finally {
      setTagLoading(false);
    }
  };

  const renderHistoryModal = () => (
    <AnimatePresence>
      {selectedHistoryItem && (
        <motion.div 
          className="history-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="history-modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            <div className="modal-header">
              <h3>{agentLabels[selectedHistoryItem.agentType] || 'AI Agent'} Result</h3>
              <button className="close-btn" onClick={() => setSelectedHistoryItem(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="history-meta mt-2">
                <span className="history-time"><Clock size={14} /> {new Date(selectedHistoryItem.createdAt).toLocaleString()}</span>
              </div>
              <div className="history-input-box mt-3 mb-4">
                <strong>Input:</strong> {selectedHistoryItem.inputText}
              </div>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedHistoryItem.result}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="ai-agents-container">
      <motion.header 
        className="ai-agents-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="premium-badge"><Sparkles size={14}/> POWERED BY GEMINI FLASH LATEST</div>
        <h1>AI-Powered Workspace</h1>
        <p>Advanced assistants tailored for your academic and career success.</p>
      </motion.header>

      <motion.div 
        className="ai-agents-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {['pdf', 'lecture', 'career', 'interview', 'roadmap', 'flashcard', 'paper', 'doubts', 'plagiarism', 'tag'].map(tab => (
          <button 
            key={tab}
            className={`ai-tab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'pdf' && <FileText size={16} />}
            {tab === 'lecture' && <Zap size={16} />}
            {tab === 'career' && <Briefcase size={16} />}
            {tab === 'interview' && <MessageSquare size={16} />}
            {tab === 'roadmap' && <Map size={16} />}
            {tab === 'flashcard' && <LayoutIcon size={16} />}
            {tab === 'paper' && <FileText size={16} />}
            {tab === 'doubts' && <Lightbulb size={16} />}
            {tab === 'plagiarism' && <Search size={16} />}
            {tab === 'tag' && <LayoutIcon size={16} />}
            <span style={{ marginLeft: 6 }}>
              {tab === 'pdf' ? 'PDF Summarizer' : tab === 'plagiarism' ? 'Plagiarism Checker' : tab === 'tag' ? 'Auto-Tagger' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          </button>
        ))}
      </motion.div>

      <div className="ai-agents-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'pdf' && (
              <div className="agent-card">
                <div className="agent-title">
                  <Upload className="agent-icon" />
                  <h2>PDF Summarizer</h2>
                </div>
                <p className="agent-desc">Upload research papers or study material for instant analysis and insights.</p>
                <form onSubmit={handlePdfUpload} className="agent-form">
                  <div className="file-upload-box">
                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} id="pdf-upload" className="hidden-input" />
                    <label htmlFor="pdf-upload" className="upload-label">
                      <File className="upload-icon" size={40} />
                      <span>{pdfFile ? pdfFile.name : 'Click to select PDF'}</span>
                    </label>
                  </div>
                  <button type="submit" className="btn-primary full-width" disabled={pdfLoading}>
                    {pdfLoading ? <><Loader size={18} className="spin" /> {progressTexts['pdf'][pdfStep]}</> : 'Analyze PDF'}
                  </button>
                </form>
                {pdfResult && (
                  <motion.div className="result-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3>Report Summary</h3>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{pdfResult}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'lecture' && (
              <div className="agent-card">
                <div className="agent-title">
                  <Zap className="agent-icon" />
                  <h2>Lecture Study Pack</h2>
                </div>
                <p className="agent-desc">Convert raw lecture notes or transcripts into a complete study package (Summary + Cards + Quiz).</p>
                <form onSubmit={handleLectureProcess} className="agent-form">
                  <textarea className="input-field" rows={8} placeholder="Paste lecture transcript or your rough notes here..." value={lectureText} onChange={(e) => setLectureText(e.target.value)} />
                  <button type="submit" className="btn-primary full-width" disabled={lectureLoading}>
                    {lectureLoading ? <><Loader size={18} className="spin" /> {progressTexts['lecture'][lectureStep]}</> : 'Generate Study Pack'}
                  </button>
                </form>
                {lectureResult && (
                  <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="m-0"><Brain size={18} className="text-primary"/> Generated Flashcards</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lectureResult.flashcards.map((card, i) => (
                        <div key={i} className="flashcard-preview">
                          <div className="card-q"><span>Q</span> {card.front}</div>
                          <div className="card-a"><span>A</span> {card.back}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                       <h3 className="mb-4"><Check size={18} className="text-success"/> Quick Assessment</h3>
                       <div className="space-y-4">
                         {lectureResult.quizzes.map((q, i) => (
                           <div key={i} className="result-box mt-2">
                             <p className="font-bold"><strong>Q{i+1}: {q.question}</strong></p>
                             <ul className="mt-2" style={{ listStyle: 'none', padding: 0 }}>
                               {q.options.map((opt, oi) => (
                                 <li key={oi} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '4px', fontSize: '0.9rem' }}>
                                   {opt} {oi === q.correctAnswer && <Check size={14} style={{ color: 'var(--success)', float: 'right' }}/>}
                                 </li>
                               ))}
                             </ul>
                             <p className="mt-2 text-sm text-secondary italic">Note: {q.explanation}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            {activeTab === 'career' && (
              <div className="agent-card">
                <div className="agent-title">
                  <Search className="agent-icon" />
                  <h2>LinkedIn Career Scout</h2>
                </div>
                <p className="agent-desc">AI-powered opportunity detection based on your professional profile.</p>
                <form onSubmit={handleCareerScout} className="agent-form">
                  <textarea className="input-field career-textarea" placeholder="Paste your profile or experience here..." value={careerText} onChange={(e) => setCareerText(e.target.value)} rows={6}></textarea>
                  <button type="submit" className="btn-primary full-width" disabled={careerLoading}>
                    {careerLoading ? <><Loader size={18} className="spin" /> {progressTexts['career'][careerStep]}</> : 'Find Opportunities'}
                  </button>
                </form>
                {careerResult && (
                  <motion.div className="result-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3>Scout Report</h3>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{careerResult}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="agent-card">
                <div className="agent-title">
                  <MessageSquare className="agent-icon" />
                  <h2>Mock Interview Prep</h2>
                </div>
                <p className="agent-desc">Prepare for any role with tailored questions and live chat simulation.</p>
                <form onSubmit={handleInterviewPrep} className="agent-form">
                  <input type="text" className="input-field" placeholder="Target Role (e.g. SDE-1)" value={interviewTopic} onChange={(e) => setInterviewTopic(e.target.value)} disabled={isInterviewActive} />
                  {!isInterviewActive ? (
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="btn-primary flex-1" disabled={interviewLoading}>
                        {interviewLoading ? <><Loader size={18} className="spin" /> {progressTexts['interview'][interviewStep]}</> : 'Get Prep Kit'}
                      </button>
                      <button type="button" onClick={startInterview} disabled={!interviewTopic.trim()} className="btn-success flex-1">
                        Start Chat
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setIsInterviewActive(false)} className="btn-danger full-width mt-4">
                      Exit Session
                    </button>
                  )}
                </form>
                {isInterviewActive ? (
                  <div className="interview-chat-container mt-4">
                    <div className="chat-messages">
                      {interviewMessages.map((msg, i) => (
                        <div key={i} className={`chat-bubble ${msg.role === 'model' ? 'ai' : 'user'}`}>{msg.text}</div>
                      ))}
                      {isAiTyping && <div className="chat-bubble ai"><Loader size={14} className="spin" /> Thinking...</div>}
                    </div>
                    <form onSubmit={handleSendMessage} className="chat-input-area" style={{ display: 'flex', gap: 8 }}>
                      <input className="chat-input" placeholder="Your reply..." value={userMsg} onChange={(e) => setUserMsg(e.target.value)} style={{ flex: 1 }} />
                      <button type="button" onClick={startListening} className="chat-send-btn outline" disabled={isListening} title="Use Voice" style={{ background: isListening ? 'var(--error)' : 'transparent', color: isListening ? 'white' : 'var(--text-secondary)' }}>
                        <Mic size={18}/>
                      </button>
                      <button type="submit" className="chat-send-btn" disabled={!userMsg.trim() || isAiTyping}><Send size={18}/></button>
                    </form>
                  </div>
                ) : interviewResult && (
                  <motion.div className="result-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3>Preparation Guide</h3>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{interviewResult}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="agent-card">
                <div className="agent-title">
                  <Map className="agent-icon" />
                  <h2>Personalized Roadmap</h2>
                </div>
                <p className="agent-desc">Define your goal and get a structured, time-bound learning path.</p>
                <form onSubmit={handleGenerateRoadmap} className="agent-form">
                  <input className="input-field" placeholder="Goal (e.g. Master Calculus)" value={roadmapGoal} onChange={(e) => setRoadmapGoal(e.target.value)} />
                  <div className="form-row mt-2">
                    <select className="input-field" value={roadmapLevel} onChange={(e) => setRoadmapLevel(e.target.value)}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <input type="number" className="input-field" min="1" value={roadmapDuration} onChange={(e) => setRoadmapDuration(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary full-width mt-4" disabled={roadmapLoading}>
                    {roadmapLoading ? <><Loader size={18} className="spin" /> {progressTexts['roadmap'][roadmapStep]}</> : 'Create Roadmap'}
                  </button>
                </form>
                {roadmapResult && (
                  <motion.div className="roadmap-display" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="roadmap-title">{roadmapResult.title}</h3>
                    {roadmapResult.phases.map((phase, idx) => (
                      <div className="roadmap-phase" key={idx}>
                        <div className="phase-header">
                           <span className="phase-duration">{phase.duration}</span>
                           <h4 className="phase-title">{phase.title}</h4>
                        </div>
                        <p className="phase-desc">{phase.description}</p>
                        <div className="task-list">
                          {phase.tasks.map((task, i) => <div key={i} className="task-item"><Check size={14}/> {task}</div>)}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'flashcard' && (
               <div className="agent-card">
                 <div className="agent-title">
                   <LayoutIcon className="agent-icon" />
                   <h2>AI Flashcards</h2>
                 </div>
                 <p className="agent-desc">Extract active recall materials from your study notes instantly.</p>
                 <form onSubmit={handleGenerateFlashcards} className="agent-form">
                   <textarea className="input-field" rows={5} placeholder="Paste notes here..." value={flashcardText} onChange={(e) => setFlashcardText(e.target.value)} />
                   <button type="submit" className="btn-primary full-width mt-4" disabled={flashcardLoading}>
                     {flashcardLoading ? <><Loader size={18} className="spin" /> {progressTexts['flashcard'][flashcardStep]}</> : 'Generate Deck'}
                   </button>
                 </form>
                 {flashcardResult && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                     {flashcardResult.map((card, i) => (
                       <motion.div key={i} className="flashcard-preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                         <div className="card-q"><span>Front</span> {card.front}</div>
                         <div className="card-a"><span>Back</span> {card.back}</div>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </div>
            )}

            {activeTab === 'paper' && (
              <div className="agent-card">
                <div className="agent-title">
                  <FileText className="agent-icon" />
                  <h2>Question Paper AI</h2>
                </div>
                <p className="agent-desc">Generate rigorous assessment papers with marking schemes.</p>
                <form onSubmit={handleGeneratePaper} className="agent-form">
                  <input className="input-field" placeholder="Subject/Topic" value={paperTopic} onChange={(e) => setPaperTopic(e.target.value)} />
                  <div className="form-row mt-2">
                    <select className="input-field" value={paperDifficulty} onChange={(e) => setPaperDifficulty(e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <input type="number" className="input-field" value={paperMarks} onChange={(e) => setPaperMarks(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary full-width mt-4" disabled={paperLoading}>
                    {paperLoading ? <><Loader size={18} className="spin" /> {progressTexts['paper'][paperStep]}</> : 'Generate Paper'}
                  </button>
                </form>
                {paperResult && (
                  <motion.div className="result-box mt-8" initial={{ opacity: 0 }}>
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="m-0">Examination Document</h3>
                       <button onClick={() => window.print()} className="btn-outline btn-sm">Export/Print</button>
                    </div>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{paperResult}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'doubts' && (
              <div className="agent-card">
                <div className="agent-title">
                  <Lightbulb className="agent-icon" />
                  <h2>Instant Doubt Solver</h2>
                </div>
                <p className="agent-desc">Get detailed, expert explanations for any academic problem.</p>
                <form onSubmit={handleSolveDoubt} className="agent-form">
                  <textarea className="input-field" rows={4} placeholder="Describe your doubt or paste the question..." value={doubtText} onChange={(e) => setDoubtText(e.target.value)} />
                  
                  <div className="file-upload-box" style={{ padding: '1.5rem 1rem' }}>
                    <input type="file" accept="image/*" onChange={(e) => setDoubtImage(e.target.files[0])} id="doubt-upload" className="hidden-input" />
                    <label htmlFor="doubt-upload" className="upload-label">
                      <LayoutIcon className="upload-icon" size={24} />
                      <span>{doubtImage ? doubtImage.name : 'Or upload image/photo of the problem'}</span>
                    </label>
                  </div>

                  <button type="submit" className="btn-primary full-width mt-2" disabled={doubtLoading}>
                    {doubtLoading ? <><Loader size={18} className="spin" /> {progressTexts['doubts'][doubtStep]}</> : 'Explain Concept'}
                  </button>
                </form>
                {doubtResult && (
                  <motion.div className="result-box mt-8" initial={{ opacity: 0 }}>
                    <h3>Expert Insight</h3>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{doubtResult}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'plagiarism' && (
              <div className="agent-card">
                <div className="agent-title">
                  <Search className="agent-icon" />
                  <h2>AI Plagiarism & Integrity Checker</h2>
                </div>
                <p className="agent-desc">Detect if content was likely generated by LLMs like ChatGPT or is human-written.</p>
                <form onSubmit={handlePlagiarismCheck} className="agent-form">
                  <textarea className="input-field" rows={8} placeholder="Paste document text here to scan for AI generation..." value={plagiarismText} onChange={(e) => setPlagiarismText(e.target.value)} />
                  <button type="submit" className="btn-primary full-width" disabled={plagiarismLoading}>
                    {plagiarismLoading ? <><Loader size={18} className="spin" /> Scanning Fingerprints...</> : 'Scan for Integrity'}
                  </button>
                </form>
                {plagiarismResult && (
                  <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <div className="result-box mt-2" style={{ borderColor: plagiarismResult.aiProbabilityScore > 50 ? 'var(--error)' : 'var(--success)' }}>
                        <h3 style={{ color: plagiarismResult.aiProbabilityScore > 50 ? 'var(--error)' : 'var(--success)' }}>
                           Verdict: {plagiarismResult.verdict} ({plagiarismResult.aiProbabilityScore}% AI Probability)
                        </h3>
                        <p className="mt-2 text-sm">{plagiarismResult.analysis}</p>
                        {plagiarismResult.flaggedPhrases?.length > 0 && (
                          <div className="mt-4">
                            <strong>Flagged Phrasing:</strong>
                            <ul className="mt-2" style={{ listStyleType: 'disc', paddingLeft: 20 }}>
                              {plagiarismResult.flaggedPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                            </ul>
                          </div>
                        )}
                     </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'tag' && (
              <div className="agent-card">
                <div className="agent-title">
                  <LayoutIcon className="agent-icon" />
                  <h2>Smart Document Tagger</h2>
                </div>
                <p className="agent-desc">Use Semantic NLP to automatically generate taxonomy and tags for raw content.</p>
                <form onSubmit={handleAutoTag} className="agent-form">
                  <textarea className="input-field" rows={6} placeholder="Paste document content or abstract..." value={tagText} onChange={(e) => setTagText(e.target.value)} />
                  <button type="submit" className="btn-primary full-width" disabled={tagLoading}>
                    {tagLoading ? <><Loader size={18} className="spin" /> Extracting Semantic Entities...</> : 'Generate Metadata'}
                  </button>
                </form>
                {tagResult && (
                  <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <div className="result-box mt-2 flex flex-col gap-3">
                        <p><strong>Primary Category:</strong> {tagResult.primaryCategory}</p>
                        <p><strong>Specific Topic:</strong> {tagResult.topic}</p>
                        <p><strong>Content Difficulty:</strong> {tagResult.difficulty}</p>
                        <div className="mt-2">
                          <strong>Semantic Tags Generated:</strong>
                          <div className="flex gap-2 flex-wrap mt-2">
                             {tagResult.tags?.map((tag, i) => (
                               <span key={i} style={{ background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold' }}>#{tag}</span>
                             ))}
                          </div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-12 mb-4">
        <button 
          className="btn-primary" 
          onClick={() => setShowHistoryTable(!showHistoryTable)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <History size={18} />
          {showHistoryTable ? 'Hide History' : 'Show History'}
        </button>
      </div>

      <AnimatePresence>
        {showHistoryTable && (
          <motion.div 
            className="history-section mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="history-header">
              <History className="text-primary" size={24} />
              <h2>Agent Activity History</h2>
            </div>
            
            {history.length > 0 ? (
              <div className="ai-history-table-container">
                <table className="ai-history-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Date & Time</th>
                      <th>Agent Type</th>
                      <th>Input</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={item._id}>
                        <td>{user?.email || 'User Email'}</td>
                        <td>
                          {new Date(item.createdAt).toLocaleDateString()} <br />
                          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {item.agentType.includes('PDF') && <FileText size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('CAREER') && <Briefcase size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('INTERVIEW') && <MessageSquare size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('ROADMAP') && <Map size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('FLASHCARD') && <LayoutIcon size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('PAPER') && <FileText size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('DOUBT') && <Lightbulb size={16} style={{ color: 'var(--accent)' }} />}
                            {item.agentType.includes('LECTURE') && <Zap size={16} style={{ color: 'var(--accent)' }} />}
                            {agentLabels[item.agentType] || 'AI Transaction'}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.inputText}>
                            {item.inputText}
                          </div>
                        </td>
                        <td>
                          <button className="btn-outline btn-sm" onClick={() => setSelectedHistoryItem(item)}>
                            View Result
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No history found for your account ({user?.email}). Start using the AI Agents!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {renderHistoryModal()}

      {/* Upgrade Modal */}
      <AnimatePresence>
        {(showUpgradeModal || (user?.aiUsageCount >= 10 && !user?.isPremium)) && (
          <motion.div 
            className="history-modal-overlay"
            style={{ zIndex: 2000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-header" style={{ position: 'absolute', top: 20, right: 20, border: 'none' }}>
               <button className="close-btn" onClick={() => setShowUpgradeModal(false)}><X size={24}/></button>
            </div>
            <div style={{ width: '100%', maxWidth: 600, padding: 20 }}>
               <SubscriptionCard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
