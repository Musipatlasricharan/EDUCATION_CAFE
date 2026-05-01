import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star, GitFork, Eye, Globe, Github, ArrowLeft,
  Code2, MessageSquare, Edit3, Trash2, ExternalLink,
  Clock, Users, BookOpen, Share2, Loader, Send, X,
  CheckCircle2, AlertCircle, Archive, Zap, Download, 
  FileText, Database, Terminal, Lightbulb, Layers, 
  PlusCircle, Check, MoreVertical, Paperclip, Shield, 
  Flag, ChevronRight, Bookmark, List, History
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Projects.css'

const PROJECT_TYPES = {
  'project': { label: 'Software Project', icon: Code2, color: '#6366f1' },
  'research-paper': { label: 'Research Paper', icon: FileText, color: '#ec4899' },
  'thesis': { label: 'Thesis/Dissertation', icon: BookOpen, color: '#f59e0b' },
  'dataset': { label: 'Dataset', icon: Database, color: '#10b981' },
  'tool': { label: 'Tool/Library', icon: Terminal, color: '#8b5cf6' },
  'tutorial': { label: 'Educational Content', icon: Lightbulb, color: '#3b82f6' },
  'other': { label: 'Other', icon: Layers, color: '#71717a' },
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starred, setStarred] = useState(false)
  const [watching, setWatching] = useState(false)
  const [starCount, setStarCount] = useState(0)
  const [watcherCount, setWatcherCount] = useState(0)
  const [forkLoading, setForkLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('readme')
  
  // Contribution State
  const [showContribForm, setShowContribForm] = useState(false)
  const [contribForm, setContribForm] = useState({ title: '', description: '', type: 'feature', externalUrl: '' })
  const [contribLoading, setContribLoading] = useState(false)
  const [contribFile, setContribFile] = useState(null)
  const [ownerNote, setOwnerNote] = useState('')
  
  // Comment State
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (project) {
      setStarCount(project.stars?.length || 0)
      setWatcherCount(project.watchers?.length || 0)
      if (user) {
        setStarred((project.stars || []).some(id => (id._id || id).toString() === user._id.toString()))
        setWatching((project.watchers || []).some(id => (id._id || id).toString() === user._id.toString()))
      }
    }
  }, [project, user])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`)
      const p = res.data.project
      setProject(p)
    } catch (err) {
      toast.error('Repository unreachable')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchProject()
  }, [id])

  const handleStar = async () => {
    try {
      const res = await api.post(`/projects/${id}/star`)
      setStarred(res.data.starred)
      setStarCount(res.data.starCount)
    } catch { toast.error('Request failed') }
  }

  const handleWatch = async () => {
    try {
      const res = await api.post(`/projects/${id}/watch`)
      setWatching(res.data.watching)
      setWatcherCount(res.data.watcherCount)
    } catch { toast.error('Request failed') }
  }

  const handleFork = async () => {
    if (forkLoading) return
    setForkLoading(true)
    try {
      const res = await api.post(`/projects/${id}/fork`)
      toast.success('Forked to your personal hub')
      navigate(`/projects/${res.data.project._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Forking failed')
    } finally {
      setForkLoading(false)
    }
  }

  const handleDownload = async (attachment) => {
    try {
      await api.post(`/projects/${id}/download`)
      setProject(p => ({ ...p, downloads: (p.downloads || 0) + 1 }))
      window.open(attachment.url, '_blank')
    } catch { toast.error('Download tracking failed') }
  }

  const [syncing, setSyncing] = useState(false)

  const handleGithubSync = async () => {
    if (syncing) return
    setSyncing(true)
    const tid = toast.loading('Synchronizing with GitHub...')
    try {
      const res = await api.post(`/projects/${id}/sync`)
      setProject(res.data.project)
      toast.success('Successfully synchronized!', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed', { id: tid })
    } finally { setSyncing(false) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentLoading(true)
    try {
      const res = await api.post(`/projects/${id}/comments`, { content: comment })
      setProject(p => ({ ...p, comments: [...(p.comments || []), res.data.comment] }))
      setComment('')
      toast.success('Comment published')
    } catch { toast.error('Publishing failed') }
    finally { setCommentLoading(false) }
  }

  const handleContribSubmit = async (e) => {
    e.preventDefault()
    setContribLoading(true)
    const formData = new FormData()
    formData.append('title', contribForm.title)
    formData.append('description', contribForm.description)
    formData.append('type', contribForm.type)
    formData.append('externalUrl', contribForm.externalUrl)
    if (contribFile) formData.append('file', contribFile)

    try {
      const res = await api.post(`/projects/${id}/contributions`, formData)
      setProject(p => ({ ...p, contributions: [...(p.contributions || []), res.data.contribution] }))
      toast.success('Contribution request submitted')
      setShowContribForm(false)
      setContribForm({ title: '', description: '', type: 'feature', externalUrl: '' })
      setContribFile(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally {
      setContribLoading(false)
    }
  }

  const handleAddTask = async (title) => {
    try {
      const res = await api.post(`/projects/${id}/tasks`, { title })
      setProject(p => ({ ...p, tasks: [...(p.tasks || []), res.data.task] }))
      toast.success('Task added to roadmap')
    } catch { toast.error('Failed to add task') }
  }

  const handleTaskUpdate = async (taskId, status) => {
    try {
      const res = await api.put(`/projects/${id}/tasks/${taskId}`, { status })
      setProject(p => ({
        ...p,
        tasks: p.tasks.map(t => t._id === taskId ? res.data.task : t)
      }))
    } catch { toast.error('Failed to update task') }
  }

  const handleContribResponse = async (contribId, status) => {
    try {
      const res = await api.put(`/projects/${id}/contributions/${contribId}`, { status, ownerNote })
      setProject(p => ({
        ...p,
        contributions: p.contributions.map(c => c._id === contribId ? res.data.contribution : c)
      }))
      toast.success(`Contribution ${status}`)
      setOwnerNote('')
    } catch { toast.error('Action failed') }
  }

  if (loading) return (
    <div className="dh-loading-center" style={{ height: '80vh', flexDirection: 'column', gap: '20px' }}>
      <div className="dh-spinner" />
      <p style={{ color: 'var(--hub-text-muted)', fontWeight: 600 }}>Syncing Repository Data...</p>
    </div>
  )

  if (!project) return null

  const isOwner = user?._id === (project.owner?._id || project.owner)
  const projectType = PROJECT_TYPES[project.projectType] || PROJECT_TYPES.other

  return (
    <div className="repo-detail-page">
      <header className="repo-detail-header">
        <div className="repo-header-top">
          <div className="repo-path">
            <Shield size={20} className="path-icon" />
            <Link to="/projects" className="owner-name-link">{project.owner?.name}</Link>
            <span className="sep">/</span>
            <span className="repo-name">{project.title}</span>
            {project.isVerified && (
              <div className="verified-badge" title="Institution Verified Repository">
                <CheckCircle2 size={14} fill="#10b981" color="white" />
                <span>Verified</span>
              </div>
            )}
            <span className="visibility-badge">{project.isPublic ? 'Public' : 'Private'}</span>
          </div>

          <div className="repo-header-actions">
            <button className={`btn-repo-action ${watching ? 'active' : ''}`} onClick={handleWatch}>
              <Eye size={16} /> {watching ? 'Unwatch' : 'Watch'}
              <span className="badge-count">{watcherCount}</span>
            </button>
            <button className="btn-repo-action" onClick={handleFork} disabled={forkLoading || isOwner}>
              {forkLoading ? <Loader size={16} className="spin" /> : <GitFork size={16} />} Fork
              <span className="badge-count">{project.forks?.length || 0}</span>
            </button>
            <button className={`btn-repo-action ${starred ? 'active' : ''}`} onClick={handleStar} style={{ color: starred ? '#f59e0b' : 'inherit' }}>
              <Star size={16} fill={starred ? 'currentColor' : 'none'} /> {starred ? 'Starred' : 'Star'}
              <span className="badge-count">{starCount}</span>
            </button>
          </div>
        </div>

        <div className="repo-header-meta">
          <div className="repo-type-tag" style={{ color: projectType.color }}>
            <projectType.icon size={14} /> {projectType.label}
          </div>
          
          {/* Tech Breakdown Bar */}
          <div className="tech-breakdown-container">
            <div className="tech-bar">
              {project.techStack?.length > 0 ? (
                project.techStack.map((tech, idx) => {
                  const colors = { 
                    'Javascript': '#f7df1e', 'Python': '#3776ab', 'React': '#61dafb', 
                    'Node': '#339933', 'HTML': '#e34f26', 'CSS': '#1572b6',
                    'Typescript': '#3178c6', 'Java': '#b07219', 'C++': '#f34b7d'
                  }
                  const color = colors[tech] || `hsl(${(idx * 137.5) % 360}, 60%, 50%)`
                  return <div key={tech} className="tech-segment" style={{ width: `${100 / project.techStack.length}%`, backgroundColor: color }} />
                })
              ) : (
                <div className="tech-segment" style={{ width: '100%', backgroundColor: 'var(--hub-border)' }} />
              )}
            </div>
            <div className="tech-labels">
              {project.techStack?.slice(0, 6).map((tech, idx) => (
                <span key={tech} className="tech-label-item">
                  <span className="tech-dot" style={{ backgroundColor: `hsl(${(idx * 137.5) % 360}, 60%, 50%)` }} />
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <p className="repo-description-large">{project.description}</p>
          <div className="repo-meta-links">
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer"><Github size={14} /> Source Code</a>}
            {project.repoUrl?.includes('github.com') && isOwner && (
              <button className="meta-info-btn" onClick={handleGithubSync} disabled={syncing} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                <History size={14} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing...' : 'Sync with GitHub'}
              </button>
            )}
            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer"><Globe size={14} /> Live Preview</a>}
            <button className="meta-info-btn" onClick={() => { navigator.clipboard.writeText(project.apaCitation); toast.success('Citation copied to clipboard!'); }} style={{ background: 'none', border: 'none', color: 'var(--hub-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <FileText size={14} /> Cite Repo
            </button>
            <span className="meta-info"><Clock size={14} /> Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <nav className="detail-nav-bar">
          <div className={`detail-nav-item ${activeTab === 'readme' ? 'active' : ''}`} onClick={() => setActiveTab('readme')}>
            <BookOpen size={16} /> README.md
          </div>
          <div className={`detail-nav-item ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
            <Paperclip size={16} /> Assets ({project.attachments?.length || 0})
          </div>
          <div className={`detail-nav-item ${activeTab === 'contributions' ? 'active' : ''}`} onClick={() => setActiveTab('contributions')}>
            <GitFork size={16} /> Pull Requests ({project.contributions?.length || 0})
          </div>
          <div className={`detail-nav-item ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
            <List size={16} /> Roadmap
          </div>
          <div className={`detail-nav-item ${activeTab === 'discussion' ? 'active' : ''}`} onClick={() => setActiveTab('discussion')}>
            <MessageSquare size={16} /> Discussion
          </div>
        </nav>
      </header>

      <main className="repo-content-grid">
        <div className="repo-main-col">
          <AnimatePresence mode="wait">
            {activeTab === 'readme' && (
              <motion.div key="readme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card">
                <div className="card-header"><List size={16} /> Repository Documentation</div>
                <div className="markdown-body">
                  {project.readme ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.readme}</ReactMarkdown>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--hub-text-muted)' }}>
                      <AlertCircle size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>No README.md found in this repository.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'files' && (
              <motion.div key="files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card">
                <div className="card-header"><PlusCircle size={16} /> Downloadable Assets</div>
                <div className="file-explorer">
                  {project.attachments?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--hub-text-muted)' }}>
                      <Archive size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>This repository has no downloadable attachments.</p>
                    </div>
                  ) : (
                    project.attachments.map(file => (
                      <div key={file._id} className="file-row">
                        <div className="file-info">
                          <FileText size={20} className="file-icon" />
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button className="dh-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDownload(file)}>
                          <Download size={14} /> Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'contributions' && (
              <motion.div key="contributions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="contributions-panel">
                <div className="panel-header-flex">
                  <h3>Pull Request Timeline</h3>
                  {!isOwner && project.acceptingContributions && (
                    <button className="dh-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setShowContribForm(true)}>Open Pull Request</button>
                  )}
                </div>

                {showContribForm && (
                  <form className="contrib-submission-box card" onSubmit={handleContribSubmit}>
                    <div className="form-group">
                      <label>PR Title</label>
                      <input className="input-field" placeholder="Briefly describe your contribution" value={contribForm.title} onChange={e => setContribForm({...contribForm, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Implementation Details</label>
                      <textarea className="input-field" rows={5} placeholder="Explain what changes you've made and why..." value={contribForm.description} onChange={e => setContribForm({...contribForm, description: e.target.value})} required />
                    </div>
                    <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button type="button" className="dh-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setShowContribForm(false)}>Cancel</button>
                      <button type="submit" className="dh-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} disabled={contribLoading}>Submit PR</button>
                    </div>
                  </form>
                )}

                <div className="contribution-timeline">
                  {project.contributions?.length === 0 ? (
                    <div className="dh-empty" style={{ padding: '60px' }}>
                      <GitFork size={48} strokeWidth={1} color="var(--hub-text-muted)" />
                      <p>No active pull requests for this repository.</p>
                    </div>
                  ) : (
                    project.contributions?.map(c => (
                      <div key={c._id} className="timeline-item">
                        <div className="timeline-marker"><GitFork size={14} /></div>
                        <div className="timeline-card">
                          <div className="contrib-header">
                            <div className="contrib-author-info">
                              <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.name}&background=6366f1&color=fff`} alt="" className="dh-owner-avatar" style={{ width: '24px', height: '24px' }} />
                              <span><strong>{c.user?.name || 'Anonymous'}</strong> proposed changes</span>
                            </div>
                            <span className={`status-pill ${c.status}`}>{c.status}</span>
                          </div>
                          <h4 className="contrib-title">{c.title}</h4>
                          <p className="contrib-desc">{c.description}</p>
                          
                          {isOwner && c.status === 'pending' && (
                            <div className="owner-response-area" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--hub-border)' }}>
                              <textarea className="input-field" style={{ width: '100%', marginBottom: '12px' }} placeholder="Reviewer comments..." value={ownerNote} onChange={e => setOwnerNote(e.target.value)} />
                              <div className="response-actions" style={{ display: 'flex', gap: '8px' }}>
                                <button className="dh-btn-primary" style={{ background: 'var(--hub-success)', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleContribResponse(c._id, 'accepted')}>Merge PR</button>
                                <button className="dh-btn-primary" style={{ background: 'var(--hub-danger)', padding: '6px 12px', fontSize: '12px' }} onClick={() => handleContribResponse(c._id, 'rejected')}>Reject</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div key="roadmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="kanban-board">
                {['todo', 'doing', 'done'].map(status => (
                  <div key={status} className="kanban-column">
                    <div className="kanban-column-header">
                      {status.toUpperCase()}
                      <span className="count">{project.tasks?.filter(t => t.status === status).length || 0}</span>
                    </div>
                    <div className="kanban-tasks">
                      {project.tasks?.filter(t => t.status === status).map(task => (
                        <div key={task._id} className="kanban-task-card">
                          {task.title}
                          {isOwner && (
                            <div className="task-actions">
                              <button onClick={() => handleTaskUpdate(task._id, status === 'todo' ? 'doing' : 'done')}><ChevronRight size={14} /></button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {isOwner && status === 'todo' && (
                      <button className="add-task-btn" onClick={() => {
                        const title = prompt('Enter task title:');
                        if (title) handleAddTask(title);
                      }}><PlusCircle size={14} /> Add Task</button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'discussion' && (
              <motion.div key="discussion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card">
                <div className="card-header"><MessageSquare size={16} /> Global Repository Discussion</div>
                <form className="comment-composer" onSubmit={handleComment}>
                  <textarea className="input-field" value={comment} onChange={e => setComment(e.target.value)} placeholder="Type your comment here..." />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="submit" className="dh-btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }} disabled={commentLoading || !comment.trim()}>Post Comment</button>
                  </div>
                </form>
                <div className="comment-list">
                  {project.comments?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--hub-text-muted)' }}>
                      <MessageSquare size={48} strokeWidth={1} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <p>Be the first to start a discussion!</p>
                    </div>
                  ) : (
                    project.comments?.map(c => (
                      <div key={c._id} className="professional-comment">
                        <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.name}&background=6366f1&color=fff`} alt="" className="dh-owner-avatar" style={{ width: '36px', height: '36px' }} />
                        <div className="comment-body" style={{ flex: 1 }}>
                          <div className="comment-header">
                            <span className="user-name">{c.user?.name}</span>
                            <span className="timestamp">· {new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="comment-content">{c.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="repo-sidebar">
          <div className="sidebar-card-professional card">
            <h4 className="sidebar-title">About Repository</h4>
            <div className="sidebar-info-group">
              <div className="info-label">Tech Stack</div>
              <div className="tech-stack-flex">
                {project.techStack?.length > 0 ? (
                  project.techStack?.map(t => <span key={t} className="tech-badge-sm">{t}</span>)
                ) : (
                  <span style={{ color: 'var(--hub-text-muted)', fontSize: '13px' }}>Not specified</span>
                )}
              </div>
            </div>
            <div className="sidebar-info-group">
              <div className="info-label">Project Metrics</div>
              <div className="stats-list-sm">
                <div className="stat-row"><Eye size={14} /> <span>{project.views} Page Views</span></div>
                <div className="stat-row"><Star size={14} /> <span>{starCount} Stars</span></div>
                <div className="stat-row"><GitFork size={14} /> <span>{project.forks?.length || 0} Forks</span></div>
                <div className="stat-row"><Download size={14} /> <span>{project.downloads || 0} Downloads</span></div>
              </div>
            </div>

            <div className="sidebar-info-group">
              <div className="info-label">Project Health</div>
              <div className="health-score-card">
                <div className="health-score-flex">
                  <div className="health-score-value" style={{ color: project.healthScore > 70 ? 'var(--hub-success)' : project.healthScore > 40 ? 'var(--hub-warning)' : 'var(--hub-danger)' }}>
                    {project.healthScore}%
                  </div>
                  <div className="health-score-label">
                    {project.healthScore > 70 ? 'Excellent' : project.healthScore > 40 ? 'Fair' : 'Needs Work'}
                  </div>
                </div>
                <div className="health-bar-mini">
                  <div className="health-fill" style={{ width: `${project.healthScore}%`, backgroundColor: project.healthScore > 70 ? 'var(--hub-success)' : project.healthScore > 40 ? 'var(--hub-warning)' : 'var(--hub-danger)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card-professional card">
            <h4 className="sidebar-title">Contributors</h4>
            <div className="contributors-list-professional">
              <div className="contributor-row">
                <img src={project.owner?.avatar || `https://ui-avatars.com/api/?name=${project.owner?.name}&background=6366f1&color=fff`} alt="" className="dh-owner-avatar" style={{ width: '32px', height: '32px' }} />
                <div className="contributor-info">
                  <span className="name">{project.owner?.name}</span>
                  <span className="role">Maintainer</span>
                </div>
              </div>
              {project.collaborators?.map(c => (
                <div key={c._id} className="contributor-row">
                  <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}&background=6366f1&color=fff`} alt="" className="dh-owner-avatar" style={{ width: '32px', height: '32px' }} />
                  <div className="contributor-info">
                    <span className="name">{c.name}</span>
                    <span className="role">Contributor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
