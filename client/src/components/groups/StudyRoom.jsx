import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Monitor, Users, Edit3, Bot, Send, Loader, Sparkles, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../lib/axios';
import EngageRoom from './EngageRoom';

export default function StudyRoom({ groupId, group, socket, user }) {
  // ─── Engage Room ───────────────────────────────────────────────────
  const [engageOpen, setEngageOpen] = useState(false);

  // ─── Timer State ─────────────────────────────────────────────────
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'

  // ─── Chat State (ALL declared here before any use) ────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hi there! I\'m your AI Study Buddy. Ask me anything while you study! 🎓' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // ─── Fetch persisted chat history on room join ────────────────────
  useEffect(() => {
    if (!groupId) return;
    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/ai/typed-history?agentType=STUDY_BUDDY&groupId=${groupId}`);
        if (res.data.history && res.data.history.length > 0) {
          const formattedHistory = res.data.history.flatMap(h => [
            { role: 'user', text: h.inputText, senderName: h.metadata?.senderName },
            { role: 'model', text: h.result }
          ]);
          setChatHistory([
            { role: 'model', text: 'Hi there! I\'m your AI Study Buddy. Ask me anything while you study! 🎓' },
            ...formattedHistory
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchChatHistory();
  }, [groupId]);

  // ─── Auto-scroll chat to bottom ──────────────────────────────────
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // ─── Socket: timer sync + AI chat sync ───────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleTimerUpdate = (data) => {
      if (data.senderId !== user._id) {
        setTimer(data.timer);
        setIsActive(data.isActive);
        setMode(data.mode);
      }
    };

    const handleAiChatUpdate = (message) => {
      setChatHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.text === message.text && last.role === message.role) return prev;
        return [...prev, message];
      });
    };

    socket.on('study_timer_updated', handleTimerUpdate);
    socket.on('ai_chat_updated', handleAiChatUpdate);

    return () => {
      socket.off('study_timer_updated', handleTimerUpdate);
      socket.off('ai_chat_updated', handleAiChatUpdate);
    };
  }, [socket, user._id]);

  // ─── Pomodoro timer countdown ─────────────────────────────────────
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsActive(false);
      if (mode === 'work') {
        setMode('break');
        setTimer(5 * 60);
      } else {
        setMode('work');
        setTimer(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timer, mode]);

  // ─── Timer actions ────────────────────────────────────────────────
  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    socket?.emit('sync_study_timer', { groupId, timer, isActive: nextState, mode });
  };

  const resetTimer = () => {
    const nextTimer = mode === 'work' ? 25 * 60 : 5 * 60;
    setIsActive(false);
    setTimer(nextTimer);
    socket?.emit('sync_study_timer', { groupId, timer: nextTimer, isActive: false, mode });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── AI Chat send ─────────────────────────────────────────────────
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    setChatInput('');

    const userMessageObj = { role: 'user', text: userMsg, senderName: user?.name || 'You' };
    setChatHistory(prev => [...prev, userMessageObj]);
    socket?.emit('sync_ai_chat', { groupId, message: userMessageObj });
    setIsTyping(true);

    try {
      const res = await api.post('/ai/study-chat', {
        history: chatHistory.map(m => ({ role: m.role, text: m.text })),
        userMessage: userMsg,
        groupId
      });
      const aiMessageObj = { role: 'model', text: res.data.data };
      setChatHistory(prev => [...prev, aiMessageObj]);
      socket?.emit('sync_ai_chat', { groupId, message: aiMessageObj });
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: '⚠️ Sorry, I ran into an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <>
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32, height: '100%', overflowY: 'auto' }}>

      {/* Top Row: Timer + Sidebar */}
      <div style={{ display: 'flex', gap: 24 }}>

        {/* Pomodoro Timer */}
        <div className="card" style={{
          flex: 1, padding: 40, textAlign: 'center',
          backgroundColor: mode === 'work' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)',
          border: `2px solid ${mode === 'work' ? 'var(--accent)' : 'var(--success)'}`,
          borderRadius: 24
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: mode === 'work' ? 'var(--accent)' : 'var(--success)', marginBottom: 20 }}>
            {mode === 'work' ? '🔥 Focus Session' : '☕ Short Break'}
          </h2>
          <div style={{ fontSize: 84, fontWeight: 900, fontFamily: 'monospace', marginBottom: 24, color: 'var(--text-primary)' }}>
            {formatTime(timer)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button onClick={toggleTimer} className="btn-primary" style={{ padding: '12px 32px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: isActive ? 'var(--danger)' : 'var(--accent)', border: 'none' }}>
              {isActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start Focus</>}
            </button>
            <button onClick={resetTimer} className="btn-primary" style={{ padding: '12px 20px', borderRadius: 14, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Users size={18} /> Studying Now
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || 'You'} (You)</span>
            </div>
          </div>

          <div className="card" style={{ padding: 24, borderRadius: 20, border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.04), transparent)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Video size={18} color='#10b981' /> Engage Room
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              Join a live video/audio room with all online group members. Share your screen, raise your hand, and chat in real time.
            </p>
            <button
              onClick={() => setEngageOpen(true)}
              className="btn-primary"
              style={{
                width: '100%', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0'
              }}
            >
              <Video size={16} /> Start / Join Live Room
            </button>
          </div>
        </div>
      </div>

      {/* Collaborative Whiteboard */}
      <div className="card" style={{ padding: 0, borderRadius: 24, overflow: 'hidden', minHeight: 800, border: '1px solid var(--border)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Edit3 size={18} /> Collaborative Whiteboard
          </h3>
          <span style={{ fontSize: 12, padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 20 }}>Live Interaction</span>
        </div>
        <iframe
          src={`https://wbo.ophir.dev/boards/educafe-group-${groupId}`}
          style={{ width: '100%', height: 'calc(100% - 56px)', border: 'none', minHeight: 750 }}
          title="Collaborative Whiteboard"
        />
      </div>

      {/* Floating AI Chat Button + Panel */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* FAB Button */}
          <motion.button
            onClick={() => setIsChatOpen(!isChatOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'fixed', bottom: 40, right: 40,
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none',
              boxShadow: '0 12px 40px rgba(99,102,241,0.4)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer', zIndex: 99999
            }}
          >
            {isChatOpen ? <X size={28} /> : <Bot size={28} />}
          </motion.button>

          {/* AI Chat Panel */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  position: 'fixed', bottom: 120, right: 40,
                  width: 440, height: 680,
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 24,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                  border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column',
                  overflow: 'hidden', zIndex: 99999
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))'
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', margin: 0 }}>
                    <Bot size={18} /> AI Study Buddy
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={14} style={{ color: 'var(--accent)', opacity: 0.7 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Gemini Powered</span>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: msg.role === 'model' ? 'flex-start' : 'flex-end',
                        maxWidth: '85%',
                        backgroundColor: msg.role === 'model' ? 'var(--bg-secondary)' : 'var(--accent)',
                        color: msg.role === 'model' ? 'var(--text-primary)' : '#fff',
                        border: msg.role === 'model' ? '1px solid var(--border)' : 'none',
                        borderRadius: 16,
                        borderBottomLeftRadius: msg.role === 'model' ? 4 : 16,
                        borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                        padding: '10px 14px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {msg.senderName && msg.role === 'user' && (
                        <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: 4, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {msg.senderName}
                        </div>
                      )}
                      {msg.role === 'model' ? (
                        <div className="markdown-body" style={{ fontSize: 13, background: 'transparent' }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div style={{
                      alignSelf: 'flex-start', padding: '10px 14px',
                      backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: 16, borderBottomLeftRadius: 4,
                      display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)'
                    }}>
                      <Loader size={14} className="spin" /> Thinking...
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendChat} style={{
                  padding: '12px 16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex', gap: 8,
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything..."
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 20,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                      outline: 'none', fontSize: 14
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isTyping}
                    className="btn-primary"
                    style={{ padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', opacity: (!chatInput.trim() || isTyping) ? 0.5 : 1 }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>

    {/* Engage Room Overlay */}
    {engageOpen && (
      <EngageRoom
        groupId={groupId}
        group={group}
        socket={socket}
        user={user}
        onClose={() => setEngageOpen(false)}
      />
    )}
    </>
  );
}
