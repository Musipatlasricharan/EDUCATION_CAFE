import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Monitor, Users, Edit3, Bot, Send, Loader, Sparkles, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../lib/axios';

export default function StudyRoom({ groupId, socket, user }) {
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [isChatOpen, setIsChatOpen] = useState(false);

  // AI Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hi there! I am your AI Study Buddy. Feel free to ask me any questions or doubts while you study today!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = React.useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await api.post('/ai/study-chat', {
        history: chatHistory.slice(1),
        userMessage: userMsg
      });
      setChatHistory(prev => [...prev, { role: 'model', text: res.data.data }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Sorry, I ran into an error. Please ask again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data) => {
      // Only update if someone else changed it
      if (data.senderId !== user._id) {
        setTimer(data.timer);
        setIsActive(data.isActive);
        setMode(data.mode);
      }
    };

    socket.on('study_timer_updated', handleUpdate);
    return () => socket.off('study_timer_updated', handleUpdate);
  }, [socket, user._id]);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
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

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Timer Card */}
        <div className="card" style={{ flex: 1, padding: 40, textAlign: 'center', backgroundColor: mode === 'work' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)', borderStyle: 'solid', borderWidth: '2px', borderColor: mode === 'work' ? 'var(--accent)' : 'var(--success)', borderRadius: '24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: mode === 'work' ? 'var(--accent)' : 'var(--success)', marginBottom: 20 }}>
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

        {/* Sidebar */}
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Users size={18} /> Studying Now
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user.name.charAt(0)}</div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{user.name} (You)</span>
               </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
             <h3 style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
               <Monitor size={18} /> Virtual Presence
             </h3>
             <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Join the group video call or screen share for better collaboration.</p>
             <button className="btn-primary" style={{ width: '100%', borderRadius: 12, fontSize: 13 }}>Engage Room</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, borderRadius: 24, overflow: 'hidden', minHeight: 800, border: '1px solid var(--border)' }}>
         <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Edit3 size={18} /> Collaborative Whiteboard
            </h3>
            <span style={{ fontSize: 12, padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 20 }}>Live Interaction</span>
         </div>
         <iframe 
            src={`https://wbo.ophir.dev/boards/educafe-group-${groupId}`} 
            style={{ width: '100%', height: 'calc(100% - 56px)', border: 'none' }}
         ></iframe>
      </div>

      {/* Floating Chat Portal */}
      {typeof document !== 'undefined' && createPortal(
        <>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 99999,
            transition: 'transform 0.2s',
            transform: isChatOpen ? 'scale(0.9)' : 'scale(1)',
          }}
        >
           {isChatOpen ? <X size={32} /> : <Bot size={32} />}
        </button>

        {/* Floating AI Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              style={{
                position: 'fixed',
                bottom: 130,
                right: 40,
                width: 450,
                height: 700,
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 24,
                boxShadow: '0 16px 50px rgba(0,0,0,0.35)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 99999
              }}
            >
             <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)' }}>
                   <Bot size={18} /> AI Study Buddy
                </h3>
                <Sparkles size={14} className="text-accent" />
             </div>
             
             <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ 
                    alignSelf: msg.role === 'model' ? 'flex-start' : 'flex-end', 
                    maxWidth: '85%',
                    backgroundColor: msg.role === 'model' ? 'var(--card-bg)' : 'var(--accent)',
                    color: msg.role === 'model' ? 'var(--text-primary)' : '#fff',
                    border: msg.role === 'model' ? '1px solid var(--border)' : 'none',
                    borderRadius: 16,
                    borderBottomLeftRadius: msg.role === 'model' ? 4 : 16,
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {msg.role === 'model' ? (
                       <div className="markdown-body" style={{ fontSize: 13, background: 'transparent' }}>
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                       </div>
                    ) : (
                       <div style={{ fontSize: 14 }}>{msg.text}</div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div style={{ alignSelf: 'flex-start', padding: '12px 16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                    <Loader size={14} className="spin" /> Thinking...
                  </div>
                )}
                <div ref={chatBottomRef} />
             </div>

             <form onSubmit={handleSendChat} style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, backgroundColor: 'var(--bg-secondary)' }}>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="Ask me a doubt..." 
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 20, border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <button disabled={!chatInput.trim() || isTyping} type="submit" className="btn-primary" style={{ padding: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', opacity: (!chatInput.trim() || isTyping) ? 0.5 : 1 }}>
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
  );
}
