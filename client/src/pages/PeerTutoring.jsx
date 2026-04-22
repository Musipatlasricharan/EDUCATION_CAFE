import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Search, UserPlus, Star, MessageCircle, CheckCircle,
  Loader, BookOpen, Clock, Users, Zap, X, FileText,
  TrendingUp, Award, Globe, Wifi, GraduationCap, Briefcase,
  ChevronDown, ChevronUp, Upload, Eye, Trash2, Edit3,
  ThumbsUp, AlertCircle, CheckCircle2, XCircle, RotateCcw,
  Linkedin, Github, ExternalLink, Phone, Calendar, Badge,
  Plus, Minus, Download, Send
} from 'lucide-react';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'English', 'History', 'Economics', 'Statistics', 'Data Science', 'Machine Learning'];
const DEGREE_OPTIONS = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.A.', 'M.Tech', 'M.Sc', 'M.E.', 'MBA', 'MCA', 'PhD', 'Diploma', 'Other'];

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', icon: <Clock size={11} />,       label: 'Pending'   },
    accepted:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', icon: <CheckCircle2 size={11}/>, label: 'Accepted'  },
    rejected:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', icon: <XCircle size={11}/>,      label: 'Rejected'  },
    completed: { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1', icon: <Award size={11}/>,        label: 'Completed' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: c.bg, color: c.color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 20,
    }}>{c.icon}{c.label}</span>
  );
};

// ── Star rating component ─────────────────────────────────────────────────────
const StarRating = ({ value, onChange, size = 20, readOnly = false }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={size}
        fill={n <= value ? '#f59e0b' : 'none'}
        style={{ color: '#f59e0b', cursor: readOnly ? 'default' : 'pointer', transition: 'transform 0.15s' }}
        onClick={() => !readOnly && onChange && onChange(n)}
        onMouseEnter={e => !readOnly && (e.currentTarget.style.transform = 'scale(1.25)')}
        onMouseLeave={e => !readOnly && (e.currentTarget.style.transform = 'scale(1)')}
      />
    ))}
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, color }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-p-lg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 14, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
    </div>
  </div>
);

// ── Tutor Card (browse) ───────────────────────────────────────────────────────
const TutorCard = ({ tutor, onRequest, onViewProfile }) => {
  const modeVal = tutor.mode?.toLowerCase();
  const modeColor = modeVal === 'online' ? '#10b981' : modeVal === 'offline' ? '#f59e0b' : '#6366f1';
  const stars = Math.round(tutor.rating || 0);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex',
      flexDirection: 'column', gap: 16, transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative', overflow: 'hidden', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(79,70,229,0.12)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--accent-gradient)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0,
        }}>
          {tutor.tutor?.avatar
            ? <img src={tutor.tutor.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 18, objectFit: 'cover' }} />
            : tutor.tutor?.name?.charAt(0)?.toUpperCase() || '?'
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tutor.tutor?.name}
            </h3>
            {tutor.isVerified && <CheckCircle size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {tutor.tutor?.college || 'University Student'}
            {tutor.tutor?.course ? ` · ${tutor.tutor.course}` : ''}
          </p>
          {/* Education quick badge */}
          {tutor.education?.length > 0 && (
            <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 3, fontWeight: 600 }}>
              🎓 {tutor.education[0].degree} in {tutor.education[0].field}, {tutor.education[0].institution}
            </p>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(245,158,11,0.1)', padding: '5px 10px',
          borderRadius: 20, flexShrink: 0,
        }}>
          <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
            {tutor.rating ? tutor.rating.toFixed(1) : 'New'}
          </span>
          {tutor.totalRatings > 0 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({tutor.totalRatings})</span>
          )}
        </div>
      </div>

      {/* Subject & description */}
      <div>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--accent)',
          background: 'rgba(99,102,241,0.08)', padding: '3px 10px', borderRadius: 20,
        }}>{tutor.subject}</span>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tutor.description}
        </p>
      </div>

      {/* Experience highlight */}
      {tutor.workExperience?.length > 0 && (
        <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong>💼 {tutor.workExperience[0].role}</strong> at {tutor.workExperience[0].organization}
            {tutor.workExperience[0].duration ? ` · ${tutor.workExperience[0].duration}` : ''}
          </p>
        </div>
      )}

      {/* Topics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(tutor.topics || []).slice(0, 4).map((topic, i) => (
          <span key={i} style={{
            fontSize: 11, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 20,
            padding: '3px 10px', color: 'var(--text-secondary)', fontWeight: 500,
          }}>{topic}</span>
        ))}
        {(tutor.topics || []).length > 4 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 6px' }}>+{tutor.topics.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: modeColor, fontSize: 12, fontWeight: 600 }}>
            {modeVal === 'online' ? <Wifi size={11} /> : <Globe size={11} />}
            {tutor.mode ? tutor.mode.charAt(0).toUpperCase() + tutor.mode.slice(1) : ''}
          </div>
          {tutor.availability && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
              <Clock size={11} /> {tutor.availability}
            </div>
          )}
          {tutor.totalSessions > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
              <Users size={11} /> {tutor.totalSessions} sessions
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onViewProfile(tutor)} style={{
            background: 'transparent', color: 'var(--accent)',
            border: '1px solid var(--accent)', borderRadius: 10, padding: '7px 12px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Eye size={13} /> Profile
          </button>
          <button onClick={() => onRequest(tutor)} style={{
            background: 'var(--accent-gradient)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '7px 16px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s ease',
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

// ── Tutor Profile Modal ───────────────────────────────────────────────────────
const TutorProfileModal = ({ tutor, onClose, onRequest, currentUserId }) => {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReview = async () => {
    if (!reviewRating) return toast.error('Please select a rating.');
    setSubmittingReview(true);
    try {
      await api.post(`/tutoring/review/${tutor._id}`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewRating(0); setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (!tutor) return null;
  const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 24, maxWidth: 700, width: '100%',
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        border: '1px solid var(--border)',
      }} onClick={e => e.stopPropagation()}>
        {/* Hero */}
        <div style={{ background: 'var(--accent-gradient)', padding: '32px 32px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}><X size={18} /></button>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {tutor.tutor?.avatar
                ? <img src={tutor.tutor.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 24, objectFit: 'cover' }} />
                : tutor.tutor?.name?.charAt(0) || '?'
              }
            </div>
            <div style={{ color: '#fff', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>{tutor.tutor?.name}</h2>
                {tutor.isVerified && <CheckCircle size={18} />}
              </div>
              <p style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>
                {tutor.tutor?.college} {tutor.tutor?.course ? `· ${tutor.tutor.course}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, opacity: 0.9 }}>
                  <Star size={14} fill="#fff" /> {tutor.rating?.toFixed(1) || 'New'} ({tutor.totalRatings || 0} reviews)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, opacity: 0.9 }}>
                  <Users size={14} /> {tutor.totalSessions} sessions
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, opacity: 0.9 }}>
                  {tutor.hourlyRate === 0 ? '🎁 Free / Volunteer' : `💰 ₹${tutor.hourlyRate}/hr`}
                </div>
              </div>
              {/* Social links */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                {tutor.linkedinUrl && (
                  <a href={tutor.linkedinUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)',
                    color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  }}><Linkedin size={13} /> LinkedIn</a>
                )}
                {tutor.githubUrl && (
                  <a href={tutor.githubUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)',
                    color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  }}><Github size={13} /> GitHub</a>
                )}
                {tutor.portfolioUrl && (
                  <a href={tutor.portfolioUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)',
                    color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  }}><ExternalLink size={13} /> Portfolio</a>
                )}
                {tutor.resumeUrl && (
                  <a href={tutor.resumeUrl.startsWith('/uploads') ? `${SERVER_URL}${tutor.resumeUrl}` : tutor.resumeUrl}
                    target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.2)',
                      color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    }}><FileText size={13} /> Resume</a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* About */}
          {tutor.description && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={17} style={{ color: 'var(--accent)' }} /> About
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{tutor.description}</p>
            </section>
          )}

          {/* Education */}
          {tutor.education?.length > 0 && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={17} style={{ color: '#10b981' }} /> Education
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tutor.education.map((edu, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', background: 'var(--bg-secondary)',
                    borderRadius: 12, borderLeft: '3px solid #10b981',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{edu.degree} in {edu.field}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{edu.institution}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                      {edu.year && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {edu.year}</span>}
                      {edu.grade && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>📊 {edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {tutor.workExperience?.length > 0 && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={17} style={{ color: '#f59e0b' }} /> Work & Teaching Experience
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tutor.workExperience.map((we, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', background: 'var(--bg-secondary)',
                    borderRadius: 12, borderLeft: '3px solid #f59e0b',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{we.role}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{we.organization}</p>
                    {we.duration && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>📅 {we.duration}</p>}
                    {we.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>{we.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {tutor.certifications?.length > 0 && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={17} style={{ color: '#6366f1' }} /> Certifications
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {tutor.certifications.map((cert, i) => (
                  <div key={i} style={{
                    padding: '10px 16px', background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12,
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{cert.name}</p>
                    {cert.issuer && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cert.issuer} {cert.year ? `· ${cert.year}` : ''}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills / Topics */}
          {((tutor.skills?.length > 0) || (tutor.topics?.length > 0)) && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={17} style={{ color: '#f59e0b' }} /> Skills & Topics
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[...(tutor.skills || []), ...(tutor.topics || [])].map((item, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 20,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', fontWeight: 500,
                  }}>{item}</span>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {tutor.reviews?.length > 0 && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={17} style={{ color: '#f59e0b' }} /> Reviews ({tutor.reviews.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 260, overflowY: 'auto' }}>
                {tutor.reviews.slice(0, 5).map((rev, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700,
                      }}>
                        {rev.reviewer?.name?.charAt(0) || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{rev.reviewer?.name || 'Student'}</p>
                        <StarRating value={rev.rating} readOnly size={13} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {rev.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rev.comment}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Leave a review */}
          {tutor.tutor?._id?.toString() !== currentUserId && (
            <section style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⭐ Leave a Review</h3>
              <StarRating value={reviewRating} onChange={setReviewRating} />
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share your experience with this tutor..."
                rows={3}
                style={{ width: '100%', marginTop: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
              />
              <button onClick={handleReview} disabled={submittingReview || !reviewRating} style={{
                marginTop: 10, padding: '9px 20px', background: 'var(--accent-gradient)', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: submittingReview ? 'not-allowed' : 'pointer',
                opacity: !reviewRating ? 0.5 : 1,
              }}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </section>
          )}

          {/* Request button */}
          {tutor.tutor?._id?.toString() !== currentUserId && (
            <button onClick={() => { onClose(); onRequest(tutor); }} style={{
              background: 'var(--accent-gradient)', color: '#fff', border: 'none',
              padding: '14px 24px', borderRadius: 14, fontWeight: 700, fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <Send size={18} /> Request a Session with {tutor.tutor?.name?.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Request Session Modal ─────────────────────────────────────────────────────
const RequestModal = ({ tutor, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState(tutor?.subject || '');
  const [preferredTime, setPreferredTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return toast.error('Please add a message.');
    setLoading(true);
    try {
      await api.post(`/tutoring/request/${tutor._id}`, { message, subject, preferredTime });
      toast.success('Session request sent! 🎉');
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setLoading(false); }
  };

  if (!tutor) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, maxWidth: 500, width: '100%',
        overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'var(--accent-gradient)', padding: '24px 28px', color: '#fff', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Request Session</h2>
          <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>with {tutor.tutor?.name}</p>
        </div>
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Subject *</label>
            <input className="input-field" value={subject} onChange={e => setSubject(e.target.value)} placeholder={tutor.subject} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Preferred Time</label>
            <input className="input-field" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} placeholder="e.g. Saturday 10am-12pm" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Message *</label>
            <textarea
              className="input-field" rows={4} style={{ resize: 'vertical' }}
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Describe what you need help with, your current level, specific topics..."
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--text-primary)' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={17} />}
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Dynamic array editor (for education / experience / certs) ─────────────────
const ArrayEditor = ({ items, setItems, fields, addLabel }) => {
  const addItem = () => {
    const blank = {};
    fields.forEach(f => blank[f.key] = '');
    setItems([...items, blank]);
  };
  const removeItem = i => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [key]: val };
    setItems(updated);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 12, position: 'relative' }}>
          <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={16} /></button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {fields.map(f => (
              f.type === 'select' ? (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <select className="input-field" style={{ padding: '8px 12px', fontSize: 13 }} value={item[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)}>
                    <option value="">Select</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ) : (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <input className={f.fullWidth ? undefined : "input-field"} style={{ padding: '8px 12px', fontSize: 13, ...(f.fullWidth ? { width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' } : {}) }} placeholder={f.placeholder || f.label} value={item[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
                </div>
              )
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
        background: 'rgba(99,102,241,0.08)', border: '1px dashed var(--accent)',
        color: 'var(--accent)', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
      }}><Plus size={15} /> {addLabel}</button>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function PeerTutoring() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    subject: '', topics: '', description: '', mode: 'online', availability: '',
    experience: '', hourlyRate: 0, languages: '', skills: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
  });
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const fileInputRef = useRef();

  useEffect(() => { fetchTutors(); }, []);

  useEffect(() => {
    if (activeTab === 'manage') { fetchMyProfile(); }
    if (activeTab === 'requests') { fetchMyRequests(); }
  }, [activeTab]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tutoring/tutors');
      setTutors(res.data.data || []);
    } catch { toast.error('Failed to load tutors'); }
    finally { setLoading(false); }
  };

  const fetchMyProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get('/tutoring/my-profile');
      setMyProfile(res.data.data);
      if (res.data.data) {
        const p = res.data.data;
        setForm({
          subject: p.subject || '', topics: (p.topics || []).join(', '), description: p.description || '',
          mode: p.mode || 'online', availability: p.availability || '', experience: p.experience || '',
          hourlyRate: p.hourlyRate || 0, languages: (p.languages || []).join(', '),
          skills: (p.skills || []).join(', '),
          linkedinUrl: p.linkedinUrl || '', githubUrl: p.githubUrl || '', portfolioUrl: p.portfolioUrl || '',
        });
        setEducation(p.education || []);
        setWorkExperience(p.workExperience || []);
        setCertifications(p.certifications || []);
        setResumeUrl(p.resumeUrl || '');
      }
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Failed to load profile');
    }
    finally { setLoadingProfile(false); }
  };

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get('/tutoring/my-requests');
      setMyRequests(res.data.data || []);
    } catch { toast.error('Failed to load requests'); }
    finally { setLoadingRequests(false); }
  };

  const handleFormChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('education', JSON.stringify(education));
    fd.append('workExperience', JSON.stringify(workExperience));
    fd.append('certifications', JSON.stringify(certifications));
    if (resumeFile) fd.append('resume', resumeFile);
    else fd.append('resumeUrl', resumeUrl);
    return fd;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const endpoint = myProfile ? '/tutoring/my-profile' : '/tutoring/register';
      const method = myProfile ? 'put' : 'post';
      await api[method](endpoint, buildFormData(), { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(myProfile ? 'Profile updated!' : 'Tutor profile created! 🎉');
      setIsEditing(false);
      await fetchMyProfile();
      setActiveTab('manage');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setRegistering(false); }
  };

  const handleRespondToRequest = async (tutorProfileId, requestId, status, tutorNote = '') => {
    try {
      await api.put(`/tutoring/request/${tutorProfileId}/${requestId}`, { status, tutorNote });
      toast.success(`Request ${status}!`);
      fetchMyProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Delete your tutor profile? This cannot be undone.')) return;
    try {
      await api.delete('/tutoring/my-profile');
      toast.success('Profile deleted.');
      setMyProfile(null);
      setActiveTab('become');
    } catch { toast.error('Failed to delete'); }
  };

  const filteredTutors = tutors.filter(t => {
    const matchesSearch = !search ||
      t.tutor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.topics?.some(tp => tp.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
    const matchesMode = selectedMode === 'All' || (t.mode && t.mode.toLowerCase() === selectedMode.toLowerCase());
    return matchesSearch && matchesSubject && matchesMode;
  });

  const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box',
  };

  const TABS = [
    { id: 'browse', label: '🔍 Find a Tutor' },
    { id: 'requests', label: '📨 My Requests' },
    { id: 'become', label: '✨ Become a Tutor' },
    { id: 'manage', label: '⚙️ Manage Profile' },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Modals ── */}
      {selectedTutor && (
        <TutorProfileModal
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
          onRequest={t => { setSelectedTutor(null); setTimeout(() => setRequestTarget(t), 100); }}
          currentUserId={user?._id || user?.id}
        />
      )}
      {requestTarget && (
        <RequestModal
          tutor={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSubmit={() => { fetchTutors(); if (activeTab === 'requests') fetchMyRequests(); }}
        />
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Users size={22} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Peer Tutoring</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Connect with verified student tutors — browse profiles, view education & experience, request sessions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-secondary)', padding: 4, borderRadius: 14, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: activeTab === tab.id ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.25s ease', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={<Users size={22} />} value={tutors.length} label="Active Tutors" color="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard icon={<BookOpen size={22} />} value={SUBJECTS.length - 1} label="Subjects Covered" color="linear-gradient(135deg,#06b6d4,#0ea5e9)" />
        <StatCard icon={<Star size={22} />} value={tutors.length ? (tutors.reduce((s, t) => s + (t.rating || 0), 0) / tutors.length).toFixed(1) + '★' : '—'} label="Avg. Rating" color="linear-gradient(135deg,#f59e0b,#f97316)" />
        <StatCard icon={<TrendingUp size={22} />} value={tutors.reduce((s, t) => s + (t.totalSessions || 0), 0)} label="Total Sessions" color="linear-gradient(135deg,#10b981,#059669)" />
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BROWSE TAB */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'browse' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, subject, topic..." className="input-field" style={{ paddingLeft: 42 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['All', 'Online', 'Offline', 'Both'].map(mode => (
                <button key={mode} onClick={() => setSelectedMode(mode)} style={{
                  padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer',
                  background: selectedMode === mode ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                  color: selectedMode === mode ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${selectedMode === mode ? 'transparent' : 'var(--border)'}`, transition: 'all 0.2s',
                }}>{mode}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
            {SUBJECTS.map(subj => (
              <button key={subj} onClick={() => setSelectedSubject(subj)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                background: selectedSubject === subj ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: selectedSubject === subj ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${selectedSubject === subj ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.2s',
              }}>{subj}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <Loader size={40} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-muted)' }}>Finding tutors for you...</p>
              </div>
            </div>
          ) : filteredTutors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
              {filteredTutors.map(t => (
                <TutorCard
                  key={t._id}
                  tutor={t}
                  onRequest={ttr => setRequestTarget(ttr)}
                  onViewProfile={ttr => setSelectedTutor(ttr)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No tutors found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{search ? 'Try adjusting your search' : 'Be the first to register as a tutor!'}</p>
              <button onClick={() => setActiveTab('become')} style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} /> Become a Tutor
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MY REQUESTS TAB (as student) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'requests' && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>My Session Requests</h2>
          {loadingRequests ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Loader size={36} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : myRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 }}>
              <MessageCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No requests yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Browse tutors and send your first session request!</p>
              <button onClick={() => setActiveTab('browse')} style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '10px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none' }}>
                Browse Tutors
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myRequests.map(req => (
                <div key={req.requestId} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                      {req.tutor?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{req.tutor?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.tutor?.college}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                        <strong>Subject:</strong> {req.subject}
                      </p>
                      {req.preferredTime && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong>Preferred:</strong> {req.preferredTime}</p>}
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>"{req.message}"</p>
                      {req.tutorNote && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                          <p style={{ fontSize: 12 }}><strong>Tutor's note:</strong> {req.tutorNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <StatusBadge status={req.status} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {req.respondedAt && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Responded: {new Date(req.respondedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BECOME A TUTOR / EDIT FORM TAB */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'become' && (
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-p-lg)' }}>
            <div style={{ background: 'var(--accent-gradient)', padding: '28px 32px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <Award size={24} />
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create Your Tutor Profile</h2>
              </div>
              <p style={{ fontSize: 13, opacity: 0.85 }}>Add your education, experience, and expertise to attract students.</p>
            </div>

            <form onSubmit={handleRegister} style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── Core Info ── */}
                <section>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>📚 Core Teaching Info</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Primary Subject *</label>
                        <input required className="input-field" placeholder="e.g. Computer Science" value={form.subject} onChange={e => handleFormChange('subject', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Mode</label>
                        <select className="input-field" value={form.mode} onChange={e => handleFormChange('mode', e.target.value)}>
                          <option value="online">🌐 Online</option>
                          <option value="offline">📍 Offline</option>
                          <option value="both">✨ Both</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Specific Topics <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                      <input required className="input-field" placeholder="e.g. Data Structures, Algorithms, React, Python" value={form.topics} onChange={e => handleFormChange('topics', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>About You & Teaching Style *</label>
                      <textarea required className="input-field" placeholder="Describe your expertise, teaching approach, and how you can help students..." rows={4} style={{ resize: 'vertical' }} value={form.description} onChange={e => handleFormChange('description', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Availability *</label>
                        <input required className="input-field" placeholder="e.g. Sat-Sun 10am-2pm" value={form.availability} onChange={e => handleFormChange('availability', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Hourly Rate (₹)</label>
                        <input type="number" min="0" className="input-field" placeholder="0 = Free" value={form.hourlyRate} onChange={e => handleFormChange('hourlyRate', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Languages</label>
                        <input className="input-field" placeholder="English, Hindi" value={form.languages} onChange={e => handleFormChange('languages', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                      <input className="input-field" placeholder="e.g. Python, React, Problem Solving, Communication" value={form.skills} onChange={e => handleFormChange('skills', e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* ── Education ── */}
                <section>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>🎓 Education Qualifications</h3>
                  <ArrayEditor
                    items={education}
                    setItems={setEducation}
                    addLabel="Add Qualification"
                    fields={[
                      { key: 'degree', label: 'Degree', type: 'select', options: DEGREE_OPTIONS },
                      { key: 'field', label: 'Field of Study', placeholder: 'Computer Science' },
                      { key: 'institution', label: 'Institution', placeholder: 'IIT Bombay' },
                      { key: 'year', label: 'Year', placeholder: '2022-2026' },
                      { key: 'grade', label: 'Grade/CGPA', placeholder: '9.2 CGPA' },
                    ]}
                  />
                </section>

                {/* ── Work Experience ── */}
                <section>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>💼 Work & Teaching Experience</h3>
                  <ArrayEditor
                    items={workExperience}
                    setItems={setWorkExperience}
                    addLabel="Add Experience"
                    fields={[
                      { key: 'role', label: 'Role', placeholder: 'Teaching Assistant' },
                      { key: 'organization', label: 'Organization', placeholder: 'IIT Madras' },
                      { key: 'duration', label: 'Duration', placeholder: 'Jan 2023 – May 2023' },
                      { key: 'description', label: 'Description', placeholder: 'Conducted doubt sessions for 60+ students...' },
                    ]}
                  />
                  {/* Free-text experience summary */}
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Experience Summary</label>
                    <textarea className="input-field" placeholder="E.g., Taught 50+ students in calculus, ex-TA for CS101..." rows={2} style={{ resize: 'vertical' }} value={form.experience} onChange={e => handleFormChange('experience', e.target.value)} />
                  </div>
                </section>

                {/* ── Certifications ── */}
                <section>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>🏆 Certifications</h3>
                  <ArrayEditor
                    items={certifications}
                    setItems={setCertifications}
                    addLabel="Add Certification"
                    fields={[
                      { key: 'name', label: 'Certification Name', placeholder: 'AWS Certified Developer' },
                      { key: 'issuer', label: 'Issuing Organization', placeholder: 'Amazon' },
                      { key: 'year', label: 'Year', placeholder: '2024' },
                    ]}
                  />
                </section>

                {/* ── Resume & Links ── */}
                <section>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>🔗 Resume & Social Links</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Resume upload */}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                        Upload Resume <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(PDF, DOC, DOCX — max 5MB)</span>
                      </label>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                          background: resumeFile ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)',
                          border: `1px solid ${resumeFile ? '#10b981' : 'var(--border)'}`,
                          borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                          color: resumeFile ? '#10b981' : 'var(--text-secondary)',
                        }}>
                          <Upload size={15} />
                          {resumeFile ? resumeFile.name : 'Choose File'}
                        </button>
                        {resumeFile && (
                          <button type="button" onClick={() => setResumeFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>✕ Remove</button>
                        )}
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => { setResumeFile(e.target.files[0] || null); setResumeUrl(''); }} />
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>— or paste a link —</p>
                      <input className="input-field" type="url" placeholder="https://drive.google.com/... or LinkedIn PDF" value={resumeUrl} onChange={e => { setResumeUrl(e.target.value); setResumeFile(null); }} style={{ marginTop: 6 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>LinkedIn</label>
                        <input className="input-field" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={e => handleFormChange('linkedinUrl', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>GitHub</label>
                        <input className="input-field" type="url" placeholder="https://github.com/..." value={form.githubUrl} onChange={e => handleFormChange('githubUrl', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Portfolio</label>
                        <input className="input-field" type="url" placeholder="https://yoursite.com" value={form.portfolioUrl} onChange={e => handleFormChange('portfolioUrl', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </section>

                <button type="submit" disabled={registering} style={{
                  background: 'var(--accent-gradient)', color: '#fff', border: 'none',
                  padding: '15px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                  cursor: registering ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: registering ? 0.7 : 1, transition: 'all 0.2s',
                }}>
                  {registering ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <UserPlus size={20} />}
                  {registering ? 'Publishing...' : 'Publish My Tutor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MANAGE PROFILE TAB (tutor dashboard) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'manage' && (
        <div>
          {loadingProfile ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Loader size={40} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : !myProfile ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 }}>
              <GraduationCap size={56} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No Tutor Profile Found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You haven't registered as a tutor yet.</p>
              <button onClick={() => setActiveTab('become')} style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '12px 28px', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <UserPlus size={18} /> Create Tutor Profile
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Profile summary card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ background: 'var(--accent-gradient)', padding: '24px 28px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>My Tutor Profile</h2>
                    <p style={{ opacity: 0.85, fontSize: 13, marginTop: 4 }}>{myProfile.subject} · {myProfile.mode} · {myProfile.availability}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setActiveTab('become'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      <Edit3 size={15} /> Edit Profile
                    </button>
                    <button onClick={handleDeleteProfile} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'rgba(239,68,68,0.3)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>

                <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{myProfile.rating?.toFixed(1) || '—'}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Avg Rating</p>
                    <StarRating value={Math.round(myProfile.rating || 0)} readOnly size={14} />
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{myProfile.totalSessions}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total Sessions</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{myProfile.requests?.filter(r => r.status === 'pending').length || 0}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Pending Requests</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <p style={{ fontSize: 28, fontWeight: 800 }}>{myProfile.totalRatings}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Reviews</p>
                  </div>
                </div>

                {/* Resume & links */}
                {(myProfile.resumeUrl || myProfile.linkedinUrl || myProfile.githubUrl) && (
                  <div style={{ padding: '0 28px 24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {myProfile.resumeUrl && (
                      <a href={myProfile.resumeUrl.startsWith('/uploads') ? `${SERVER_URL}${myProfile.resumeUrl}` : myProfile.resumeUrl}
                        target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <FileText size={14} style={{ color: '#6366f1' }} /> View Resume
                      </a>
                    )}
                    {myProfile.linkedinUrl && (
                      <a href={myProfile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <Linkedin size={14} style={{ color: '#0077b5' }} /> LinkedIn
                      </a>
                    )}
                    {myProfile.githubUrl && (
                      <a href={myProfile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <Github size={14} /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Incoming requests */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>📥 Incoming Session Requests</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{myProfile.requests?.length || 0} total</span>
                </div>
                {(myProfile.requests || []).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No requests yet. Share your profile to get started!</p>
                  </div>
                ) : (
                  <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {myProfile.requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).map(req => (
                      <div key={req._id} style={{
                        background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                            {req.student?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 14 }}>{req.student?.name || 'Student'}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.student?.college}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5 }}>📚 {req.subject || myProfile.subject}</p>
                            {req.preferredTime && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>⏰ {req.preferredTime}</p>}
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>"{req.message}"</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{new Date(req.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <StatusBadge status={req.status} />
                          {req.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleRespondToRequest(myProfile._id, req._id, 'accepted')} style={{
                                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                                background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                                borderRadius: 10, color: '#10b981', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                              }}>
                                <CheckCircle2 size={14} /> Accept
                              </button>
                              <button onClick={() => handleRespondToRequest(myProfile._id, req._id, 'rejected')} style={{
                                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                                background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                                borderRadius: 10, color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                              }}>
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education on profile */}
              {myProfile.education?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>🎓 Education</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {myProfile.education.map((edu, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, borderLeft: '3px solid #10b981' }}>
                        <p style={{ fontWeight: 700 }}>{edu.degree} in {edu.field} — {edu.institution}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{edu.year} {edu.grade ? `· ${edu.grade}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work experience on profile */}
              {myProfile.workExperience?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>💼 Work & Teaching Experience</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {myProfile.workExperience.map((we, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, borderLeft: '3px solid #f59e0b' }}>
                        <p style={{ fontWeight: 700 }}>{we.role} — {we.organization}</p>
                        {we.duration && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{we.duration}</p>}
                        {we.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5 }}>{we.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
