import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Trophy, Medal, Crown, Star, ArrowUp, User as UserIcon, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Leaderboard() {
  const { user: currentUser } = useAuth()
  const [metric, setMetric] = useState('points') // points, totalUploads, reputation
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['leaderboard', metric],
    queryFn: async () => {
      const { data } = await api.get('/leaderboard', { params: { metric, limit: 10 } })
      return data.data
    }
  })

  const { data: myRankData } = useQuery({
    queryKey: ['my-rank', metric],
    queryFn: async () => {
      const { data } = await api.get('/leaderboard/my-rank', { params: { metric } })
      return data
    },
    enabled: !!currentUser
  })

  const topThree = users?.slice(0, 3) || []
  const restUsers = users?.slice(3) || []

  const metricLabels = {
    points: 'Study Points',
    totalUploads: 'Resources Shared',
    reputation: 'Community Karma'
  }

  const getMetricIcon = (m) => {
    switch(m) {
      case 'points': return <Star size={16} />
      case 'totalUploads': return <ArrowUp size={16} />
      case 'reputation': return <Trophy size={16} />
      default: return null
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 'var(--s-16)' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--s-12)', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
          zIndex: -1
        }} />
        <h1 style={{ 
          fontSize: 48, fontWeight: 900, color: 'var(--text-primary)', 
          marginBottom: 'var(--s-2)', letterSpacing: '-2px',
          background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Hall of Fame
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, fontWeight: 500, maxWidth: 500, margin: '0 auto' }}>
          Celebrating the excellence and contributions of our top scholars
        </p>
      </div>

      {/* Metric Selector - Modern Segmented Control */}
      <div style={{ 
        display: 'flex', justifyContent: 'center', gap: 'var(--s-2)', 
        marginBottom: 'var(--s-12)', backgroundColor: 'var(--bg-secondary)', 
        padding: 'var(--s-2)', borderRadius: 'var(--radius-xl)', 
        width: 'fit-content', margin: '0 auto var(--s-12)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid var(--border)'
      }}>
        {Object.keys(metricLabels).map(m => (
          <button 
            key={m}
            onClick={() => setMetric(m)} 
            style={{ 
              padding: '12px 28px', borderRadius: 'var(--radius-lg)', 
              backgroundColor: metric === m ? 'var(--bg-card)' : 'transparent', 
              color: metric === m ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: metric === m ? 700 : 600, 
              fontSize: 15,
              boxShadow: metric === m ? 'var(--shadow-p-md)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', alignItems: 'center', gap: 'var(--s-2)',
              border: metric === m ? '1px solid var(--border)' : '1px solid transparent'
            }}
          >
            {getMetricIcon(m)}
            {metricLabels[m]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Podium Section */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 'var(--s-6)', alignItems: 'end', marginBottom: 'var(--s-12)',
            padding: '0 var(--s-4)'
          }}>
            {/* Rank 2 */}
            <div style={{ order: 1 }}>
              {topThree[1] && <PodiumCard user={topThree[1]} rank={2} metric={metric} isMe={topThree[1]?._id === currentUser?._id} />}
            </div>
            {/* Rank 1 */}
            <div style={{ order: 2 }}>
              {topThree[0] && <PodiumCard user={topThree[0]} rank={1} metric={metric} featured isMe={topThree[0]?._id === currentUser?._id} />}
            </div>
            {/* Rank 3 */}
            <div style={{ order: 3 }}>
              {topThree[2] && <PodiumCard user={topThree[2]} rank={3} metric={metric} isMe={topThree[2]?._id === currentUser?._id} />}
            </div>
          </div>

          {/* User's Personal Rank - Only if not in top 3 */}
          {myRankData && myRankData.rank > 3 && (
            <div className="card" style={{ 
              marginBottom: 'var(--s-8)', 
              background: 'linear-gradient(to right, var(--bg-card), rgba(79, 70, 229, 0.05))',
              border: '2px solid var(--accent)',
              padding: 'var(--s-4) var(--s-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
                <div style={{ 
                  width: 50, height: 50, borderRadius: '50%', background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <Target size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>Your Standing</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Keep contributing to climb higher!</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Rank</p>
                <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>#{myRankData.rank}</p>
              </div>
            </div>
          )}

          {/* List Section */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ 
              padding: 'var(--s-4) var(--s-8)', background: 'var(--bg-secondary)', 
              display: 'flex', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ width: 60 }}>Rank</div>
              <div style={{ flex: 1 }}>Scholar</div>
              <div style={{ width: 150, textAlign: 'right' }}>{metricLabels[metric]}</div>
            </div>
            {restUsers.map((user, index) => {
              const isMe = user._id === currentUser?._id
              return (
                <div key={user._id} className="leaderboard-row" style={{ 
                  display: 'flex', alignItems: 'center', padding: 'var(--s-4) var(--s-8)', 
                  borderBottom: index < restUsers.length - 1 ? '1px solid var(--border)' : 'none', 
                  transition: 'all 0.2s ease',
                  backgroundColor: isMe ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                  borderLeft: isMe ? '4px solid var(--accent)' : '4px solid transparent'
                }}>
                  <div style={{ 
                    width: 60, fontWeight: 800, fontSize: 18, color: isMe ? 'var(--accent)' : 'var(--text-muted)'
                  }}>
                    {index + 4}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', flex: 1 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 'var(--radius-md)', 
                      background: 'var(--bg-secondary)', color: 'var(--accent)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 700, overflow: 'hidden', border: '1px solid var(--border)'
                    }}>
                      {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={20} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                        <Link to={`/profile/${user._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{user.name}</Link>
                        {isMe && <span style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>YOU</span>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{user.college}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                      {user[metric]?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <style>{`
        .leaderboard-row:hover {
          background-color: var(--bg-secondary);
          transform: scale(1.005);
          z-index: 1;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .leaderboard-row {
          animation: slideUp 0.4s ease forwards;
        }
      `}</style>
    </div>
  )
}

function PodiumCard({ user, rank, metric, featured = false, isMe = false }) {
  const colors = {
    1: '#f59e0b', // Gold
    2: '#94a3b8', // Silver
    3: '#b45309'  // Bronze
  }

  const icons = {
    1: <Crown size={featured ? 32 : 24} fill="#f59e0b" />,
    2: <Medal size={24} fill="#94a3b8" />,
    3: <Medal size={24} fill="#b45309" />
  }

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', position: 'relative',
      padding: featured ? 'var(--s-10) var(--s-6)' : 'var(--s-6)',
      background: featured ? 'var(--bg-card)' : 'transparent',
      borderRadius: 'var(--radius-xl)',
      border: isMe ? '2px solid var(--accent)' : (featured ? '2px solid var(--warning)' : '1px solid transparent'),
      boxShadow: featured ? 'var(--shadow-p-xl)' : 'none',
      transform: featured ? 'scale(1.1)' : 'scale(1)',
      zIndex: featured ? 2 : 1,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ position: 'absolute', top: featured ? -25 : -15 }}>
        {icons[rank]}
      </div>
      
      <div style={{ 
        width: featured ? 100 : 70, height: featured ? 100 : 70, 
        borderRadius: '50%', padding: '4px',
        background: `linear-gradient(135deg, ${colors[rank]} 0%, #fff 100%)`,
        marginBottom: 'var(--s-4)', boxShadow: 'var(--shadow-p-md)',
        position: 'relative'
      }}>
        <div style={{ 
          width: '100%', height: '100%', borderRadius: '50%', 
          overflow: 'hidden', background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {user.avatar ? (
            <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <UserIcon size={featured ? 40 : 28} color="var(--text-muted)" />
          )}
        </div>
        <div style={{ 
          position: 'absolute', bottom: -5, right: -5,
          width: 30, height: 30, borderRadius: '50%',
          background: colors[rank], color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 14, border: '3px solid #fff'
        }}>
          {rank}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-1)' }}>
        <Link to={`/profile/${user._id}`} style={{ 
          fontWeight: 800, color: 'var(--text-primary)', 
          fontSize: featured ? 20 : 16 
        }}>
          {user.name}
        </Link>
        {isMe && <span style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '1px 5px', borderRadius: '8px', fontWeight: 800 }}>YOU</span>}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 'var(--s-3)' }}>
        {user.college}
      </p>

      <div style={{ 
        background: featured ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
        padding: '6px 16px', borderRadius: 'var(--radius-md)',
        color: featured ? '#fff' : 'var(--accent)',
        fontWeight: 800, fontSize: featured ? 20 : 16
      }}>
        {user[metric]?.toLocaleString()}
      </div>
    </div>
  )
}


