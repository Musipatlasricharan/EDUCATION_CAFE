import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { Bell, CheckCircle, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Notifications() {
  const queryClient = useQueryClient()
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data.data
    }
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => await api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    }
  })

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={24} color="var(--accent)" /> Notifications
        </h1>
        {notifications?.some(n => !n.isRead) && (
          <button onClick={() => markAllAsRead.mutate()} className="btn-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14 }}>
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications?.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: 16 }}>You're all caught up!</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications?.map((notif, i) => (
            <div key={notif._id} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: notif.isRead ? 400 : 500, color: 'var(--text-primary)', marginBottom: 4 }}>{notif.message}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDistanceToNow(new Date(notif.createdAt))} ago</p>
              </div>
              {!notif.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)' }}></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
