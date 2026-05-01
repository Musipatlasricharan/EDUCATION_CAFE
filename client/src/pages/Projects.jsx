import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Star, GitFork, Eye, Plus, Search, Code2, Globe, Github,
  Layers, Terminal, BookOpen, Clock, FileText, Database,
  Lightbulb, Download, Shield, Sparkles, Flame, History,
  TrendingUp, Zap, ArrowRight, CheckCircle, Users, GitBranch,
  Package, Filter, ChevronRight, BookMarked, Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './Projects.css'

const PROJECT_TYPES = [
  { id: '', label: 'All Repositories', icon: Globe, color: '#6366f1' },
  { id: 'project', label: 'Software Project', icon: Code2, color: '#6366f1' },
  { id: 'research-paper', label: 'Research Paper', icon: FileText, color: '#ec4899' },
  { id: 'thesis', label: 'Thesis / Dissertation', icon: BookOpen, color: '#f59e0b' },
  { id: 'dataset', label: 'Dataset', icon: Database, color: '#10b981' },
  { id: 'tool', label: 'Tool / Library', icon: Terminal, color: '#8b5cf6' },
  { id: 'tutorial', label: 'Educational Content', icon: Lightbulb, color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: Layers, color: '#64748b' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'stars', label: 'Most Starred' },
  { value: 'forks', label: 'Most Forked' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'views', label: 'Most Viewed' },
]

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── Repository Card ─────────────────────────────────────────────────────────
const RepoCard = ({ project, currentUserId, index }) => {
  const [starred, setStarred] = useState(project.stars?.some(id => (id._id || id).toString() === currentUserId?.toString()))
  const [starCount, setStarCount] = useState(project.stars?.length || 0)
  const [busy, setBusy] = useState(false)

  const handleStar = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const res = await api.post(`/projects/${project._id}/star`)
      setStarred(res.data.starred)
      setStarCount(res.data.starCount)
    } catch { toast.error('Failed') }
    finally { setBusy(false) }
  }

  const type = PROJECT_TYPES.find(t => t.id === project.projectType) || PROJECT_TYPES[1]
  const TypeIcon = type.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 6) * 0.05, duration: 0.5 }}
      className="dh-repo-card"
      style={{ '--card-accent': type.color }}
    >
      <Link to={`/projects/${project._id}`} className="dh-card-link">
        <div className="dh-card-top">
          <div className="dh-type-chip" style={{ background: `${type.color}15`, color: type.color, border: `1px solid ${type.color}30` }}>
            <TypeIcon size={12} strokeWidth={2.5} />
            {type.label}
          </div>
          {starCount > 5 && (
            <div className="dh-hot-tag">
              <Flame size={11} strokeWidth={2.5} /> HOT
            </div>
          )}
        </div>

        <div className="dh-card-body">
          <div className="dh-owner-row">
            <img
              src={project.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner?.name || 'U')}&background=6366f1&color=fff&size=32`}
              alt=""
              className="dh-owner-avatar"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff` }}
            />
            <div className="dh-owner-info">
              <span className="dh-owner-name">{project.owner?.name || 'Unknown'}</span>
              <span className="dh-owner-college">{project.owner?.college || 'University'}</span>
            </div>
          </div>

          <h3 className="dh-card-title">{project.title}</h3>
          <p className="dh-card-desc">{project.description}</p>

          {project.techStack?.length > 0 && (
            <div className="dh-tech-row">
              {project.techStack.slice(0, 3).map(t => (
                <span key={t} className="dh-tech-tag">{t}</span>
              ))}
              {project.techStack.length > 3 && (
                <span className="dh-tech-tag">+{project.techStack.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="dh-card-footer">
          <div className="dh-stats-row">
            <button className={`dh-stat-btn ${starred ? 'starred' : ''}`} onClick={handleStar} disabled={busy}>
              <Star size={14} fill={starred ? 'currentColor' : 'none'} strokeWidth={2} />
              <span>{starCount}</span>
            </button>
            <span className="dh-stat">
              <GitFork size={14} strokeWidth={2} />
              <span>{project.forks?.length || 0}</span>
            </span>
            <span className="dh-stat">
              <Download size={14} strokeWidth={2} />
              <span>{project.downloads || 0}</span>
            </span>
          </div>
          <span className="dh-time">
            <Clock size={12} strokeWidth={2} />
            {timeAgo(project.updatedAt)}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── My Project Row (for Dashboard) ──────────────────────────────────────────
const MyRepoRow = ({ project, onDelete, index }) => {
  const type = PROJECT_TYPES.find(t => t.id === project.projectType) || PROJECT_TYPES[1]
  const TypeIcon = type.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="dh-my-repo-row"
    >
      <div className="dh-my-repo-left">
        <div className="dh-my-type-icon" style={{ color: type.color, background: `${type.color}15`, border: `1px solid ${type.color}30` }}>
          <TypeIcon size={18} />
        </div>
        <div>
          <Link to={`/projects/${project._id}`} className="dh-my-repo-title">{project.title}</Link>
          <div className="dh-my-repo-meta">
            <span className={`dh-status-dot ${project.isPublic ? 'public' : 'private'}`} />
            {project.isPublic ? 'Public' : 'Private'} · {timeAgo(project.updatedAt)} · <Star size={12} /> {project.stars?.length || 0}
          </div>
        </div>
      </div>
      <div className="dh-my-repo-actions">
        <Link to={`/projects/${project._id}/edit`} className="dh-action-btn edit">Edit</Link>
        <button className="dh-action-btn danger" onClick={() => onDelete(project._id)}>Delete</button>
        <Link to={`/projects/${project._id}`} className="dh-action-btn view"><ChevronRight size={18} /></Link>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Projects() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const timer = useRef(null)

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [typeFilter, setTypeFilter] = useState('')
  const [tab, setTab] = useState('explore') // explore | mine | contributions
  const [myProjects, setMyProjects] = useState([])
  const [myContribs, setMyContribs] = useState([])
  const [dashLoading, setDashLoading] = useState(false)
  const [trendingTech, setTrendingTech] = useState([])

  const fetchProjects = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 12, sort })
      if (search) params.set('search', search)
      if (typeFilter) params.set('type', typeFilter)
      const res = await api.get(`/projects?${params}`)
      setProjects(res.data.projects || [])
      setTotal(res.data.total || 0)
      setPages(res.data.pages || 1)
    } catch { toast.error('Failed to load repositories') }
    finally { setLoading(false) }
  }, [search, sort, typeFilter])

  useEffect(() => { fetchProjects(page) }, [page, sort, typeFilter])

  // Debounced search
  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setPage(1); fetchProjects(1) }, 450)
    return () => clearTimeout(timer.current)
  }, [search])

  // Trending tech
  useEffect(() => {
    api.get('/projects/trending-tech')
      .then(r => setTrendingTech(r.data.tech?.slice(0, 10) || []))
      .catch(() => {})
  }, [])

  const loadDashboard = async () => {
    setDashLoading(true)
    try {
      const [mine, contribs] = await Promise.all([
        api.get('/projects/my'),
        api.get('/projects/my-contributions'),
      ])
      setMyProjects(mine.data.projects || [])
      setMyContribs(contribs.data.contributions || [])
    } catch { toast.error('Dashboard load failed') }
    finally { setDashLoading(false) }
  }

  useEffect(() => {
    if (tab !== 'explore') loadDashboard()
  }, [tab])

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this repository?')) return
    try {
      await api.delete(`/projects/${id}`)
      setMyProjects(p => p.filter(x => x._id !== id))
      toast.success('Repository deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="dh-page">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="dh-hero">
        <div className="dh-hero-bg" />
        <div className="dh-hero-inner">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="dh-hero-badge">
              <Sparkles size={14} />
              <span>Dev Hub: Open Innovation Platform</span>
              <div className="dh-badge-pulse" />
            </div>

            <h1 className="dh-hero-title">
              Showcase Your <br />
              <span className="dh-gradient-text">Scholarly Innovation.</span>
            </h1>

            <p className="dh-hero-subtitle">
              The premier open repository for student developers and researchers. 
              Publish papers, software, and datasets in a professional environment.
            </p>

            <div className="dh-hero-actions">
              <button className="dh-btn-primary" onClick={() => navigate('/projects/new')}>
                <Plus size={18} strokeWidth={2.5} />
                Create Repository
              </button>
              <button className="dh-btn-ghost" onClick={() => setTab('mine')}>
                <GitBranch size={18} />
                My Portfolio
              </button>
            </div>

            <div className="dh-hero-stats">
              <div className="dh-hero-stat">
                <span className="dh-hero-stat-value">{total}</span>
                <span className="dh-hero-stat-label">Repositories</span>
              </div>
              <div className="dh-stat-divider" />
              <div className="dh-hero-stat">
                <span className="dh-hero-stat-value">Open</span>
                <span className="dh-hero-stat-label">Source</span>
              </div>
              <div className="dh-stat-divider" />
              <div className="dh-hero-stat">
                <CheckCircle size={24} color="#10b981" />
                <span className="dh-hero-stat-label">Verified</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="dh-hero-card-preview"
          >
            <div className="dh-preview-header">
              <div className="dh-preview-dots">
                <span className="dot-r" /><span className="dot-y" /><span className="dot-g" />
              </div>
              <span className="dh-preview-file">edu_repo_manifest.json</span>
            </div>
            <div className="dh-preview-body">
              <div className="dh-code-line"><span className="dh-key">"manifest"</span><span className="dh-punc">: {`{`}</span></div>
              <div className="dh-code-line ml"><span className="dh-key">"author"</span><span className="dh-punc">:</span> <span className="dh-str">"{user?.name || 'Academic Scholar'}"</span><span className="dh-punc">,</span></div>
              <div className="dh-code-line ml"><span className="dh-key">"status"</span><span className="dh-punc">:</span> <span className="dh-str">"Published"</span><span className="dh-punc">,</span></div>
              <div className="dh-code-line ml"><span className="dh-key">"visibility"</span><span className="dh-punc">:</span> <span className="dh-bool">true</span><span className="dh-punc">,</span></div>
              <div className="dh-code-line ml"><span className="dh-key">"collaboration"</span><span className="dh-punc">:</span> <span className="dh-bool">enabled</span><span className="dh-punc">,</span></div>
              <div className="dh-code-line ml"><span className="dh-key">"version"</span><span className="dh-punc">:</span> <span className="dh-num">2.4.0</span></div>
              <div className="dh-code-line"><span className="dh-punc">{`}`}</span></div>
            </div>
            <div className="dh-preview-footer">
              <span className="dh-status-live"><span className="dh-status-dot-live" /> System Active</span>
              <span>v{new Date().getFullYear()}.05.01</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="dh-body">
        <aside className="dh-sidebar">
          <div className="dh-sidebar-group">
            <p className="dh-sidebar-label">Navigation</p>
            {[
              { id: 'explore', label: 'Explore Hub', icon: Globe },
              { id: 'mine', label: 'My Repositories', icon: GitBranch },
              { id: 'contributions', label: 'Pull Requests', icon: History },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`dh-nav-btn ${tab === id ? 'active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div className="dh-sidebar-group">
            <p className="dh-sidebar-label">Categories</p>
            {PROJECT_TYPES.map(t => (
              <button
                key={t.id}
                className={`dh-cat-btn ${typeFilter === t.id ? 'active' : ''}`}
                style={{ '--cat-color': t.color }}
                onClick={() => { setTypeFilter(t.id); setPage(1) }}
              >
                <t.icon size={16} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {trendingTech.length > 0 && (
            <div className="dh-sidebar-group">
              <p className="dh-sidebar-label">Trending Technologies</p>
              <div className="dh-trending-tech">
                {trendingTech.map(t => (
                  <button key={t._id} className="dh-tech-chip">
                    {t._id}
                    <span className="dh-tech-count">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="dh-feed">
          <div className="dh-controls">
            <div className="dh-search-box">
              <Search size={18} className="dh-search-icon" />
              <input
                ref={searchRef}
                className="dh-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search research papers, software, datasets..."
              />
            </div>
            <select
              className="dh-sort-select"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1) }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="dh-feed-header">
            <span className="dh-feed-count">
              {tab === 'explore' ? `${total} Results Found` : tab === 'mine' ? `${myProjects.length} Repositories` : `${myContribs.length} Active Contributions`}
            </span>
            {typeFilter && (
              <button className="dh-clear-filter" onClick={() => setTypeFilter('')}>Reset Filters ×</button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${typeFilter}-${sort}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {tab === 'explore' && (
                loading ? (
                  <div className="dh-repo-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="dh-repo-card dh-skeleton">
                        <div className="dh-card-link">
                          <div className="dh-sk-chip" />
                          <div className="dh-sk-title" />
                          <div className="dh-sk-line" />
                          <div className="dh-sk-line short" />
                          <div className="dh-sk-footer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="dh-empty">
                    <Package size={64} strokeWidth={1} color="var(--hub-text-muted)" />
                    <h3>No results match your criteria</h3>
                    <p>Try broadening your search or change the category filter.</p>
                    <button className="dh-btn-primary" onClick={() => navigate('/projects/new')}>Publish Your Work</button>
                  </div>
                ) : (
                  <div className="dh-repo-grid">
                    {projects.map((p, i) => <RepoCard key={p._id} project={p} currentUserId={user?._id} index={i} />)}
                  </div>
                )
              )}

              {tab === 'mine' && (
                dashLoading ? (
                  <div className="dh-loading-center"><div className="dh-spinner" /></div>
                ) : (
                  <>
                    <div className="activity-heatmap-card card">
                      <div className="heatmap-header">
                        <div className="header-left">
                          <Flame size={18} color="var(--hub-accent)" />
                          <h4>Contribution Activity</h4>
                        </div>
                        <div className="header-right">
                          <span>{myProjects.length + myContribs.length} total contributions</span>
                        </div>
                      </div>
                      <div className="heatmap-grid">
                        {[...Array(52)].map((_, weekIndex) => (
                          <div key={weekIndex} className="heatmap-column">
                            {[...Array(7)].map((_, dayIndex) => {
                              const level = Math.floor(Math.random() * 4) // Mocking activity levels
                              return <div key={dayIndex} className={`heatmap-cell level-${level}`} title={`Activity level: ${level}`} />
                            })}
                          </div>
                        ))}
                      </div>
                      <div className="heatmap-footer">
                        <span>Less</span>
                        <div className="heatmap-cell level-0" /><div className="heatmap-cell level-1" /><div className="heatmap-cell level-2" /><div className="heatmap-cell level-3" />
                        <span>More</span>
                      </div>
                    </div>

                    {myProjects.length === 0 ? (
                      <div className="dh-empty">
                        <GitBranch size={64} strokeWidth={1} color="var(--hub-text-muted)" />
                        <h3>Your portfolio is empty</h3>
                        <p>Start by creating your first repository to showcase your skills.</p>
                        <button className="dh-btn-primary" onClick={() => navigate('/projects/new')}>Create New Repository</button>
                      </div>
                    ) : (
                      <div className="dh-my-repos-list">
                        <div className="dh-my-repos-header">
                          <span>Repository Details</span>
                          <span>Manage</span>
                        </div>
                        {myProjects.map((p, i) => <MyRepoRow key={p._id} project={p} onDelete={handleDelete} index={i} />)}
                      </div>
                    )}
                  </>
                )
              )}

              {tab === 'contributions' && (
                dashLoading ? (
                  <div className="dh-loading-center"><div className="dh-spinner" /></div>
                ) : myContribs.length === 0 ? (
                  <div className="dh-empty">
                    <Award size={64} strokeWidth={1} color="var(--hub-text-muted)" />
                    <h3>No contributions found</h3>
                    <p>Contribute to other projects to build your academic network.</p>
                    <button className="dh-btn-primary" onClick={() => setTab('explore')}>Explore Projects</button>
                  </div>
                ) : (
                  <div className="dh-timeline">
                    {myContribs.map((c, i) => (
                      <motion.div
                        key={c.contribution._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="timeline-item"
                      >
                        <div className="timeline-marker"><GitFork size={16} /></div>
                        <div className="timeline-card">
                          <div className="contrib-header">
                            <span className={`status-pill ${c.contribution.status}`}>{c.contribution.status}</span>
                            <span className="timestamp">{timeAgo(c.contribution.createdAt)}</span>
                          </div>
                          <h4 className="contrib-title">{c.contribution.title}</h4>
                          <p className="contrib-desc">
                            Repository: <Link to={`/projects/${c.project._id}`} style={{ color: 'var(--hub-accent)', fontWeight: 600 }}>{c.project.title}</Link>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>

          {tab === 'explore' && !loading && pages > 1 && (
            <div className="dh-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
              <button className="dh-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[...Array(pages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`dh-nav-btn ${page === i + 1 ? 'active' : ''}`} 
                    style={{ width: '40px', justifyContent: 'center' }}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button className="dh-btn-ghost" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
