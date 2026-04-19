import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Image as ImageIcon, Video, Link as LinkIcon, Download, Bookmark, CheckCircle, Star, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { useAuth } from '../../contexts/AuthContext'
import ShareModal from '../ui/ShareModal'
import toast from 'react-hot-toast'


const iconMap = {
  pdf: <FileText color="#ef4444" size={28} />,
  notes: <FileText color="#3b82f6" size={28} />,
  slides: <ImageIcon color="#f59e0b" size={28} />,
  video: <Video color="#8b5cf6" size={28} />,
  link: <LinkIcon color="#10b981" size={28} />,
  other: <FileText color="#6b7280" size={28} />
}

export default function ResourceCard({ resource }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [shareOpen, setShareOpen] = useState(false)
  const resourceUrl = `${window.location.origin}/resources/${resource._id}`

  // Fetch saved bookmarks to know current saved state
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => { const { data } = await api.get('/users/bookmarks'); return data.data },
    enabled: !!user,
    staleTime: 30000,
  })
  const isSaved = bookmarks.some(b => b._id === resource._id)

  const toggleBookmark = useMutation({
    mutationFn: () => api.post(`/users/bookmarks/${resource._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      toast.success(isSaved ? 'Removed from saved resources' : '✓ Saved to your collections!')
    },
    onError: () => toast.error('Failed to update saved resources')
  })

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)', height: '100%', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s-4)' }}>
          <div style={{ 
            padding: 'var(--s-3)', backgroundColor: 'var(--bg-secondary)', 
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {iconMap[resource.type || 'other']}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.2 }}>{resource.subject}</span>
            <Link to={`/resources/${resource._id}`}>
              <h3 style={{ 
                fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', 
                marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4,
                letterSpacing: '-0.2px'
              }}>
                {resource.title}
              </h3>
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-1)' }}>
          <button
            onClick={() => setShareOpen(true)}
            title="Share"
            style={{ 
              color: 'var(--text-muted)', width: 32, height: 32, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', transition: 'all 0.2s ease' 
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => user && toggleBookmark.mutate()}
            title={user ? (isSaved ? 'Remove from saved' : 'Save to collections') : 'Login to save'}
            style={{
              color: isSaved ? 'var(--accent)' : 'var(--text-muted)',
              width: 32, height: 32, borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: toggleBookmark.isPending ? 'scale(0.85)' : 'scale(1)',
              cursor: user ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (user) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Bookmark size={18} fill={isSaved ? 'var(--accent)' : 'none'} />
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <div style={{ position: 'relative' }}>
          {resource.uploadedBy?.avatar ? (
            <img src={resource.uploadedBy.avatar} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
          ) : (
            <div style={{ 
              width: 26, height: 26, borderRadius: '50%', 
              background: 'var(--accent-gradient)', color: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 11, fontWeight: 700 
            }}>
              {(resource.uploadedBy?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{resource.uploadedBy?.name}</span>
        {resource.isVerified && <CheckCircle size={14} color="var(--success)" />}
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        borderTop: '1px solid var(--border)', paddingTop: 'var(--s-4)', marginTop: 'auto' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
            <Star size={14} fill="#f59e0b" /> {resource.avgRating?.toFixed(1) || '0.0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
            <Download size={14} /> {resource.downloads || 0}
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
        </span>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={resource.title}
        url={resourceUrl}
      />
    </div>
  )
}
