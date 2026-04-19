import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Search, UserPlus, Star, MessageCircle, CheckCircle,
  Loader, BookOpen, Clock, Users, Zap, Filter, X,
  TrendingUp, Award, ChevronRight, Globe, Wifi, FileText
} from 'lucide-react';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'English', 'History'];

const StatCard = ({ icon, value, label, color }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-p-lg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 14, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
    </div>
  </div>
);

const TutorCard = ({ tutor, onRequest }) => {
  const modeVal = tutor.mode?.toLowerCase();
  const modeColor = modeVal === 'online' ? '#10b981' : modeVal === 'offline' ? '#f59e0b' : '#6366f1';
  const modeIcon = modeVal === 'online' ? <Wifi size={11} /> : modeVal === 'offline' ? <Globe size={11} /> : <Globe size={11} />;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex',
      flexDirection: 'column', gap: 16, transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative', overflow: 'hidden'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--accent-gradient)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 20, fontWeight: 800, flexShrink: 0
        }}>
          {tutor.tutor?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tutor.tutor?.name}
            </h3>
            <CheckCircle size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tutor.tutor?.college || 'University Student'}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(245,158,11,0.1)', padding: '4px 8px',
          borderRadius: 20, flexShrink: 0
        }}>
          <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>{tutor.rating || '4.8'}</span>
        </div>
      </div>

      <div>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--accent)',
          background: 'rgba(99,102,241,0.08)', padding: '3px 10px',
          borderRadius: 20
        }}>{tutor.subject}</span>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tutor.description}
        </p>
        {tutor.experience && (
           <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 8, borderLeft: '3px solid var(--success)' }}>
             <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
               <strong>Experience:</strong> {tutor.experience}
             </p>
           </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(tutor.topics || []).slice(0, 4).map((topic, i) => (
          <span key={i} style={{
            fontSize: 11, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 20,
            padding: '3px 10px', color: 'var(--text-secondary)', fontWeight: 500
          }}>{topic}</span>
        ))}
        {(tutor.topics || []).length > 4 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 6px' }}>+{tutor.topics.length - 4}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: modeColor, fontSize: 12, fontWeight: 600 }}>
            {modeIcon} {tutor.mode ? tutor.mode.charAt(0).toUpperCase() + tutor.mode.slice(1) : ''}
          </div>
          {tutor.availability && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
              <Clock size={11} /> {tutor.availability}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tutor.resumeUrl && (
            <button
              onClick={() => window.open(tutor.resumeUrl, '_blank')}
              style={{
                background: 'transparent', color: 'var(--accent)',
                border: '1px solid var(--accent)', borderRadius: 10, padding: '8px 12px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
            >
              <FileText size={13} /> Resume
            </button>
          )}
          <button
            onClick={() => onRequest(tutor._id)}
            style={{
              background: 'var(--accent-gradient)', color: '#fff',
              border: 'none', borderRadius: 10, padding: '8px 16px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            <MessageCircle size={13} /> Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PeerTutoring() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  const [formData, setFormData] = useState({
    subject: '', topics: '', description: '', mode: 'online', availability: '', experience: '', resumeUrl: ''
  });

  useEffect(() => { fetchTutors(); }, []);

  const fetchTutors = async () => {
    try {
      const res = await api.get('/tutoring/tutors');
      setTutors(res.data.data || []);
    } catch {
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await api.post('/tutoring/register', {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim())
      });
      toast.success('Registered successfully as a tutor!');
      setActiveTab('browse');
      fetchTutors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleRequest = async (tutorId) => {
    try {
      await api.post(`/tutoring/request/${tutorId}`, { message: 'I would like to request a tutoring session.' });
      toast.success('Request sent to tutor!');
    } catch {
      toast.error('Failed to send request');
    }
  };

  const filteredTutors = tutors.filter(t => {
    const matchesSearch = !search || t.tutor?.name?.toLowerCase().includes(search.toLowerCase()) || t.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
    const matchesMode = selectedMode === 'All' || (t.mode && t.mode.toLowerCase() === selectedMode.toLowerCase());
    return matchesSearch && matchesSubject && matchesMode;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Users size={22} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Peer Tutoring</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Connect with expert student tutors or share your knowledge with peers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-secondary)', padding: 4, borderRadius: 14, border: '1px solid var(--border)' }}>
          {['browse', 'become'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: activeTab === tab ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.25s ease', border: 'none', cursor: 'pointer'
            }}>
              {tab === 'browse' ? '🔍 Find a Tutor' : '✨ Become a Tutor'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={<Users size={22}/>} value={tutors.length} label="Active Tutors" color="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard icon={<BookOpen size={22}/>} value="12+" label="Subjects Covered" color="linear-gradient(135deg,#06b6d4,#0ea5e9)" />
        <StatCard icon={<Star size={22}/>} value="4.8★" label="Avg. Rating" color="linear-gradient(135deg,#f59e0b,#f97316)" />
        <StatCard icon={<TrendingUp size={22}/>} value="95%" label="Success Rate" color="linear-gradient(135deg,#10b981,#059669)" />
      </div>

      {activeTab === 'browse' ? (
        <div>
          {/* Search & Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, subject..."
                className="input-field" style={{ paddingLeft: 42 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {['All', 'Online', 'Offline', 'Both'].map(mode => (
                <button key={mode} onClick={() => setSelectedMode(mode)} style={{
                  padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                  whiteSpace: 'nowrap', cursor: 'pointer',
                  background: selectedMode === mode ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                  color: selectedMode === mode ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${selectedMode === mode ? 'transparent' : 'var(--border)'}`,
                  transition: 'all 0.2s'
                }}>{mode}</button>
              ))}
            </div>
          </div>

          {/* Subject chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
            {SUBJECTS.map(subj => (
              <button key={subj} onClick={() => setSelectedSubject(subj)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer',
                background: selectedSubject === subj ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: selectedSubject === subj ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${selectedSubject === subj ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.2s'
              }}>{subj}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <Loader size={40} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Finding tutors for you...</p>
              </div>
            </div>
          ) : (
            <>
              {filteredTutors.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {filteredTutors.map(t => <TutorCard key={t._id} tutor={t} onRequest={handleRequest} />)}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '80px 20px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)'
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--bg-secondary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                  }}>
                    <Users size={36} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No tutors found</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                    {search ? 'Try adjusting your search' : 'Be the first to register as a tutor!'}
                  </p>
                  <button onClick={() => setActiveTab('become')} style={{
                    background: 'var(--accent-gradient)', color: '#fff',
                    padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14,
                    cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8
                  }}>
                    <Zap size={16} /> Become a Tutor
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            boxShadow: 'var(--shadow-p-lg)'
          }}>
            {/* Form Header */}
            <div style={{
              background: 'var(--accent-gradient)', padding: '28px 32px',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Award size={24} />
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create Your Tutor Profile</h2>
              </div>
              <p style={{ fontSize: 13, opacity: 0.85 }}>Share your expertise and help fellow students succeed.</p>
            </div>

            <form onSubmit={handleRegister} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Primary Subject *
                  </label>
                  <input
                    required className="input-field"
                    placeholder="e.g. Mathematics, Operating Systems"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Specific Topics <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span>
                  </label>
                  <input
                    required className="input-field"
                    placeholder="e.g. Calculus, Linear Algebra, Probability"
                    value={formData.topics}
                    onChange={e => setFormData({ ...formData, topics: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    About You & Your Teaching Style *
                  </label>
                  <textarea
                    required className="input-field"
                    placeholder="Describe your expertise, teaching approach, and how you can help students..."
                    rows={4}
                    style={{ resize: 'vertical' }}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Teaching Experience *
                  </label>
                  <textarea
                    required className="input-field"
                    placeholder="E.g., Taught 50+ students in calculus, ex-TA for CS101, industry experience..."
                    rows={2}
                    style={{ resize: 'vertical' }}
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Resume / Portfolio Link <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional but Highly Recommended)</span>
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://linkedin.com/in/yourprofile or Google Drive link"
                    value={formData.resumeUrl}
                    onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Mode</label>
                    <select className="input-field" value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                      <option value="online">🌐 Online</option>
                      <option value="offline">📍 Offline</option>
                      <option value="both">✨ Both</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Availability *</label>
                    <input
                      required className="input-field"
                      placeholder="e.g. Sat-Sun 10am-2pm"
                      value={formData.availability}
                      onChange={e => setFormData({ ...formData, availability: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={registering}
                  style={{
                    background: 'var(--accent-gradient)', color: '#fff', border: 'none',
                    padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                    cursor: registering ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: registering ? 0.7 : 1, transition: 'all 0.2s',
                    marginTop: 8
                  }}
                >
                  {registering ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={20} />}
                  {registering ? 'Publishing Profile...' : 'Publish My Tutor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
