import React, { useState } from 'react';
import { HelpCircle, Layers, CheckCircle, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import './StudyTools.css';

export default function StudyTools({ quizzes = [], flashcards = [] }) {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' or 'flashcards'
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Set default tab based on what's available
  React.useEffect(() => {
    if (quizzes.length === 0 && flashcards.length > 0) {
      setActiveTab('flashcards');
    }
  }, [quizzes, flashcards]);

  const handleOptionSelect = (index) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === quizzes[currentQuizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  if (quizzes.length === 0 && flashcards.length === 0) return null;

  return (
    <div className="study-tools-container fade-in">
      <div className="study-tools-header">
        <h2 className="study-tools-title">AI Study Aids</h2>
        <div className="study-tools-tabs">
          {quizzes.length > 0 && (
            <button 
              className={`tool-tab ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              <HelpCircle size={18} /> Interactive Quiz
            </button>
          )}
          {flashcards.length > 0 && (
            <button 
              className={`tool-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setActiveTab('flashcards')}
            >
              <Layers size={18} /> Flashcards
            </button>
          )}
        </div>
      </div>

      <div className="study-tools-content">
        {activeTab === 'quiz' && quizzes.length > 0 && (
          <div className="quiz-section">
            {!quizFinished ? (
              <div className="quiz-card fade-in">
                <div className="quiz-progress">
                  Question {currentQuizIndex + 1} of {quizzes.length}
                </div>
                <h3 className="quiz-question">{quizzes[currentQuizIndex].question}</h3>
                <div className="quiz-options">
                  {quizzes[currentQuizIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`option-btn ${selectedOption === idx ? (idx === quizzes[currentQuizIndex].correctAnswer ? 'correct' : 'incorrect') : (showExplanation && idx === quizzes[currentQuizIndex].correctAnswer ? 'correct' : '')}`}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={showExplanation}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {showExplanation && (
                  <div className="explanation-box fade-in">
                    <p className="explanation-text">
                      <strong>{selectedOption === quizzes[currentQuizIndex].correctAnswer ? 'Correct!' : 'Incorrect.'}</strong> {quizzes[currentQuizIndex].explanation}
                    </p>
                    <button className="btn-primary next-btn" onClick={nextQuestion}>
                      {currentQuizIndex < quizzes.length - 1 ? 'Next Question' : 'Finish Quiz'} <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="quiz-results fade-in">
                <CheckCircle size={64} className="success-icon" />
                <h3>Quiz Completed!</h3>
                <p>You scored <strong>{quizScore}</strong> out of <strong>{quizzes.length}</strong></p>
                <button className="btn-primary" onClick={resetQuiz}>
                  <RefreshCw size={18} /> Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flashcards' && flashcards.length > 0 && (
          <div className="flashcards-section fade-in">
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={() => {
                setIsFlipped(!isFlipped)
              }}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <p>{flashcards[currentCardIndex].front}</p>
                  <span className="hint">Click to flip</span>
                </div>
                <div className="flashcard-back">
                  <p>{flashcards[currentCardIndex].back}</p>
                  <span className="hint">Click to flip back</span>
                </div>
              </div>
            </div>
            <div className="flashcard-controls">
              <button 
                className="control-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsFlipped(false); 
                  setCurrentCardIndex(prev => Math.max(0, prev - 1)) 
                }}
                disabled={currentCardIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="card-counter">{currentCardIndex + 1} / {flashcards.length}</span>
              <button 
                className="control-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsFlipped(false); 
                  setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1)) 
                }}
                disabled={currentCardIndex === flashcards.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
