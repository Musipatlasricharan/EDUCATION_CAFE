import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Download, Layout, User, Briefcase, GraduationCap, Award,
  ChevronRight, ChevronLeft, Sparkles, Phone, Mail, MapPin,
  Globe, Plus, Trash2, Star, CheckCircle, Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TEMPLATES = [
  { id: 'modern', label: 'Modern', desc: 'Clean & Contemporary', accent: '#6366f1' },
  { id: 'executive', label: 'Executive', desc: 'Bold & Professional', accent: '#0f172a' },
  { id: 'creative', label: 'Creative', desc: 'Vibrant & Unique', accent: '#06b6d4' },
];

const STEPS = ['Template', 'Personal', 'Experience', 'Preview'];

const StepIndicator = ({ currentStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
    {STEPS.map((step, i) => (
      <React.Fragment key={step}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: i <= currentStep ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
            border: i === currentStep ? '2px solid var(--accent)' : '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: i <= currentStep ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 13, transition: 'all 0.3s'
          }}>
            {i < currentStep ? <CheckCircle size={18} /> : i + 1}
          </div>
          <span style={{ fontSize: 11, fontWeight: i === currentStep ? 700 : 400, color: i === currentStep ? 'var(--accent)' : 'var(--text-muted)' }}>
            {step}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div style={{
            height: 2, width: 60, marginBottom: 20,
            background: i < currentStep ? 'var(--accent-gradient)' : 'var(--border)',
            transition: 'all 0.3s'
          }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const SectionCard = ({ icon, title, children }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20
  }}>
    <div style={{
      padding: '16px 20px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-secondary)'
    }}>
      <div style={{ color: 'var(--accent)' }}>{icon}</div>
      <h3 style={{ fontWeight: 700, fontSize: 14 }}>{title}</h3>
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
);

const ResumePreview = ({ user, template, extraInfo }) => {
  const accent = TEMPLATES.find(t => t.id === template)?.accent || '#6366f1';
  return (
    <div style={{
      background: '#fff', color: '#1a1a1a',
      minHeight: 900, fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 11, lineHeight: 1.6, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      borderRadius: 4, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: template === 'executive' ? '#0f172a' : template === 'creative' ? 'linear-gradient(135deg,#06b6d4,#6366f1)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        padding: '36px 40px', color: '#fff'
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>
          {user?.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
          {user?.course} · {user?.college}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11, opacity: 0.9 }}>
          {user?.email && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={11}/> {user.email}</span>}
          {extraInfo.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11}/> {extraInfo.phone}</span>}
          {extraInfo.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={11}/> {extraInfo.location}</span>}
          {extraInfo.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Globe size={11}/> {extraInfo.linkedin}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0 }}>
        {/* Left Column */}
        <div style={{ padding: '28px 24px', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
          {/* Summary */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 10 }}>Profile</h2>
            <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.7 }}>
              {user?.bio || extraInfo.summary || 'Motivated student with passion for excellence and collaborative learning.'}
            </p>
          </div>

          {/* Skills */}
          {(user?.subjects?.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 10 }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {user.subjects.map((s, i) => (
                  <span key={i} style={{ background: `${accent}15`, color: accent, fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          <div>
            <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 10 }}>Platform Stats</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Points Earned', val: user?.points || 0 },
                { label: 'Reputation', val: user?.reputation || 0 },
                { label: 'Badges', val: user?.badges?.length || 0 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ padding: '28px 32px' }}>
          {/* Education */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={12}/> Education
            </h2>
            <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 14 }}>
              <p style={{ fontWeight: 700, fontSize: 12 }}>{user?.college}</p>
              <p style={{ color: '#475569', fontSize: 11 }}>{user?.course} · Year {user?.year}</p>
            </div>
          </div>

          {/* Experience */}
          {extraInfo.experience?.filter(e => e.role).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={12}/> Experience
              </h2>
              {extraInfo.experience.filter(e => e.role).map((exp, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 14, marginBottom: 14 }}>
                  <p style={{ fontWeight: 700, fontSize: 12 }}>{exp.role}</p>
                  <p style={{ color: '#475569', fontSize: 11 }}>{exp.company} · {exp.duration}</p>
                  {exp.desc && <p style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>{exp.desc}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {extraInfo.certifications && (
            <div>
              <h2 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={12}/> Certifications
              </h2>
              <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.7 }}>{extraInfo.certifications}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [extraInfo, setExtraInfo] = useState({
    phone: '', location: '', linkedin: '', summary: '',
    certifications: '',
    experience: [{ role: '', company: '', duration: '', desc: '' }]
  });

  const addExperience = () => {
    setExtraInfo(prev => ({ ...prev, experience: [...prev.experience, { role: '', company: '', duration: '', desc: '' }] }));
  };

  const removeExperience = (i) => {
    setExtraInfo(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
  };

  const updateExperience = (i, field, value) => {
    setExtraInfo(prev => {
      const exp = [...prev.experience];
      exp[i] = { ...exp[i], [field]: value };
      return { ...prev, experience: exp };
    });
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    toast.success('Resume PDF generated! (Feature coming soon)');
    setGenerating(false);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>AI Resume Builder</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Generate a professional resume from your EDUCAFE profile.</p>
            </div>
          </div>
        </div>
        {step === 3 && (
          <button onClick={handleGeneratePDF} disabled={generating} style={{
            background: 'var(--accent-gradient)', color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            opacity: generating ? 0.7 : 1
          }}>
            {generating ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
            {generating ? 'Generating...' : 'Download PDF'}
          </button>
        )}
      </div>

      <StepIndicator currentStep={step} />

      <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr 1.8fr' : '1fr', gap: 28 }}>

        {/* Left Panel / Form */}
        <div>
          {/* Step 0: Template */}
          {step === 0 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Choose a Template</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {TEMPLATES.map(t => (
                  <div key={t.id} onClick={() => setTemplate(t.id)} style={{
                    padding: '20px 24px', border: `2px solid ${template === t.id ? t.accent : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    background: template === t.id ? `${t.accent}09` : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.25s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Layout size={22} style={{ color: '#fff' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700 }}>{t.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</p>
                      </div>
                    </div>
                    {template === t.id && <CheckCircle size={20} style={{ color: t.accent }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Personal Information</h2>
              <SectionCard icon={<User size={16}/>} title="Contact Details">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Full Name</label>
                    <input readOnly value={user?.name || ''} className="input-field" style={{ background: 'var(--bg-secondary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
                    <input readOnly value={user?.email || ''} className="input-field" style={{ background: 'var(--bg-secondary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Phone</label>
                    <input value={extraInfo.phone} onChange={e => setExtraInfo(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Location</label>
                    <input value={extraInfo.location} onChange={e => setExtraInfo(p => ({ ...p, location: e.target.value }))} className="input-field" placeholder="City, State" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>LinkedIn / Portfolio</label>
                    <input value={extraInfo.linkedin} onChange={e => setExtraInfo(p => ({ ...p, linkedin: e.target.value }))} className="input-field" placeholder="linkedin.com/in/yourname" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Professional Summary</label>
                    <textarea
                      value={extraInfo.summary}
                      onChange={e => setExtraInfo(p => ({ ...p, summary: e.target.value }))}
                      className="input-field" placeholder="Write a 2–3 sentence professional summary..." rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Experience & Certifications</h2>
              <SectionCard icon={<Briefcase size={16}/>} title="Work / Internship Experience">
                {extraInfo.experience.map((exp, i) => (
                  <div key={i} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, marginBottom: 12, position: 'relative' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="input-field" placeholder="Role / Position" style={{ fontSize: 13 }} />
                      <input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className="input-field" placeholder="Company / Organization" style={{ fontSize: 13 }} />
                      <input value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} className="input-field" placeholder="Duration (e.g. Jun–Aug 2024)" style={{ fontSize: 13 }} />
                    </div>
                    <textarea value={exp.desc} onChange={e => updateExperience(i, 'desc', e.target.value)} className="input-field" placeholder="Describe responsibilities & achievements..." rows={2} style={{ marginTop: 10, fontSize: 13, resize: 'none' }} />
                    {i > 0 && (
                      <button onClick={() => removeExperience(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addExperience} style={{
                  width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer',
                  border: '1px dashed var(--border)', background: 'transparent',
                  color: 'var(--accent)', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  <Plus size={15} /> Add Experience
                </button>
              </SectionCard>

              <SectionCard icon={<Award size={16}/>} title="Certifications & Awards">
                <textarea
                  value={extraInfo.certifications}
                  onChange={e => setExtraInfo(p => ({ ...p, certifications: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. AWS Certified Cloud Practitioner (2024), Google Analytics Certificate..."
                  rows={4} style={{ resize: 'vertical' }}
                />
              </SectionCard>
            </div>
          )}

          {/* Step 3 left: quick edit */}
          {step === 3 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Quick Edits</h2>
              <SectionCard icon={<User size={16}/>} title="Summary">
                <textarea
                  value={extraInfo.summary}
                  onChange={e => setExtraInfo(p => ({ ...p, summary: e.target.value }))}
                  className="input-field" rows={3} style={{ resize: 'vertical' }}
                  placeholder="Professional summary..."
                />
              </SectionCard>
              <SectionCard icon={<Award size={16}/>} title="Template">
                <div style={{ display: 'flex', gap: 10 }}>
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                      flex: 1, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${template === t.id ? t.accent : 'var(--border)'}`,
                      background: template === t.id ? `${t.accent}12` : 'var(--bg-secondary)',
                      fontSize: 12, fontWeight: 600
                    }}>{t.label}</button>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} style={{
                padding: '11px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <ChevronLeft size={16} /> Previous
              </button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                padding: '11px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: 'var(--accent-gradient)', color: '#fff', border: 'none',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                {step === 2 ? '✨ Preview Resume' : 'Continue'} <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleGeneratePDF} disabled={generating} style={{
                padding: '11px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: 'var(--accent-gradient)', color: '#fff', border: 'none',
                display: 'flex', alignItems: 'center', gap: 8, opacity: generating ? 0.7 : 1
              }}>
                {generating ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Preview (visible on step 3) */}
        {step === 3 && (
          <div style={{ overflowY: 'auto' }}>
            <ResumePreview user={user} template={template} extraInfo={extraInfo} />
          </div>
        )}
      </div>
    </div>
  );
}
