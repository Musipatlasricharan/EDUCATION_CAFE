import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useResource, useRateResource } from '../hooks/useResources'
import { Download, Share2, ArrowLeft, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import RatingStars from '../components/resources/RatingStars'
import CommentSection from '../components/resources/CommentSection'
import StudyTools from '../components/resources/StudyTools'
import ShareModal from '../components/ui/ShareModal'

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: resource, isLoading, isError, error } = useResource(id)
  const rateResource = useRateResource()
  const [shareOpen, setShareOpen] = useState(false)

  const handleDownload = async () => {
    try {
      const { data } = await api.get(`/resources/${id}/download`)
      window.open(data.fileUrl, '_blank')
    } catch (err) {
      toast.error('Failed to download file')
    }
  }

  const handleRate = async (value) => {
    rateResource.mutate({ id, data: { value, review: 'Rated from UI' } })
  }

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>

  if (isError || !resource) {
    const errMsg = error?.response?.data?.message || 'This resource could not be found or may have been removed.'
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 20, textAlign: 'center', padding: '40px 20px'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          backgroundColor: 'rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <AlertTriangle size={36} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Resource Not Found</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 }}>{errMsg}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    )
  }

  const isPDF = resource.fileUrl?.endsWith('.pdf') || resource.type === 'pdf'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ padding: '6px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 16, fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{resource.subject}</span>
              <span style={{ padding: '6px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 16, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{resource.type}</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>{resource.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 800, lineHeight: 1.6 }}>{resource.description}</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShareOpen(true)} className="btn-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={18} /> Share
            </button>
            <button onClick={handleDownload} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={18} /> Download
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {resource.uploadedBy?.avatar ? (
              <img src={resource.uploadedBy.avatar} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>
                {(resource.uploadedBy?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 600 }}>{resource.uploadedBy?.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Uploaded {formatDistanceToNow(new Date(resource.createdAt))} ago</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rate this resource</p>
              <RatingStars value={resource.avgRating} count={resource.ratingCount} interactive onRate={handleRate} />
            </div>
            <div style={{ height: 40, width: 1, backgroundColor: 'var(--border)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800 }}>{resource.downloads}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Downloads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{resource.fileName || resource.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {resource.fileSize > 0 ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : 'External resource'} · {resource.type?.toUpperCase()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {(resource.type === 'link' || resource.type === 'video') ? (
            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <Download size={18} /> Open Link
            </a>
          ) : (
            <button onClick={handleDownload} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={18} /> Download File
            </button>
          )}
        </div>
      </div>

      <StudyTools 
        quizzes={resource.quizzes} 
        flashcards={resource.flashcards} 
      />

      <CommentSection resourceId={id} />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={resource?.title || 'Study Resource'}
        url={window.location.href}
      />
    </div>
  )
}
