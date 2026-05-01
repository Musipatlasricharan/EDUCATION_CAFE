import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Layers, BookOpen, Upload, Globe, Github, 
  Code2, Terminal, Eye, Zap, Loader, X, FileText, 
  Database, Lightbulb, Paperclip, Check, Plus, Shield, Sparkles, Archive
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import './Projects.css'

const PROJECT_TYPES = [
  { id: 'project', label: 'Software Project', icon: Code2, color: '#6366f1' },
  { id: 'research-paper', label: 'Research Paper', icon: FileText, color: '#ec4899' },
  { id: 'thesis', label: 'Thesis/Dissertation', icon: BookOpen, color: '#f59e0b' },
  { id: 'dataset', label: 'Dataset', icon: Database, color: '#10b981' },
  { id: 'tool', label: 'Tool/Library', icon: Terminal, color: '#8b5cf6' },
  { id: 'tutorial', label: 'Educational Content', icon: Lightbulb, color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: Layers, color: '#71717a' },
]

export default function ProjectEdit() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('info')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  
  const [form, setForm] = useState({
    title: '', description: '', readme: '', repoUrl: '', demoUrl: '',
    paperDoi: '', institution: '', projectType: 'project',
    techStack: '', tags: '', isPublic: true, status: 'active', 
    screenshots: [], acceptingContributions: true
  })

  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isNew) {
      const load = async () => {
        try {
          const res = await api.get(`/projects/${id}`)
          const p = res.data.project
          if (p.owner?._id !== user?._id && p.owner !== user?._id && user?.role !== 'admin') {
            toast.error('Not authorized to edit this project')
            navigate(`/projects/${id}`)
            return
          }
          setForm({
            title: p.title || '',
            description: p.description || '',
            readme: p.readme || '',
            repoUrl: p.repoUrl || '',
            demoUrl: p.demoUrl || '',
            paperDoi: p.paperDoi || '',
            institution: p.institution || '',
            projectType: p.projectType || 'project',
            techStack: (p.techStack || []).join(', '),
            tags: (p.tags || []).join(', '),
            isPublic: p.isPublic !== false,
            status: p.status || 'active',
            screenshots: p.screenshots || [],
            acceptingContributions: p.acceptingContributions !== false
          })
          setAttachments(p.attachments || [])
        } catch {
          toast.error('Failed to load project')
          navigate('/projects')
        }
        setLoading(false)
      }
      load()
    }
  }, [id, isNew])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description required')
    setSaving(true)
    try {
      let res
      if (isNew) {
        res = await api.post('/projects', form)
        toast.success('Project published successfully!')
        navigate(`/projects/${res.data.project._id}`)
      } else {
        res = await api.put(`/projects/${id}`, form)
        toast.success('Project updated!')
        navigate(`/projects/${id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    
    const toastId = toast.loading('Uploading file...')
    try {
      const res = await api.post(`/projects/${id}/attachments`, formData)
      setAttachments([...attachments, res.data.attachment])
      toast.success('File uploaded!', { id: toastId })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: toastId })
    }
  }

  const handleDeleteAttachment = async (attId) => {
    try {
      await api.delete(`/projects/${id}/attachments/${attId}`)
      setAttachments(attachments.filter(a => a._id !== attId))
      toast.success('Attachment removed')
    } catch { toast.error('Failed to remove') }
  }

  if (loading) return (
    <div className="dh-loading-center" style={{ height: '80vh', flexDirection: 'column', gap: '20px' }}>
      <div className="dh-spinner" />
      <p style={{ color: 'var(--hub-text-muted)', fontWeight: 600 }}>Preparing Workspace...</p>
    </div>
  )

  return (
    <div className="dh-page" style={{ paddingBottom: '100px' }}>
      <header className="repo-detail-header" style={{ paddingBottom: '0' }}>
        <div className="repo-header-top" style={{ marginBottom: '24px' }}>
          <div className="repo-path">
            <Shield size={20} className="path-icon" />
            <Link to="/projects" className="owner-name-link">Dev Hub</Link>
            <span className="sep">/</span>
            <span className="repo-name">{isNew ? 'New Repository' : 'Edit Repository'}</span>
          </div>
          <Link to={isNew ? "/projects" : `/projects/${id}`} className="btn-repo-action">
            <ArrowLeft size={16} /> Cancel
          </Link>
        </div>

        <div className="repo-header-meta" style={{ paddingBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
            {isNew ? 'Publish Your Innovation' : `Editing ${form.title}`}
          </h1>
          <p style={{ color: 'var(--hub-text-muted)', fontSize: '16px' }}>
            {isNew ? 'Fill in the details below to share your research or code with the world.' : 'Keep your repository metadata and documentation up to date.'}
          </p>
        </div>

        <nav className="detail-nav-bar">
          <div className={`detail-nav-item ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
            <Layers size={16} /> Metadata
          </div>
          <div className={`detail-nav-item ${tab === 'readme' ? 'active' : ''}`} onClick={() => setTab('readme')}>
            <BookOpen size={16} /> Documentation
          </div>
          {!isNew && (
            <div className={`detail-nav-item ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}>
              <Paperclip size={16} /> Attachments
            </div>
          )}
          <div className={`detail-nav-item ${tab === 'media' ? 'active' : ''}`} onClick={() => setTab('media')}>
            <Upload size={16} /> Media
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 var(--s-10)' }}>
        <form onSubmit={handleSave}>
          <AnimatePresence mode="wait">
            {tab === 'info' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Repository Title *</label>
                    <input className="input-field" style={{ width: '100%' }} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Quantum-Inspired Neural Networks" required />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Start from a Template (Optional)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { id: 'blank', label: 'Blank Repository', icon: Archive, readme: '' },
                        { id: 'software', label: 'Software Framework', icon: Code2, readme: '# Project Name\n\n## 📦 Installation\n```bash\nnpm install\n```\n\n## 🚀 Usage\nDescribe how to run the project...\n\n## 📄 License\nMIT' },
                        { id: 'research', label: 'Research Paper', icon: FileText, readme: '# Paper Title\n\n## 📑 Abstract\nSummary of the research...\n\n## 🔬 Methodology\nHow the research was conducted...\n\n## 📊 Results\nKey findings...' },
                        { id: 'dataset', label: 'Dataset Schema', icon: Database, readme: '# Dataset Name\n\n## 📝 Description\nWhat this dataset contains...\n\n## 🗂️ Data Structure\n| Column | Type | Description |\n|---|---|---|\n| id | int | Primary Key |' }
                      ].map(t => (
                        <button 
                          key={t.id} type="button" 
                          onClick={() => { set('readme', t.readme); toast.success(`Applied ${t.label} template`) }}
                          style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--hub-border)', borderRadius: '10px', color: 'var(--hub-text-muted)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <t.icon size={14} /> {t.label}
                        </button>
                      ))}
                    </div>
                    
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Repository Type *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {PROJECT_TYPES.map(t => (
                        <button 
                          key={t.id} 
                          type="button"
                          onClick={() => set('projectType', t.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                            background: form.projectType === t.id ? `${t.color}15` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${form.projectType === t.id ? t.color : 'var(--hub-border)'}`,
                            borderRadius: '10px', color: form.projectType === t.id ? t.color : 'var(--hub-text-muted)',
                            cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '13px'
                          }}
                        >
                          <t.icon size={18} />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Brief Abstract *</label>
                    <textarea className="input-field" style={{ width: '100%' }} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Provide a concise summary of your work..." required />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}><Github size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Source URL</label>
                    <input className="input-field" style={{ width: '100%' }} value={form.repoUrl} onChange={e => set('repoUrl', e.target.value)} placeholder="https://github.com/username/repo" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}><Globe size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Deployment / Paper URL</label>
                    <input className="input-field" style={{ width: '100%' }} value={form.demoUrl} onChange={e => set('demoUrl', e.target.value)} placeholder="https://demo-site.com" />
                  </div>

                  {form.projectType === 'research-paper' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Institution</label>
                        <input className="input-field" style={{ width: '100%' }} value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. MIT, Stanford..." />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>DOI Reference</label>
                        <input className="input-field" style={{ width: '100%' }} value={form.paperDoi} onChange={e => set('paperDoi', e.target.value)} placeholder="Digital Object Identifier" />
                      </div>
                    </>
                  )}

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}><Code2 size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Technologies (comma-separated)</label>
                    <input className="input-field" style={{ width: '100%' }} value={form.techStack} onChange={e => set('techStack', e.target.value)} placeholder="React, TensorFlow, AWS..." />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Project Status</label>
                    <select className="input-field" style={{ width: '100%' }} value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="active">Active Development</option>
                      <option value="wip">Work in Progress</option>
                      <option value="archived">Archived / Finished</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Visibility Settings</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="button" onClick={() => set('isPublic', !form.isPublic)} className={`btn-repo-action ${form.isPublic ? 'active' : ''}`} style={{ flex: 1 }}>
                        {form.isPublic ? <Globe size={14} /> : <X size={14} />} {form.isPublic ? 'Public Hub' : 'Private'}
                      </button>
                      <button type="button" onClick={() => set('acceptingContributions', !form.acceptingContributions)} className={`btn-repo-action ${form.acceptingContributions ? 'active' : ''}`} style={{ flex: 1 }}>
                        {form.acceptingContributions ? <Zap size={14} /> : <X size={14} />} {form.acceptingContributions ? 'Allow PRs' : 'Closed'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'readme' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
                <div className="card-header"><Terminal size={14} /> Repository README.md</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
                  <textarea 
                    style={{ 
                      padding: '24px', background: 'transparent', border: 'none', color: 'var(--hub-text)', 
                      resize: 'none', borderRight: '1px solid var(--hub-border)', fontFamily: "'Fira Code', monospace",
                      fontSize: '14px', lineHeight: '1.6'
                    }} 
                    value={form.readme} onChange={e => set('readme', e.target.value)} 
                    placeholder="# Project Name\n\n## Overview\nDescribe your repository here..." 
                  />
                  <div className="markdown-body" style={{ overflowY: 'auto' }}>
                    <ReactMarkdown>{form.readme}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'files' && !isNew && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Repository Assets</h3>
                    <p style={{ color: 'var(--hub-text-muted)' }}>Upload PDFs, datasets, or source archives.</p>
                  </div>
                  <button type="button" className="dh-btn-primary" onClick={() => fileInputRef.current.click()}>
                    <Upload size={18} /> Upload File
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {attachments.length === 0 ? (
                    <div className="dh-empty" style={{ padding: '40px' }}>
                      <Archive size={40} style={{ opacity: 0.3 }} />
                      <p>No attachments yet.</p>
                    </div>
                  ) : (
                    attachments.map(att => (
                      <div key={att._id} className="file-row" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                        <div className="file-info">
                          <FileText size={18} />
                          <span style={{ fontWeight: 600 }}>{att.name}</span>
                        </div>
                        <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--hub-danger)', cursor: 'pointer' }} onClick={() => handleDeleteAttachment(att._id)}>
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'media' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Visual Showcase</h3>
                <p style={{ color: 'var(--hub-text-muted)', marginBottom: '32px' }}>Add screenshots or graphical abstracts to make your repository stand out.</p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                  <input className="input-field" style={{ flex: 1 }} value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} placeholder="Paste image URL (png, jpg)..." />
                  <button type="button" className="dh-btn-primary" onClick={() => { if(screenshotUrl) { set('screenshots', [...form.screenshots, screenshotUrl]); setScreenshotUrl('') } }}>
                    <Plus size={18} /> Add Image
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {form.screenshots.map((url, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid var(--hub-border)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', padding: '4px', cursor: 'pointer' }} 
                        onClick={() => set('screenshots', form.screenshots.filter((_, j) => j !== i))}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="dh-btn-primary" style={{ padding: '16px 60px', fontSize: '18px' }} disabled={saving}>
              {saving ? <Loader size={20} className="spin" /> : <Sparkles size={20} />}
              {isNew ? 'Publish to Hub' : 'Update Repository'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
