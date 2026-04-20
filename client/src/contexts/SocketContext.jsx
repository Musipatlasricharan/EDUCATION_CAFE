import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('token')
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
    const newSocket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    })
    socketRef.current = newSocket
    
    newSocket.on('connect', () => setConnected(true))
    newSocket.on('disconnect', () => setConnected(false))

    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [user?._id])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
