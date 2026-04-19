import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Trophy, Medal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Leaderboard() {
  const [metric, setMetric] = useState('points') // points, totalUploads, reputation
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['leaderboard', metric],
    queryFn: async () => {
      const { data } = await api.get('/leaderboard', { params: { metric, limit: 10 } })
      return data.data
    }
  })

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', paddingBottom: 'var(--s-16)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--s-12)' }}>
        <div style={{ 
          width: 80, height: 80, background: 'rgba(245, 158, 11, 0.1)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto var(--s-6)' 
        }}>
          <Trophy size={40} color="#f59e0b" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--s-3)', letterSpacing: '-1px' }}>Global Leaderboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500 }}>Recognizing our most dedicated contributors</p>
      </div>

      <div style={{ 
        display: 'flex', justifyContent: 'center', gap: 'var(--s-1)', 
        marginBottom: 'var(--s-8)', backgroundColor: 'var(--bg-secondary)', 
        padding: 'var(--s-1)', borderRadius: 'var(--radius-md)', 
        width: 'fit-content', margin: '0 auto var(--s-10)' 
      }}>
        {['points', 'totalUploads', 'reputation'].map(m => (
          <button 
            key={m}
            onClick={() => setMetric(m)} 
            style={{ 
              padding: '10px 24px', borderRadius: 'var(--radius-sm)', 
              backgroundColor: metric === m ? 'var(--bg-card)' : 'transparent', 
              color: metric === m ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: metric === m ? 700 : 600, 
              fontSize: 14,
              boxShadow: metric === m ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize'
            }}
          >
            {m === 'totalUploads' ? 'Uploads' : m}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner"></div></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {users?.map((user, index) => (
            <div key={user._id} style={{ 
              display: 'flex', alignItems: 'center', padding: 'var(--s-5) var(--s-8)', 
              borderBottom: index < users.length - 1 ? '1px solid var(--border)' : 'none', 
              backgroundColor: index < 3 ? 'rgba(79, 70, 229, 0.02)' : 'transparent',
              transition: 'background-color 0.2s'
            }}>
              <div style={{ 
                width: 60, fontWeight: 800, fontSize: 20, 
                color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--text-muted)', 
                display: 'flex', alignItems: 'center' 
              }}>
                {index < 3 ? <Medal size={28} /> : <span>{index + 1}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', flex: 1 }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: '50%', 
                  background: 'var(--accent-gradient)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 700, boxShadow: 'var(--shadow-sm)' 
                }}>
                  {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name.charAt(0)}
                </div>
                <div>
                  <Link to={`/profile/${user._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16, textDecoration: 'none' }}>{user.name}</Link>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{user.college}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>{user[metric]?.toLocaleString()}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>{metric === 'totalUploads' ? 'Uploads' : metric}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
