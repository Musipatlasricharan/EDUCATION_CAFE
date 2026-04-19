import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useSocket } from '../../contexts/SocketContext'
import api from '../../lib/axios'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const { socket } = useSocket()

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count')
        setUnreadCount(data.count)
      } catch (err) {
        console.log('No unread count session')
      }
    }
    fetchUnread()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.emit('join_user_room')
    
    socket.on('new_notification', ({ count }) => {
      setUnreadCount(count)
    })
    
    return () => {
      socket.off('new_notification')
    }
  }, [socket])

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Bell size={20} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          backgroundColor: 'var(--danger)', color: '#fff',
          fontSize: 10, fontWeight: 'bold', width: 16, height: 16,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  )
}
