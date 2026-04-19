import { useState, useEffect, useRef } from 'react'
import { X, Copy, Check, MessageCircle, Mail, Twitter, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

const ShareOption = ({ icon, label, color, bgColor, onClick }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '16px 12px',
        borderRadius: 16,
        border: 'none',
        cursor: 'pointer',
        background: hovered ? bgColor : 'var(--bg-secondary)',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
        minWidth: 80,
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? color : 'var(--bg-card)',
        color: hovered ? '#fff' : color,
        transition: 'all 0.2s',
        fontSize: 22,
        boxShadow: hovered ? `0 8px 20px ${color}44` : '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  )
}

export default function ShareModal({ isOpen, onClose, title, url }) {
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareOptions = [
    {
      label: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      color: '#25D366',
      bgColor: 'rgba(37,211,102,0.12)',
      onClick: () => window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank'),
    },
    {
      label: 'Gmail',
      icon: <Mail size={24} />,
      color: '#EA4335',
      bgColor: 'rgba(234,67,53,0.12)',
      onClick: () => window.open(`mailto:?subject=${encodedTitle}&body=Check%20out%20this%20resource%3A%20${encodedUrl}`, '_blank'),
    },
    {
      label: 'Twitter / X',
      icon: <Twitter size={24} />,
      color: '#1DA1F2',
      bgColor: 'rgba(29,161,242,0.12)',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank'),
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin size={24} />,
      color: '#0A66C2',
      bgColor: 'rgba(10,102,194,0.12)',
      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank'),
    },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(32px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '32px 32px 28px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Share Resource</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

        {/* Share Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {shareOptions.map(opt => (
            <ShareOption key={opt.label} {...opt} />
          ))}
        </div>

        {/* Copy Link */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '10px 12px 10px 16px',
        }}>
          <span style={{
            flex: 1, fontSize: 13, color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {url}
          </span>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: copied ? 'var(--success)' : 'var(--accent)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
