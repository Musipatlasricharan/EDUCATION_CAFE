import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/axios'
import useRazorpay from '../hooks/useRazorpay'
import {
  Award, Rocket, Trophy, Flame, Zap, Star, Shield,
  UploadCloud, Download, Edit, Bot, Map, Users, BookOpen,
  FileText, Briefcase, MessageSquare, CheckCircle, Clock,
  TrendingUp, Bookmark, Heart, Target
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import './Profile.css'

const icons = {
  Rocket, Trophy, Flame, Zap, Star, Shield, Award, UploadCloud,
  Download, Package: Star, Orbit: Star, Archive: Award,
  RefreshCw: Star, Lock: Shield, RotateCcw: Flame,
  Signal: Star, Users: Award, CheckCircle: Star, Scale: Shield
}

const BadgeIcon = ({ name, color, size = 20 }) => {
  const IconComp = icons[name] || Award
  return <IconComp size={size} style={{ color }} />
}

const AI_TYPE_META = {
  PDF_SUMMARIZER: { label: 'PDF Summarizer', color: '#6366f1', icon: FileText },
  CAREER_SCOUT:   { label: 'Career Scout',   color: '#10b981', icon: Briefcase },
  INTERVIEW_PREP: { label: 'Interview Prep', color: '#f59e0b', icon: MessageSquare },
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']

const StatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div className="profile-stat-card">
    <div className="profile-stat-icon" style={{ backgroundColor: bg, color }}>
      <Icon size={22} />
    </div>
    <div>
      <p className="profile-stat-value">{value ?? 0}</p>
      <p className="profile-stat-label">{label}</p>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    )
  }
  return null
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const queryClient = useQueryClient()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/stats')
      return data.data
    }
  })

  const { initiatePayment, paying } = useRazorpay({
    onSuccess: async () => {
      // Refresh user context + stats after payment
      try {
        const res = await api.get('/auth/me')
        if (res.data.success) setUser(prev => ({ ...prev, isPremium: true, ...res.data.user }))
      } catch {}
      queryClient.invalidateQueries(['user-stats'])
    }
  })

  if (isLoading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )

  const groupedBadges = stats?.badges?.reduce((acc, badge) => {
    acc[badge.category] = acc[badge.category] || []
    acc[badge.category].push(badge)
    return acc
  }, {}) || {}

  // AI Pie chart data
  const aiPieData = Object.entries(AI_TYPE_META).map(([key, meta]) => ({
    name: meta.label,
    value: stats?.aiUsageByType?.[key] || 0,
    color: meta.color
  })).filter(d => d.value > 0)

  const hasAiUsage = (stats?.totalAiUsage || 0) > 0

  // Activity line chart data — last 7 days of AI use
  const activityData = stats?.recentAiActivity || []

  // Radar chart for profile completeness / skill signals
  const radarData = [
    { subject: 'Uploads',    A: Math.min((stats?.totalUploads || 0) * 10, 100) },
    { subject: 'Downloads',  A: Math.min((stats?.totalDownloads || 0) * 2, 100) },
    { subject: 'AI Usage',   A: Math.min((stats?.totalAiUsage || 0) * 10, 100) },
    { subject: 'Roadmaps',   A: Math.min((stats?.roadmapCount || 0) * 20, 100) },
    { subject: 'Streak',     A: Math.min((stats?.currentStreak || 0) * 10, 100) },
    { subject: 'Badges',     A: Math.min((stats?.badges?.length || 0) * 12, 100) },
  ]

  // Points trend (simulated from points bucket)
  const pointsTrend = [
    { name: 'W1', points: Math.max(0, (stats?.points || 0) - 120) },
    { name: 'W2', points: Math.max(0, (stats?.points || 0) - 80) },
    { name: 'W3', points: Math.max(0, (stats?.points || 0) - 40) },
    { name: 'W4', points: Math.max(0, (stats?.points || 0) - 15) },
    { name: 'Now', points: stats?.points || 0 },
  ]

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  const lastAi = stats?.lastAiInteraction
    ? new Date(stats.lastAiInteraction).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never'

  return (
    <div className="profile-page">

      {/* ── HEADER CARD ── */}
      <div className="profile-hero card">
        <div className="profile-hero-left">
          <div className="profile-avatar-wrap">
            {user.avatar
              ? <img src={user.avatar} className="profile-avatar-img" alt="avatar" />
              : <span className="profile-avatar-initial">{user.name?.charAt(0)}</span>
            }
            {stats?.currentStreak > 0 && (
              <div className="streak-badge">
                <Flame size={11} fill="#fff" /> {stats.currentStreak}
              </div>
            )}
            {stats?.isPremium && <div className="premium-badge">✦ PRO</div>}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-meta">
              {user.role === 'admin' ? '⚙ Administrator' : `${user.course || 'Student'} · ${user.college || 'College'}`}
            </p>
            {user.bio && <p className="profile-bio">"{user.bio}"</p>}
            <div className="profile-chips">
              <span className="chip chip-blue"><Star size={12} /> {stats?.reputation || 0} Reputation</span>
              <span className="chip chip-amber"><Zap size={12} /> {stats?.points || 0} Points</span>
              <span className="chip chip-green"><Clock size={12} /> Joined {memberSince}</span>
              {stats?.isPremium && <span className="chip chip-purple">✦ Premium Member</span>}
            </div>
          </div>
        </div>
        <Link to="/profile/edit" className="btn-primary profile-edit-btn">
          <Edit size={15} /> Edit Profile
        </Link>
      </div>

      {/* ── MAIN STATS ROW ── */}
      <div className="profile-stats-grid">
        <StatCard icon={UploadCloud}  value={stats?.totalUploads}     label="Uploads"        color="#3b82f6" bg="rgba(59,130,246,0.12)" />
        <StatCard icon={Download}     value={stats?.totalDownloads}    label="Downloads"      color="#10b981" bg="rgba(16,185,129,0.12)" />
        <StatCard icon={Heart}        value={stats?.totalLikes}        label="Likes Received" color="#ec4899" bg="rgba(236,72,153,0.12)" />
        <StatCard icon={Trophy}       value={stats?.badges?.length}    label="Badges"         color="#8b5cf6" bg="rgba(139,92,246,0.12)" />
        <StatCard icon={Flame}        value={stats?.longestStreak}     label="Best Streak"    color="#f97316" bg="rgba(249,115,22,0.12)" />
        <StatCard icon={Users}        value={stats?.groupsJoined}      label="Groups"         color="#06b6d4" bg="rgba(6,182,212,0.12)"  />
        <StatCard icon={Bot}          value={stats?.totalAiUsage}      label="AI Runs"        color="#a855f7" bg="rgba(168,85,247,0.12)" />
        <StatCard icon={Map}          value={stats?.roadmapCount}      label="Roadmaps"       color="#14b8a6" bg="rgba(20,184,166,0.12)" />
      </div>

      {/* ── AI AGENT SECTION ── */}
      <div className="section-title-row">
        <Bot size={20} className="section-icon ai-icon" />
        <h2 className="section-title">AI Agent Intelligence</h2>
        <span className="section-sub">Your personal AI workspace activity</span>
      </div>

      <div className="profile-ai-grid">
        {/* AI Usage Pie */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">Usage Breakdown</h3>
          {hasAiUsage ? (
            <>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {aiPieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend">
                {aiPieData.map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ backgroundColor: d.color }} />
                    <span className="pie-legend-label">{d.name}</span>
                    <span className="pie-legend-val">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-chart">
              <Bot size={40} style={{ opacity: 0.2 }} />
              <p>No AI usage yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Start with PDF Summarizer or Interview Prep!</p>
            </div>
          )}
        </div>

        {/* AI 7-Day Activity Bar */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">7-Day AI Activity</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barSize={22}>
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="AI Runs" radius={[6,6,0,0]}>
                  {activityData.map((_, idx) => (
                    <Cell key={idx} fill={`hsl(${240 + idx * 15}, 80%, 65%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Agent Cards */}
        <div className="card profile-chart-card ai-agents-summary">
          <h3 className="chart-title">Agent Breakdown</h3>
          <div className="ai-agent-cards">
            {Object.entries(AI_TYPE_META).map(([key, meta]) => {
              const count = stats?.aiUsageByType?.[key] || 0
              const IconC = meta.icon
              const pct = hasAiUsage ? Math.round((count / stats.totalAiUsage) * 100) : 0
              return (
                <div key={key} className="ai-agent-item">
                  <div className="ai-agent-icon" style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
                    <IconC size={20} />
                  </div>
                  <div className="ai-agent-info">
                    <div className="ai-agent-header">
                      <span className="ai-agent-name">{meta.label}</span>
                      <span className="ai-agent-count" style={{ color: meta.color }}>{count} runs</span>
                    </div>
                    <div className="ai-progress-bar">
                      <div className="ai-progress-fill" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                    <p className="ai-agent-pct">{pct}% of total usage</p>
                  </div>
                </div>
              )
            })}
            <div className="ai-last-active">
              <Clock size={13} />
              <span>Last AI Session: <strong>{lastAi}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CODING SECTION ── */}
      <div className="section-title-row">
        <Trophy size={20} className="section-icon trophy-icon" />
        <h2 className="section-title">Coding Mastery</h2>
        <span className="section-sub">Solved {stats?.codingStats?.totalSolved || 0} coding challenges</span>
      </div>

      <div className="profile-ai-grid profile-coding-grid">
        {/* Difficulty Stats */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">By Difficulty</h3>
          <div className="difficulty-stats-bars">
            {Object.entries(stats?.codingStats?.solvedByDifficulty || {}).map(([diff, count]) => {
              const color = diff === 'Easy' ? '#10b981' : diff === 'Medium' ? '#f59e0b' : '#ef4444';
              const diffVals = Object.values(stats?.codingStats?.solvedByDifficulty || {});
              const maxVal = diffVals.length > 0 ? Math.max(...diffVals, 1) : 1;
              const pct = (count / maxVal) * 100;
              return (
                <div key={diff} className="diff-bar-item">
                  <div className="diff-bar-label">
                    <span style={{ color, fontWeight: 600 }}>{diff}</span>
                    <span className="diff-bar-count">{count} Solved</span>
                  </div>
                  <div className="diff-bar-bg">
                    <div className="diff-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tag Domains */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">Top Skill Tags</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats?.codingStats?.solvedByTags || []} 
                layout="vertical"
                margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="var(--text-secondary)" 
                  fontSize={10} 
                  width={70} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" name="Solved" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="card profile-chart-card coding-status">
          <h3 className="chart-title">Access Status</h3>
          <div className="coding-trials-content">
            <div className="trial-status-circle" style={{ borderColor: stats?.isPremium ? '#8b5cf6' : '#6366f1' }}>
              <span className="trial-main-val">
                {stats?.isPremium ? '∞' : `${stats?.codingStats?.codingTrialCount || 0}/5`}
              </span>
              <span className="trial-sub-lbl">{stats?.isPremium ? 'PRO MEMBER' : 'Trials Used'}</span>
            </div>
            <div className="access-action-box">
              {stats?.isPremium ? (
                <p className="access-msg premium-text"><Zap size={14} fill="#8b5cf6" /> Unlimited Developer Access</p>
              ) : (
                <p className="access-msg">
                  {Math.max(0, 5 - (stats?.codingStats?.codingTrialCount || 0))} free trials remaining
                </p>
              )}
              {!stats?.isPremium ? (
                <button
                  onClick={() => initiatePayment(user)}
                  disabled={paying}
                  className="btn-pro-upgrade"
                  style={{ opacity: paying ? 0.7 : 1, cursor: paying ? 'wait' : 'pointer' }}
                >
                  {paying ? '⏳ Processing...' : 'Unlock Pro Access ✨'}
                </button>
              ) : (
                <span className="btn-pro-upgrade" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>View Billing</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROADMAP & RESOURCE SECTION ── */}
      <div className="section-title-row">
        <Map size={20} className="section-icon roadmap-icon" />
        <h2 className="section-title">Learning & Resources</h2>
        <span className="section-sub">Roadmaps created and content contributed</span>
      </div>

      <div className="profile-learning-grid">
        {/* Roadmap Progress cards */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">Roadmap Status</h3>
          <div className="roadmap-stats-wrap">
            <div className="roadmap-stat-item" style={{ borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)' }}>
              <Target size={22} style={{ color: '#10b981' }} />
              <div>
                <p className="roadmap-stat-num">{stats?.activeRoadmaps || 0}</p>
                <p className="roadmap-stat-lbl">Active</p>
              </div>
            </div>
            <div className="roadmap-stat-item" style={{ borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.06)' }}>
              <CheckCircle size={22} style={{ color: '#8b5cf6' }} />
              <div>
                <p className="roadmap-stat-num">{stats?.completedRoadmaps || 0}</p>
                <p className="roadmap-stat-lbl">Completed</p>
              </div>
            </div>
            <div className="roadmap-stat-item" style={{ borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)' }}>
              <Map size={22} style={{ color: '#3b82f6' }} />
              <div>
                <p className="roadmap-stat-num">{stats?.roadmapCount || 0}</p>
                <p className="roadmap-stat-lbl">Total</p>
              </div>
            </div>
          </div>
          <div className="roadmap-progress-row">
            <span className="roadmap-progress-label">Completion Rate</span>
            <span className="roadmap-progress-pct">
              {stats?.roadmapCount > 0
                ? `${Math.round((stats.completedRoadmaps / stats.roadmapCount) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          <div className="roadmap-bar-bg">
            <div
              className="roadmap-bar-fill"
              style={{
                width: stats?.roadmapCount > 0
                  ? `${Math.round((stats.completedRoadmaps / stats.roadmapCount) * 100)}%`
                  : '0%'
              }}
            />
          </div>
        </div>

        {/* Resources by Subject Pie */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">Uploads by Subject</h3>
          {(stats?.resourcesBySubject?.length || 0) > 0 ? (
            <>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.resourcesBySubject}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.resourcesBySubject.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pie-legend compact">
                {stats.resourcesBySubject.map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="pie-legend-label">{d.name}</span>
                    <span className="pie-legend-val">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-chart">
              <BookOpen size={40} style={{ opacity: 0.2 }} />
              <p>No uploads yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Upload resources to see your subject distribution!</p>
            </div>
          )}
        </div>

        {/* Activity Radar */}
        <div className="card profile-chart-card">
          <h3 className="chart-title">Activity Profile</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="var(--border)" />
                <Radar name="You" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── POINTS TREND + QUICK STATS ── */}
      <div className="profile-bottom-grid">
        {/* Points Chart */}
        <div className="card profile-chart-card">
          <h3 className="chart-title"><TrendingUp size={16} style={{ marginRight: 6 }} />Points Velocity</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pointsTrend}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="points" name="Points" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="milestone-box">
            <div className="milestone-header">
              <span>Next Milestone</span>
              <span className="milestone-pct">{100 - ((stats?.totalUploads || 0) % 10)} uploads to go</span>
            </div>
            <div className="milestone-bar-bg">
              <div className="milestone-bar-fill" style={{ width: `${((stats?.totalUploads || 0) % 10) * 10}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="card profile-quick-stats">
          <h3 className="chart-title">Quick Overview</h3>
          <div className="quick-stats-list">
            {[
              { icon: Bookmark,     label: 'Saved Resources',  value: stats?.savedResourcesCount,  color: '#3b82f6' },
              { icon: BookOpen,     label: 'Collections',       value: stats?.collectionsCount,      color: '#8b5cf6' },
              { icon: MessageSquare,label: 'Discussion Wins',   value: stats?.discussionWins,         color: '#10b981' },
              { icon: Flame,        label: 'Current Streak',    value: `${stats?.currentStreak || 0}d`, color: '#f97316' },
              { icon: Award,        label: 'Total Points',      value: stats?.points,                 color: '#f59e0b' },
              { icon: Bot,          label: 'AI Runs (Total)',   value: stats?.totalAiUsage,           color: '#a855f7' },
            ].map(({ icon: IconC, label, value, color }, i) => (
              <div key={i} className="quick-stat-row">
                <div className="quick-stat-icon" style={{ color, backgroundColor: `${color}15` }}>
                  <IconC size={15} />
                </div>
                <span className="quick-stat-label">{label}</span>
                <span className="quick-stat-value" style={{ color }}>{value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BADGES SECTION ── */}
      {Object.keys(groupedBadges).length > 0 && (
        <>
          <div className="section-title-row">
            <Trophy size={20} className="section-icon trophy-icon" />
            <h2 className="section-title">Achievement Cabinet</h2>
            <span className="section-sub">{stats?.badges?.length} badges earned</span>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {Object.entries(groupedBadges).map(([category, badges]) => (
                <div key={category}>
                  <h3 className="badge-category-title">{category} Tracks</h3>
                  <div className="badge-grid">
                    {badges.map(badge => (
                      <div key={badge._id} className="badge-card">
                        <div className="badge-icon-wrap" style={{ backgroundColor: `${badge.color}18`, color: badge.color }}>
                          <BadgeIcon name={badge.icon} color={badge.color} size={28} />
                        </div>
                        <p className="badge-name">{badge.name}</p>
                        <span className="badge-rarity" style={{ color: badge.color }}>{badge.rarity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}