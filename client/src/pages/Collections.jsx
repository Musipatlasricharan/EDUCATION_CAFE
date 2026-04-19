import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/axios'
import {
  FolderHeart, BookmarkX, Download, Star, FileText,
  Image as ImageIcon, Video, Link as LinkIcon, CheckCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const iconMap = {
  pdf: <FileText color="#ef4444" size={20} />,
  notes: <FileText color="#3b82f6" size={20} />,
  slides: <ImageIcon color="#f59e0b" size={20} />,
  video: <Video color="#8b5cf6" size={20} />,
  link: <LinkIcon color="#10b981" size={20} />,
  other: <FileText color="#6b7280" size={20} />,
}

export default function Collections() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const { data } = await api.get('/users/bookmarks')
      return data.data
    },
    enabled: !!user,
  })

  const removeBookmark = useMutation({
    mutationFn: async (resourceId) => {
      await api.post(`/resources/${resourceId}/bookmark`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      toast.success('Removed from saved resources')
    },
    onError: () => toast.error('Failed to remove')
  })

  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Saved Resources</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {bookmarks.length} resource{bookmarks.length !== 1 ? 's' : ''} saved · synced to your account
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 100,
          background: 'rgba(59,130,246,0.1)',
          color: 'var(--accent)', fontSize: 13, fontWeight: 600
        }}>
          <FolderHeart size={15} />
          Cloud Synced ✓
        </div>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <div className="card" style={{ padding: '64px 40px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FolderHeart size={38} color="var(--accent)" style={{ opacity: 0.7 }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No saved resources yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 24px' }}>
            Click the <strong>bookmark icon</strong> on any resource card to save it here. Saves are synced to your account across all devices.
          </p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Browse Resources
          </Link>
        </div>
      )}

      {/* Saved Resources Grid */}
      {bookmarks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {bookmarks.map(resource => (
            <div key={resource._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
              {/* Remove button */}
              <button
                onClick={() => removeBookmark.mutate(resource._id)}
                title="Remove from saved"
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: 4, borderRadius: 6,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <BookmarkX size={18} />
              </button>

              {/* Top section: icon + title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingRight: 28 }}>
                <div style={{
                  padding: 10, backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 10, flexShrink: 0
                }}>
                  {iconMap[resource.type] || iconMap.other}
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                    {resource.subject}
                  </span>
                  <Link to={`/resources/${resource._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                      marginTop: 4, lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {resource.title}
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Uploader */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  backgroundColor: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0
                }}>
                  {(resource.uploadedBy?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {resource.uploadedBy?.name}
                </span>
                {resource.isVerified && <CheckCircle size={13} color="var(--success)" />}
              </div>

              {/* Stats + date + View button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>
                    <Star size={13} fill="#f59e0b" /> {resource.avgRating?.toFixed(1) || '0.0'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 12 }}>
                    <Download size={13} /> {resource.downloads || 0}
                  </div>
                </div>
                <Link
                  to={`/resources/${resource._id}`}
                  className="btn-primary"
                  style={{ padding: '6px 16px', fontSize: 12, borderRadius: 8, textDecoration: 'none' }}
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      {bookmarks.length > 0 && (
        <div style={{
          padding: '14px 20px', borderRadius: 12,
          background: 'rgba(59,130,246,0.07)',
          border: '1px solid rgba(59,130,246,0.18)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <CheckCircle size={16} color="var(--accent)" />
          <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
            Your saved resources are synced to your account and will be here whenever you log back in.
          </p>
        </div>
      )}
    </div>
  )
}
