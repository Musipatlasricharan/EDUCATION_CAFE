import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BadgeNotification from '../ui/BadgeNotification'
import { useSocket } from '../../contexts/SocketContext'

export default function Layout() {
  const { socket } = useSocket()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BadgeNotification socket={socket} />
      <Navbar />
      <div style={{ display: 'flex', flex: 1, paddingTop: 72 }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 260, padding: 32, backgroundColor: 'var(--bg-secondary)', minHeight: 'calc(100vh - 72px)' }}>
          <div style={{ maxWidth: 'var(--layout-max)', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
