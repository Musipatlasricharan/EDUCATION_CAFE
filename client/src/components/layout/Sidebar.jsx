import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, TrendingUp, Users, MessageSquare, Trophy, FolderHeart,
  PlusSquare, Mail, Lightbulb, Bot, BookOpen, FileText, ChevronDown,
  GraduationCap, Sparkles, BarChart3, Globe, FileCheck, Code
} from 'lucide-react'
import { useMyGroups } from '../../hooks/useGroups'
import { useSocket } from '../../contexts/SocketContext'

const SectionHeader = ({ label, icon, isOpen, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '6px var(--s-5)',
      color: 'var(--text-muted)', fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 1.5,
      marginBottom: 4, marginTop: 8, cursor: 'pointer',
      background: 'none', border: 'none', fontFamily: 'inherit',
      transition: 'color 0.2s ease'
    }}
    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon} {label}
    </span>
    <ChevronDown
      size={13}
      style={{
        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
        transition: 'transform 0.25s ease'
      }}
    />
  </button>
)

const NavItem = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 'var(--s-4)',
      padding: '9px var(--s-5)', borderRadius: 'var(--radius-md)',
      color: isActive ? '#fff' : 'var(--text-secondary)',
      background: isActive ? 'var(--accent-gradient)' : 'transparent',
      fontWeight: isActive ? 600 : 500,
      fontSize: 14,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isActive ? 'var(--shadow-p-md)' : 'none'
    })}
    onMouseEnter={e => {
      if (!e.currentTarget.style.background.includes('gradient'))
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
    }}
    onMouseLeave={e => {
      if (!e.currentTarget.style.background.includes('gradient'))
        e.currentTarget.style.backgroundColor = 'transparent'
    }}
  >
    {icon} <span>{label}</span>
  </NavLink>
)

export default function Sidebar() {
  const { data: myGroups } = useMyGroups()
  const { socket } = useSocket()
  const [activeGroups, setActiveGroups] = useState([])

  const [openSections, setOpenSections] = useState({
    main: true,
    learn: true,
    community: false,
    tools: false,
  })

  const toggle = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }))

  useEffect(() => {
    if (myGroups) setActiveGroups(myGroups)
  }, [myGroups])

  useEffect(() => {
    if (!socket) return
    const handleGroupActive = ({ groupId }) => {
      setActiveGroups(prev => {
        const idx = prev.findIndex(g => g._id === groupId)
        if (idx === -1) return prev
        const updated = [...prev]
        const [active] = updated.splice(idx, 1)
        return [active, ...updated]
      })
    }
    socket.on('group_active', handleGroupActive)
    return () => socket.off('group_active', handleGroupActive)
  }, [socket])

  return (
    <aside className="glass" style={{
      width: 260, position: 'fixed', left: 0, top: 72, bottom: 0,
      padding: '16px var(--s-3)', overflowY: 'auto', zIndex: 40,
      borderRight: '1px solid var(--border)'
    }}>
      {/* Main */}
      <SectionHeader label="Main" icon={<Globe size={12}/>} isOpen={openSections.main} onClick={() => toggle('main')} />
      {openSections.main && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem to="/" icon={<Home size={18}/>} label="Home" end />
          <NavItem to="/trending" icon={<TrendingUp size={18}/>} label="Trending" />

          <NavItem to="/leaderboard" icon={<Trophy size={18}/>} label="Leaderboard" />
        </div>
      )}

      {/* Learn */}
      <SectionHeader label="Learn" icon={<GraduationCap size={12}/>} isOpen={openSections.learn} onClick={() => toggle('learn')} />
      {openSections.learn && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem to="/coding/problems" icon={<Code size={18}/>} label="Coding Challenges" />
          <NavItem to="/tutoring" icon={<Users size={18}/>} label="Peer Tutoring" />
          <NavItem to="/notes" icon={<FileText size={18}/>} label="Shared Notes" />
          <NavItem to="/resume-builder" icon={<Sparkles size={18}/>} label="Resume AI" />
          <NavItem to="/talent" icon={<Lightbulb size={18}/>} label="Talent Growth" />
          <NavItem to="/ai-agents" icon={<Bot size={18}/>} label="AI Agents" />
          <NavItem to="/agent-docs" icon={<FileCheck size={18}/>} label="Agent Docs" />
        </div>
      )}

      {/* Community */}
      <SectionHeader label="Community" icon={<Users size={12}/>} isOpen={openSections.community} onClick={() => toggle('community')} />
      {openSections.community && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem to="/groups" icon={<Users size={18}/>} label="My Groups" />
          <NavItem to="/chat" icon={<MessageSquare size={18}/>} label="Messages" />
          <NavItem to="/collections" icon={<FolderHeart size={18}/>} label="Collections" />
        </div>
      )}

      {/* Tools */}
      <SectionHeader label="Tools" icon={<PlusSquare size={12}/>} isOpen={openSections.tools} onClick={() => toggle('tools')} />
      {openSections.tools && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem to="/upload" icon={<PlusSquare size={18}/>} label="Upload Resource" />
          <NavItem to="/contact" icon={<Mail size={18}/>} label="Contact Us" />
        </div>
      )}

      {/* Recent Groups */}
      {activeGroups?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1.5,
            marginBottom: 8, paddingLeft: 'var(--s-5)'
          }}>Recent Groups</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeGroups.slice(0, 5).map(g => (
              <NavLink
                key={g._id}
                to={`/groups/${g._id}`}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
                  padding: '7px var(--s-5)', borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                  fontSize: 13
                })}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={e => {
                  const isActive = e.currentTarget.classList.contains('active')
                  e.currentTarget.style.backgroundColor = isActive ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--border)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0, fontSize: 11, fontWeight: 700
                }}>
                  {g.avatar ? <img src={g.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : g.name.charAt(0)}
                </div>
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.name}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
