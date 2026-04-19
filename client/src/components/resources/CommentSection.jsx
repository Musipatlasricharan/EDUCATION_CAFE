import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { useAuth } from '../../contexts/AuthContext'
import { Heart, Trash2, MessageCircle, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function CommentSection({ resourceId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', resourceId],
    queryFn: async () => {
      const { data } = await api.get(`/resources/${resourceId}/comments`)
      return data.data
    }
  })

  const addComment = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/resources/${resourceId}/comments`, { content })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', resourceId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      setContent('')
      toast.success('Comment posted!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post comment')
  })

  const likeComment = useMutation({
    mutationFn: async (commentId) => {
      const { data } = await api.post(`/comments/${commentId}/like`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', resourceId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    }
  })

  const deleteComment = useMutation({
    mutationFn: async (commentId) => {
      await api.delete(`/comments/${commentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', resourceId] })
      toast.success('Comment deleted')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    addComment.mutate()
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <MessageCircle size={20} color="var(--accent)" />
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>
          Discussion <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 15 }}>({comments.length})</span>
        </h3>
      </div>

      {/* Post Comment Box */}
      {user && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 12 }}>
            <textarea
              className="input-field"
              placeholder="Share your thoughts about this resource..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              style={{ padding: '12px 16px', flex: 1, resize: 'vertical' }}
            />
            <button
              type="submit"
              disabled={!content.trim() || addComment.isPending}
              className="btn-primary"
              style={{ padding: '12px 16px', alignSelf: 'flex-end', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}
            >
              <Send size={16} /> Post
            </button>
          </div>
        </form>
      )}

      {!user && (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0', fontSize: 15 }}>
          Please <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>log in</a> to join the discussion.
        </p>
      )}

      {/* Comments List */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>Loading comments...</div>
      )}

      {!isLoading && comments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
          <MessageCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: 15 }}>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {comments.map((comment, idx) => (
          <div key={comment._id} style={{
            display: 'flex', gap: 16, padding: '20px 0',
            borderTop: idx > 0 ? '1px solid var(--border)' : 'none'
          }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {comment.author?.avatar ? (
                <img src={comment.author.avatar} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {(comment.author?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{comment.author?.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', fontWeight: 500 }}>
                    {comment.author?.reputation || 0} rep
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    onClick={() => likeComment.mutate(comment._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: comment.likes?.includes(user?._id) ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                  >
                    <Heart size={14} fill={comment.likes?.includes(user?._id) ? 'var(--danger)' : 'none'} />
                    {comment.likeCount}
                  </button>
                  {user && user._id === comment.author?._id && (
                    <button
                      onClick={() => deleteComment.mutate(comment._id)}
                      style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: 15 }}>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
