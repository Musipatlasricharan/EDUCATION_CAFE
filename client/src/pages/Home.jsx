import { useState, useEffect } from 'react'
import api from '../lib/axios'
import { useResources } from '../hooks/useResources'
import ResourceCard from '../components/resources/ResourceCard'
import { Link, ExternalLink, Download, FileText, Globe, TrendingUp } from 'lucide-react'
import SubscriptionCard from '../components/ui/SubscriptionCard'
import LearningPulse from '../components/ai/LearningPulse'
import { CheckCircle, Clock, Code as CodeIcon, ChevronRight } from 'lucide-react'

export default function Home() {
  const [filters, setFilters] = useState({ page: 1, limit: 12, sort: 'popular', type: '' })
  const { data, isLoading, error } = useResources(filters)
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/resources/recommendations');
        setRecommendations(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchRecs();
  }, []);

  return (
    <div style={{ paddingBottom: 'var(--s-12)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--s-10)' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--s-2)', letterSpacing: '-0.5px' }}>Discover Resources</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>Access high-quality study materials shared by our community.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
          <select 
            className="input-field" 
            style={{ width: 180, borderRadius: 'var(--radius-md)', fontWeight: 600, backgroundColor: 'var(--bg-card)' }}
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
          >
            <option value="popular">🔥 Popular</option>
            <option value="rated">⭐ Highest Rated</option>
            <option value="newest">🕒 Newest</option>
          </select>
        </div>
      </div>

      {/* AI Learning Pulse */}
      <LearningPulse />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: 'var(--s-10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--s-4)' }}>
            <TrendingUp size={20} className="text-primary" />
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Recommended for You</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {recommendations.map(res => <ResourceCard key={res._id} resource={res} />)}
          </div>
          <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', marginTop: 'var(--s-10)' }} />
        </div>
      )}

      {/* Categories */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--s-3)', 
        overflowX: 'auto', 
        paddingBottom: 'var(--s-6)', 
        marginBottom: 'var(--s-8)', 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {[
          { id: '', label: 'All Resources' },
          { id: 'video', label: 'Videos' },
          { id: 'link', label: 'Useful Links' },
          { id: 'pdf', label: 'PDFs' },
          { id: 'slides', label: 'Slides' },
          { id: 'notes', label: 'Notes' },
          { id: 'other', label: 'Other' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilters(prev => ({ ...prev, type: cat.id, page: 1 }))}
            style={{
              padding: 'var(--s-3) var(--s-6)',
              borderRadius: '100px',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: filters.type === cat.id ? 'var(--accent)' : 'var(--border)',
              backgroundColor: filters.type === cat.id ? 'var(--accent)' : 'transparent',
              color: filters.type === cat.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: filters.type === cat.id ? 'var(--shadow-p-md)' : 'none'
            }}
            onMouseEnter={e => {
              if (filters.type !== cat.id) {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--text-muted)';
              }
            }}
            onMouseLeave={e => {
              if (filters.type !== cat.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--danger)' }}>
          <p>Failed to load resources. Please try again later.</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card" style={{ height: 180, backgroundColor: 'var(--bg-card)', animation: 'pulse 1.5s infinite', borderRadius: 20 }}></div>
          ))}
          <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
        </div>
      )}

      {/* Data Rendering */}
      {!isLoading && !error && (
        <>
          {data?.data.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>No resources found</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>
                Try changing your filters or be the first to share a resource in this category!
              </p>
            </div>
          ) : (
            <>
              {/* TABLE VIEW FOR LINKS ONLY */}
              {(filters.type === 'link') ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20, border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '20px 24px', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Resource Link</th>
                        <th style={{ padding: '20px 24px', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Uploader</th>
                        <th style={{ padding: '20px 24px', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Stats</th>
                        <th style={{ padding: '20px 24px', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.8 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.data.map((resource, idx) => (
                        <tr key={resource._id} style={{ borderBottom: idx !== data.data.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <div style={{ padding: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 12 }}>
                                <Globe size={20} />
                              </div>
                              <div>
                                <a href={`/resources/${resource._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, textDecoration: 'none', display: 'block', marginBottom: 2 }}>{resource.title}</a>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{resource.subject}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                                {(resource.uploadedBy?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{resource.uploadedBy?.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
                                ★ {resource.avgRating?.toFixed(1) || '0.0'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                                <ExternalLink size={14} /> {resource.downloads || 0}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                            <a 
                              href={`/resources/${resource._id}`}
                              className="btn-primary" 
                              style={{ padding: '8px 20px', fontSize: 13, borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              Open Link <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* GRID VIEW FOR EVERYTHING ELSE */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                  {data?.data.map(resource => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48 }}>
          <button 
            className="btn-primary" 
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: 14 }}
            disabled={filters.page === 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            ← Previous
          </button>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 14, backgroundColor: 'var(--bg-secondary)', padding: '0 20px', borderRadius: 14 }}>
            Page {filters.page} of {data.pagination.pages}
          </div>
          <button 
            className="btn-primary" 
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: 14 }}
            disabled={filters.page === data.pagination.pages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next →
          </button>
        </div>
      )}
      {/* Subscription Section */}
      <SubscriptionCard />
    </div>
  )
}
