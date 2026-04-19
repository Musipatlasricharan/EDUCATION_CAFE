import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useMyGroups } from '../hooks/useGroups'
import api from '../lib/axios'
import { Send, Users, MessageSquare, Info, Star, Hash, AtSign, Search, Image, Paperclip, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Chat() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, connected } = useSocket()
  const { data: myGroups } = useMyGroups()
  
  const [activeType, setActiveType] = useState('group') // 'group' or 'direct'
  const [activeSelection, setActiveSelection] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch recent chats
  useEffect(() => {
    api.get('/chat/private/recent').then(res => setRecentChats(res.data.data))
  }, [routeId])

  // Determine type and id from route
  useEffect(() => {
    if (routeId) {
      // Logic to distinguish group ID from user ID
      // For now, let's assume routeId starting with 'g' is group, else user
      // Or we can check if it exists in myGroups
      const isGroup = myGroups?.some(g => g._id === routeId)
      const groupFound = myGroups?.find(g => g._id === routeId)
      
      if (groupFound) {
        setActiveType('group')
        setActiveSelection(groupFound)
      } else if (routeId) {
        setActiveType('direct')
        // Try to find if user is already in recentChats
        const existingUser = recentChats.find(u => u._id === routeId)
        if (existingUser) {
           setActiveSelection(existingUser)
        } else {
           // Fetch if not found locally
           api.get(`/users/${routeId}`)
             .then(res => setActiveSelection(res.data.data))
             .catch(() => setActiveSelection({ name: 'Unknown User', _id: routeId }))
        }
      } else {
        setActiveSelection(null)
      }
    }
  }, [routeId, myGroups, recentChats])

  // Fetch data
  useEffect(() => {
    if (!routeId || !activeType) return
    setLoading(true)
    const endpoint = activeType === 'group' ? `/chat/${routeId}` : `/chat/private/${routeId}`
    api.get(endpoint)
      .then(res => {
        setMessages(res.data.data)
        setLoading(false)
      })
      .catch(err => {
        toast.error('Failed to load messages')
        setLoading(false)
      })
  }, [routeId, activeType])

  // Socket listeners
  useEffect(() => {
    if (!socket || !connected) return

    if (activeType === 'group' && routeId) {
       socket.emit('join_group', routeId)
    }

    const handleNewMessage = (msg) => {
      const msgId = msg.group?._id || msg.group || null
      if (activeType === 'group' && msgId?.toString() === routeId) {
        setMessages(prev => {
           // Prevent duplicates
           if (prev.find(m => m._id === msg._id)) return prev
           return [...prev, { ...msg, group: msgId }]
        })
      }
    }

    const handleNewPrivateMessage = (msg) => {
      const senderId = msg.sender?._id || msg.sender
      const recipientId = msg.recipient?._id || msg.recipient
      
      const otherId = senderId.toString() === user._id.toString() ? recipientId.toString() : senderId.toString()
      
      if (activeType === 'direct' && otherId === routeId) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
      
      // Also update recent chats if it's a new contact
      if (otherId !== routeId) {
         api.get('/chat/private/recent').then(res => setRecentChats(res.data.data))
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('new_private_message', handleNewPrivateMessage)
    socket.on('online_users', (users) => setOnlineUsers(users))

    return () => {
      if (activeType === 'group' && routeId) {
        socket.emit('leave_group', routeId)
      }
      socket.off('new_message', handleNewMessage)
      socket.off('new_private_message', handleNewPrivateMessage)
    }
  }, [socket, connected, routeId, activeType, user._id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSelectedFile({
        url: res.data.data,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      })
      toast.success('File uploaded and ready to send')
    } catch (err) {
      toast.error('Failed to upload file')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return
    if (!socket) return

    const payload = {
      content: newMessage || `Sent a ${selectedFile?.type || 'file'}`,
      messageType: selectedFile?.type || 'text',
      fileUrl: selectedFile?.url || null
    }

    if (activeType === 'group') {
      socket.emit('send_message', {
        groupId: routeId,
        ...payload
      })
    } else {
      socket.emit('send_private_message', {
        recipientId: routeId,
        ...payload
      })
    }
    setNewMessage('')
    setSelectedFile(null)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)',  borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', background: 'var(--bg-card)' }} className="card">
      {/* Search & Sidebar */}
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input-field" 
              placeholder="Search chats..." 
              value={globalSearchQuery}
              onChange={e => setGlobalSearchQuery(e.target.value)}
              style={{ paddingLeft: 40, borderRadius: 12, height: 44, backgroundColor: 'var(--bg-secondary)', border: 'none' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '0 12px 12px' }}>Groups</p>
            {myGroups?.filter(g => !globalSearchQuery || g.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).map(g => (
              <div 
                key={g._id} 
                onClick={() => navigate(`/chat/${g._id}`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  backgroundColor: routeId === g._id ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'all 0.2s'
                }}
                className="hover-bg"
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  {g.avatar ? <img src={g.avatar} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} /> : g.name.charAt(0)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.members.length} members</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '0 12px 12px' }}>Direct Messages</p>
            {recentChats.filter(u => !globalSearchQuery || (u.name && u.name.toLowerCase().includes(globalSearchQuery.toLowerCase()))).map(u => (
              <div 
                key={u._id} 
                onClick={() => navigate(`/chat/${u._id}`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, cursor: 'pointer',
                  backgroundColor: routeId === u._id ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'all 0.2s'
                }}
                className="hover-bg"
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} /> : u.name?.charAt(0)}
                  </div>
                  {onlineUsers.includes(u._id) && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid var(--bg-card)' }}></div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{onlineUsers.includes(u._id) ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
            {recentChats.length === 0 && (
               <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 12px' }}>No recent chats. Start one from group members!</p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', inset: 0, opacity: 0.1, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        {!routeId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>💬</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Select a conversation</h3>
            <p>Choose a group or friend to start chatting</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {activeSelection?.avatar ? <img src={activeSelection.avatar} style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} /> : (activeSelection?.name || '?').charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>{activeSelection?.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: onlineUsers.includes(routeId) || activeType === 'group' ? 'var(--success)' : 'var(--text-muted)' }}></div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{activeType === 'group' ? 'Group Chat' : 'Direct Message'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {isSearching && (
                  <input
                    autoFocus
                    placeholder="Search in chat..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: 13, width: 200 }}
                  />
                )}
                <button className="icon-btn" title="Search messages" onClick={() => { setIsSearching(!isSearching); setSearchQuery(''); }}><Search size={20} /></button>
                <button className="icon-btn" title="Information" onClick={() => {
                  if (activeType === 'group') navigate(`/groups/${routeId}`)
                  else toast.success('Viewing User Information') // Simulated
                }}><Info size={20} /></button>
                
                <div style={{ position: 'relative' }}>
                  <button className="icon-btn" title="More options" onClick={() => setShowDropdown(!showDropdown)}>
                    <MoreVertical size={20} />
                  </button>
                  {showDropdown && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, zIndex: 10, width: 200, boxShadow: 'var(--shadow-lg)' }}>
                      {activeType === 'group' ? (
                        <button onClick={() => navigate(`/groups/${routeId}`)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} className="hover-bg"><Info size={16}/> Group Details</button>
                      ) : (
                        <button onClick={() => { toast.success('Viewing Profile'); setShowDropdown(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} className="hover-bg"><Info size={16}/> View Profile</button>
                      )}
                      <button onClick={() => { toast.success('Notifications muted'); setShowDropdown(false) }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} className="hover-bg">Mute Notifications</button>
                      <button onClick={() => { toast.error('User reported'); setShowDropdown(false) }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} className="hover-bg">Report User</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>
              ) : (
                messages.filter(msg => !searchQuery || (msg.content && msg.content.toLowerCase().includes(searchQuery.toLowerCase()))).map((msg, i) => {
                  const isMe = msg.sender._id === user._id
                  const isDiscussion = msg.messageType === 'discussion_launch'
                  
                  if (isDiscussion) {
                    return (
                      <div key={msg._id} style={{ alignSelf: 'center', maxWidth: '80%', width: '100%', margin: '12px 0' }}>
                        <div style={{ 
                          padding: '20px 24px', 
                          backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                          border: '1px solid var(--accent)', 
                          borderRadius: 20,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16
                        }}>
                          <div style={{ width: 48, height: 48, backgroundColor: 'var(--accent)', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MessageSquare size={24} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>NEW DISCUSSION STARTED</p>
                            <p style={{ fontSize: 15, fontWeight: 700 }}>{msg.sender.name} {msg.content}</p>
                            <button 
                              onClick={() => navigate(`/groups/${msg.group}?tab=discussions`)}
                              style={{ marginTop: 12, padding: '8px 16px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              View & Participate
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={msg._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', gap: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, marginTop: 4 }}>
                        {msg.sender?.avatar ? <img src={msg.sender.avatar} style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} /> : (msg.sender?.name || 'U').charAt(0)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <div className={isMe ? "" : "glass"} style={{ 
                          padding: msg.messageType === 'image' ? '4px' : '14px 20px', 
                          background: isMe ? 'var(--accent-gradient)' : 'var(--bg-secondary)', 
                          color: isMe ? '#fff' : 'var(--text-primary)',
                          borderRadius: 22,
                          borderTopRightRadius: isMe ? 4 : 22,
                          borderTopLeftRadius: !isMe ? 4 : 22,
                          boxShadow: isMe ? 'var(--shadow-p-md)' : 'var(--shadow-xs)',
                          position: 'relative',
                          overflow: 'hidden',
                          border: isMe ? 'none' : '1px solid var(--border)'
                        }}>
                          {msg.messageType === 'image' && msg.fileUrl && (
                            <div style={{ marginBottom: 8 }}>
                              <img src={msg.fileUrl} style={{ maxWidth: '100%', borderRadius: 18, display: 'block', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => window.open(msg.fileUrl)} />
                            </div>
                          )}
                          {msg.messageType === 'file' && msg.fileUrl && (
                            <div 
                              onClick={() => window.open(msg.fileUrl)}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 16, cursor: 'pointer',
                                backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'var(--bg-card)',
                                marginBottom: 10,
                                border: isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)'
                              }}
                            >
                              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Paperclip size={22} />
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.fileUrl.split('-').pop()}</p>
                                <p style={{ fontSize: 11, opacity: 0.7 }}>Click to view file</p>
                              </div>
                            </div>
                          )}
                          <p style={{ fontSize: 14.5, lineHeight: 1.6, padding: msg.messageType === 'image' || msg.messageType === 'file' ? '8px 14px' : 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '0 8px' }}>
                           {!isMe && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{msg.sender?.name}</span>}
                           <span style={{ fontSize: 10, opacity: 0.6, color: 'var(--text-muted)' }}>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)' }}>
              {selectedFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
                  {selectedFile.type === 'image' ? (
                     <img src={selectedFile.url} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                     <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Paperclip size={20} /></div>
                  )}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFile.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Ready to send</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
              />
              
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, width: 44, height: 44 }} disabled={uploading}>
                    {uploading ? <div className="spinner-sm"></div> : <Paperclip size={20} />}
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, width: 44, height: 44 }} disabled={uploading}>
                    <Image size={20} />
                  </button>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    className="input-field" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={uploading ? "Uploading file..." : "Type a message..."} 
                    style={{ borderRadius: 14, height: 48, paddingLeft: 20, border: '2px solid transparent', backgroundColor: 'var(--bg-secondary)' }}
                    disabled={uploading}
                  />
                  <button 
                    type="submit" 
                    disabled={(!newMessage.trim() && !selectedFile) || uploading}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
      
      <style>{`
        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .hover-bg:hover {
           background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  )
}
