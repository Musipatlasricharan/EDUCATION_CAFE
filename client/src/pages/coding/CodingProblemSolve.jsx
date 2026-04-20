import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../contexts/AuthContext';
import { Play, Send, CheckCircle, Clock, Zap, BookOpen, Lock, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CodingProblemSolve = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [id, user]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab]);

  const fetchSubmissions = async () => {
    try {
      setFetchingSubmissions(true);
      const res = await api.get(`/coding/problems/${id}/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSubmissions(false);
    }
  };

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/coding/problems/${id}`);
      if (res.data.success) {
        const p = res.data.data;
        setProblem(p);
        setCode(p.starterCode?.python || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(problem.starterCode?.[lang] || '');
  };

  const executeCode = async (action) => {
    if (!user) return alert("Please log in to submit code.");
    setLoading(true);
    setOutput(null);
    try {
      const endpoint = `/coding/problems/${id}/${action}`;
      const res = await api.post(endpoint, { language, code });
      
      if (res.data.success) {
        setOutput(res.data.data);
        if (action === 'submit') {
          fetchSubmissions();
          if (res.data.data.verdict === 'Accepted ✅') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 && err.response?.data?.isLimitReached) {
        setShowLimitModal(true);
      } else {
        alert(err.response?.data?.message || 'Execution failed!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!problem) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: '#fff' }}>
      <div className="spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ height: '100vh', paddingTop: '72px', display: 'flex', backgroundColor: '#0a0a0a', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
      
      {/* Confetti Overlay Concept (Simplified with CSS) */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
      )}
      
      {/* LEFT PANEL */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
          {['description', 'submissions', 'editorial'].map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{
              padding: '16px 28px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: 'transparent', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
            }}
            onMouseEnter={e => {
              if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-primary)';
              if (activeTab !== tab) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={e => {
              if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-secondary)';
              if (activeTab !== tab) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            >
              {tab === 'description' && <BookOpen size={16}/>}
              {tab === 'submissions' && <CheckCircle size={16}/>}
              {tab === 'editorial' && <Zap size={16}/>}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'description' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{problem.title}</h1>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                  backgroundColor: problem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: problem.difficulty === 'Easy' ? 'var(--success)' : problem.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'
                }}>
                  {problem.difficulty}
                </span>
              </div>
              
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }} className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
              </div>

              {(problem.timeComplexity || problem.spaceComplexity) && (
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', fontSize: '14px' }}>
                  {problem.timeComplexity && <div style={{ marginBottom: problem.spaceComplexity ? '8px' : 0 }}><strong style={{ color: 'var(--accent)' }}>Time Complexity:</strong> {problem.timeComplexity}</div>}
                  {problem.spaceComplexity && <div><strong style={{ color: 'var(--accent)' }}>Space Complexity:</strong> {problem.spaceComplexity}</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'editorial' && (
            <div>
               {problem.editorialLocked ? (
                 <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                   <Lock style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} size={48} />
                   <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Editorial Locked</h3>
                   <p style={{ color: 'var(--text-secondary)' }}>Solve the problem or attempt it 3 times to unlock the solution.</p>
                 </div>
               ) : (
                 <div className="markdown-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.editorial}</ReactMarkdown>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {fetchingSubmissions ? (
                 <div style={{ textAlign: 'center', padding: '100px 0' }}>
                   <Loader size={40} className="spin" color="var(--accent)" />
                   <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>Retrieving history...</p>
                 </div>
               ) : submissions.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed var(--border)' }}>
                   <div style={{ width: 64, height: 64, borderRadius: '22px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                     <Clock style={{ color: 'var(--text-muted)' }} size={32} />
                   </div>
                   <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>No attempts yet</h3>
                   <p style={{ color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto', fontSize: '15px', lineHeight: 1.5 }}>Push your code to the limits and track your progress here.</p>
                 </div>
               ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submissions.map((sub) => (
                    <div key={sub._id} className="card glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ 
                            fontSize: '12px', fontWeight: 900, padding: '6px 14px', borderRadius: '10px', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.5px',
                            backgroundColor: sub.verdict === 'Accepted ✅' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                            color: sub.verdict === 'Accepted ✅' ? '#10b981' : '#ef4444',
                            border: `1px solid ${sub.verdict === 'Accepted ✅' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                          }}>
                            {sub.verdict}
                          </div>
                          <div style={{ marginTop: 8, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{new Date(sub.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Runtime</span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{sub.runtime} <small style={{ fontWeight: 400, opacity: 0.6 }}>ms</small></span>
                        </div>
                      </div>
                      
                      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0 0 16px 0', opacity: 0.5 }} />
                      
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>Language:</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{sub.language.toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>Memory:</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sub.memory || 0} <small>kb</small></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
               )}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL - EDITOR & TERMINAL */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        {/* Editor Toolbar */}
        <div style={{ height: '48px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', backgroundColor: 'var(--bg-secondary)' }}>
          <select value={language} onChange={handleLanguageChange} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', borderRadius: '4px', padding: '4px 8px', outline: 'none', cursor: 'pointer' }}>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={() => executeCode('run')} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', padding: '6px 16px', borderRadius: '4px', transition: 'background 0.2s', opacity: loading ? 0.5 : 1 }}>
               <Play size={14}/> Run
             </button>
             <button onClick={() => executeCode('submit')} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--success)', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '4px', transition: 'background 0.2s', opacity: loading ? 0.5 : 1 }}>
               <Send size={14}/> Submit
             </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1, backgroundColor: '#1e1e1e' }}>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Output Console - The "Terminal" */}
        <div style={{ height: '35%', borderTop: '4px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px' }}>CONSOLE</span>
            {loading && <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>Running Code...</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
            {!output && !loading && <span style={{ color: 'var(--text-secondary)' }}>Run code to see output here.</span>}
            
            {/* If Submit Object */}
            {output?.verdict && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: output.verdict === 'Accepted ✅' ? 'var(--success)' : 'var(--danger)' }}>
                  {output.verdict}
                </h3>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Runtime: <strong style={{ color: 'var(--text-primary)' }}>{output.runtime} ms</strong></span>
                  <span>Memory: <strong style={{ color: 'var(--text-primary)' }}>{output.memory} KB</strong></span>
                </div>
                {output.testResultDetails?.map((tr, i) => (
                  <div key={i} style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Test Case {i+1} {tr.isHidden && '(Hidden)'}</span>
                    <span style={{ color: tr.passed ? 'var(--success)' : 'var(--danger)' }}>{tr.passed ? 'Passed' : 'Failed'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* If Run Array (Test Case results) */}
            {Array.isArray(output) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 {output.map((res, i) => (
                   <div key={i} className="glass" style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                     <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: 13, fontWeight: 700 }}>Test Case {i+1}</span>
                       <span style={{ 
                         fontSize: 11, fontWeight: 900, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px',
                         backgroundColor: res.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                         color: res.passed ? 'var(--success)' : 'var(--danger)'
                       }}>
                         {res.verdict}
                       </span>
                     </div>
                     <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Input</div>
                         <pre style={{ backgroundColor: '#1a1a1a', padding: '12px', borderRadius: '8px', fontSize: '13px', margin: 0, border: '1px solid #333', color: '#ccc' }}>{res.input}</pre>
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Expected</div>
                            <pre style={{ backgroundColor: '#1a1a1a', padding: '12px', borderRadius: '8px', fontSize: '13px', margin: 0, border: '1px solid #333', color: '#ccc' }}>{res.expectedOutput}</pre>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Your Output</div>
                            <pre style={{ backgroundColor: res.passed ? '#1a2e1a' : '#2e1a1a', padding: '12px', borderRadius: '8px', fontSize: '13px', margin: 0, border: '1px solid ' + (res.passed ? '#10b98133' : '#ef444433'), color: res.passed ? '#10b981' : '#ef4444' }}>{res.actualOutput || res.error || 'No output'}</pre>
                          </div>
                       </div>
                       {(res.cpuTime || res.memory) && (
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', gap: '16px' }}>
                           <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{res.cpuTime}s</strong></span>
                           <span>Memory: <strong style={{ color: 'var(--text-primary)' }}>{res.memory}kb</strong></span>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trial Limit Modal */}
      {showLimitModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '450px', backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center', position: 'relative' }}>
             <div style={{ width: 80, height: 80, borderRadius: '24px', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Zap size={40} style={{ color: '#f59e0b' }} fill="#f59e0b" />
             </div>
             <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Free Trials Exhausted</h2>
             <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
                You've used your 5 free coding trials. To continue solving problems and using our execution engine, please upgrade to a Premium plan.
             </p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/settings" className="btn-primary" style={{ padding: '14px', borderRadius: '14px', textDecoration: 'none', display: 'block' }}>
                   View Membership Options
                </Link>
                <button onClick={() => setShowLimitModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '10px' }}>
                   Maybe Later
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CodingProblemSolve;
