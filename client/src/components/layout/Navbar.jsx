import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Search, Sun, Moon, LogOut, User, Folder, Settings } from 'lucide-react'
import { useState } from 'react'
import NotificationBell from '../ui/NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="glass" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: 72, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--s-8)',
      boxShadow: '0 1px 0 0 var(--border)', border: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-6)' }}>
        <Link to="/" style={{ 
          fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', 
          letterSpacing: '-0.8px', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' 
        }}>
          <div style={{ 
            width: 32, height: 32, background: 'var(--accent-gradient)', 
            borderRadius: 10, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: '#fff', fontSize: 16
          }}>E</div>
          <span>Edu<span style={{ color: 'var(--accent)' }}>Cafe</span></span>
        </Link>
      </div>

      <div style={{ flex: 1, maxWidth: 640, margin: '0 var(--s-10)' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <Search size={18} style={{ 
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', 
            color: 'var(--text-muted)', pointerEvents: 'none' 
          }} />
          <input
            type="text"
            placeholder="Search notes, past papers, groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ 
              paddingLeft: 48, borderRadius: 100, 
              backgroundColor: 'var(--bg-secondary)', border: '1px solid transparent'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
          />
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-5)' }}>
        <button 
          onClick={toggleTheme} 
          style={{ 
            color: 'var(--text-secondary)', width: 40, height: 40, 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {user ? (
          <>
            <Link to="/notifications" style={{ 
              color: 'var(--text-secondary)', width: 40, height: 40, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', transition: 'all 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <NotificationBell />
            </Link>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ 
                  width: 38, height: 38, borderRadius: '50%', 
                  background: 'var(--accent-gradient)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', overflow: 'hidden', border: '2px solid var(--bg-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {user.avatar ? <img src={user.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : (user.displayName || user.name).charAt(0).toUpperCase()}
              </div>
              
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, width: 240,
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-p-xl)', 
                  padding: 'var(--s-2)', zIndex: 1000
                }}>
                  <div style={{ padding: 'var(--s-3) var(--s-4)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--s-2)' }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{user.displayName || user.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14, borderRadius: 'var(--radius-md)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><User size={16}/> Profile</Link>
                  <Link to="/collections" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14, borderRadius: 'var(--radius-md)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Folder size={16}/> Collections</Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 14, borderRadius: 'var(--radius-md)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Settings size={16}/> Settings</Link>
                  {['admin', 'moderator'].includes(user.role) && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--warning)', fontSize: 14, borderRadius: 'var(--radius-md)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'var(--danger)', textAlign: 'left', marginTop: 'var(--s-2)', borderTop: '1px solid var(--border)', fontSize: 14, borderRadius: 'var(--radius-md)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><LogOut size={16}/> Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ borderRadius: 100 }}>Sign In</Link>
        )}
      </div>
    </nav>
  )
}
