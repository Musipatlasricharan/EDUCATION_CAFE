import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useGroup, useLeaveGroup } from '../hooks/useGroups'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../lib/axios'
import { Send, Users, LogOut, FileText, Copy, MessageSquare, Video, Settings, Info, Calendar, Lock, Globe, ArrowRight, Paperclip, Image } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import ResourceCard from '../components/resources/ResourceCard'
import StudyRoom from '../components/groups/StudyRoom'
import Modal from '../components/ui/Modal'

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const { data: group, isLoading, refetch } = useGroup(id)
  const leaveGroup = useLeaveGroup()
  const [activeTab, setActiveTab] = useState('chat')
  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [discussions, setDiscussions] = useState([])
  const [activeDiscussion, setActiveDiscussion] = useState(null)
  const [newResponse, setNewResponse] = useState('')
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [discussionTopic, setDiscussionTopic] = useState('')
  const [discussionContent, setDiscussionContent] = useState('')
  
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [meetingPlatform, setMeetingPlatform] = useState('Zoom')
  
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'chat') {
      api.get(`/chat/${id}`).then(res => setMessages(res.data.data))
    } else if (activeTab === 'discussions') {
      api.get(`/discussions/group/${id}`).then(res => setDiscussions(res.data.data))
    }
  }, [id, activeTab])

  useEffect(() => {
    if (!socket || !group) return
    socket.emit('join_group', id)

    const handleNewMessage = (msg) => {
      const msgGroupId = msg.group?._id || msg.group || null
      if (msgGroupId?.toString() === id.toString()) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, { ...msg, group: msgGroupId }];
        });
      }
    }

    const handlePresence = (users) => {
      setOnlineUsers(users)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('online_users', handlePresence)
    
    socket.on('new_discussion', (discussion) => {
      setDiscussions(prev => [discussion, ...prev])
      toast.success('New discussion started!')
    })

    const handleDiscussionUpdate = (updated) => {
      setDiscussions(prev => prev.map(d => d._id === updated._id ? updated : d));
      // Use setMessages style functional update if needed, but here we just update activeDiscussion if it matches
      setActiveDiscussion(current => (current?._id === updated._id ? updated : current));
    };

    socket.on('discussion_updated', handleDiscussionUpdate)

    socket.on('group_updated', () => {
      refetch()
    })

    // Request initial online users
    socket.emit('get_online_users')

    return () => {
      socket.emit('leave_group', id)
      socket.off('new_message', handleNewMessage)
      socket.off('online_users', handlePresence)
      socket.off('new_discussion')
      socket.off('discussion_updated', handleDiscussionUpdate)
      socket.off('group_updated')
    }
  }, [socket, id, group])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeTab])

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
    
    socket.emit('send_message', {
      groupId: id,
      content: newMessage || `Sent a ${selectedFile?.type || 'file'}`,
      messageType: selectedFile?.type || 'text',
      fileUrl: selectedFile?.url || null
    })
    setNewMessage('')
    setSelectedFile(null)
  }

  const startDiscussionTopic = (e) => {
    e.preventDefault()
    if (!discussionTopic.trim() || !socket) return
    socket.emit('start_discussion', {
      groupId: id,
      topic: discussionTopic,
      content: discussionContent
    })
    setDiscussionTopic('')
    setDiscussionContent('')
    setShowTopicForm(false)
  }

  const submitResponse = (e) => {
    e.preventDefault()
    if (!newResponse.trim() || !activeDiscussion || !socket) return
    socket.emit('post_discussion_response', {
      discussionId: activeDiscussion._id,
      content: newResponse
    })
    setNewResponse('')
  }

  const handleUpdateTopic = async () => {
    try {
      await api.put(`/groups/${id}/topic`, { topic: topicInput })
      toast.success('Daily topic updated')
      refetch()
      setIsAdminModalOpen(false)
    } catch (err) {
      toast.error('Failed to update topic')
    }
  }

  const handleUpdateMeeting = async () => {
    try {
      await api.put(`/groups/${id}/meeting`, { link: meetingUrl, platform: meetingPlatform })
      toast.success('Meeting link updated')
      refetch()
      setIsAdminModalOpen(false)
    } catch (err) {
      toast.error('Failed to update meeting link')
    }
  }

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>
  if (!group) return <div>Group not found</div>

  const isAdmin = group.members.find(m => m.user._id === user._id && m.role === 'admin')

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      {/* Group Header */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>
            {group.avatar ? <img src={group.avatar} style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} /> : group.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800 }}>{group.name}</h1>
              {group.isPrivate ? <Lock size={16} color="var(--text-secondary)" /> : <Globe size={16} color="var(--text-secondary)" />}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              Invite Code: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }} onClick={() => { navigator.clipboard.writeText(group.inviteCode); toast.success('Invite code copied') }}>{group.inviteCode} <Copy size={10}/></span>
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: 14, padding: 4 }}>
            <button onClick={() => setActiveTab('chat')} style={{ border: 'none', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, backgroundColor: activeTab === 'chat' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, transition: 'all 0.2s', boxShadow: activeTab === 'chat' ? 'var(--shadow-sm)' : 'none' }}>Chat</button>
            <button onClick={() => { setActiveTab('discussions'); setActiveDiscussion(null); }} style={{ border: 'none', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, backgroundColor: activeTab === 'discussions' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'discussions' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, transition: 'all 0.2s', boxShadow: activeTab === 'discussions' ? 'var(--shadow-sm)' : 'none' }}>Discussions</button>
            <button onClick={() => setActiveTab('resources')} style={{ border: 'none', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, backgroundColor: activeTab === 'resources' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'resources' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, transition: 'all 0.2s', boxShadow: activeTab === 'resources' ? 'var(--shadow-sm)' : 'none' }}>Resources</button>
            <button onClick={() => setActiveTab('study-room')} style={{ border: 'none', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, backgroundColor: activeTab === 'study-room' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'study-room' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, transition: 'all 0.2s', boxShadow: activeTab === 'study-room' ? 'var(--shadow-sm)' : 'none' }}>Study Room ⚡</button>
            <button onClick={() => setActiveTab('members')} style={{ border: 'none', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, backgroundColor: activeTab === 'members' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'members' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, transition: 'all 0.2s', boxShadow: activeTab === 'members' ? 'var(--shadow-sm)' : 'none' }}>Members</button>
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setTopicInput(group.dailyTopic?.content || '')
                setMeetingUrl(group.activeMeeting?.link || '')
                setMeetingPlatform(group.activeMeeting?.platform || 'Zoom')
                setIsAdminModalOpen(true)
              }} 
              className="btn-primary" 
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Settings size={18} /> Admin Panel
            </button>
          )}
          {group.creator === user._id && (
            <button 
              onClick={async () => {
                if(window.confirm('Are you sure you want to delete this group? This cannot be undone.')) {
                  try {
                    await api.delete(`/groups/${id}`)
                    toast.success('Group deleted')
                    window.location.href = '/groups'
                  } catch (err) {
                    toast.error('Failed to delete group')
                  }
                }
              }} 
              className="btn-primary" 
              style={{ backgroundColor: 'var(--danger)', color: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <LogOut size={18} /> Delete Group
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 24, overflow: 'hidden' }}>
        {/* Main Content Area */}
        <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 24 }}>
          {activeTab === 'chat' && (
            <>
              {/* Redesigned Banners Container */}
              {(group.dailyTopic?.content || group.activeMeeting?.link) && (
                <div style={{ padding: '24px 32px 12px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Daily Topic Banner */}
                  {group.dailyTopic?.content && (
                    <div className="glass" style={{ 
                      padding: '16px 24px', 
                      borderRadius: 20, 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        backgroundColor: 'var(--accent)', 
                        color: '#fff', 
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Calendar size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Daily Discussion</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{group.dailyTopic.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Active Meeting Banner */}
                  {group.activeMeeting?.link && (
                    <div className="glass" style={{ 
                      padding: '18px 24px', 
                      borderRadius: 20, 
                      backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 20,
                      boxShadow: '0 8px 30px rgba(16, 185, 129, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ 
                            width: 48, 
                            height: 48, 
                            backgroundColor: '#10b981', 
                            color: '#fff', 
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Video size={22} />
                          </div>
                          <div className="pulse-indicator" style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12,
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            border: '2px solid #fff'
                          }} title="Live Now" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>Live Class Session</p>
                            <span style={{ fontSize: 10, padding: '2px 8px', backgroundColor: '#10b981', color: '#fff', borderRadius: 10, fontWeight: 900 }}>LIVE</span>
                          </div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                            Join the {group.activeMeeting.platform} meeting
                          </p>
                        </div>
                      </div>
                      <a 
                        href={group.activeMeeting.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-primary" 
                        style={{ 
                          padding: '12px 28px', 
                          fontSize: 14, 
                          fontWeight: 700,
                          borderRadius: 14, 
                          backgroundColor: '#10b981',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Join Class <ArrowRight size={16} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Messages List Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(0,0,0,0.01)' }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No messages yet</p>
                    <p style={{ fontSize: 14 }}>Start the conversation by typing below!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender?._id === user._id
                    const isDiscussion = msg.messageType === 'discussion_launch'
                    const showHeader = (i === 0 || messages[i-1].sender?._id !== msg.sender?._id) && !isDiscussion
                    
                    if (isDiscussion) {
                       return (
                          <div key={msg._id} style={{ alignSelf: 'center', maxWidth: '80%', width: '100%', margin: '12px 0' }}>
                             <div className="glass" style={{ 
                                padding: '20px 24px', 
                                border: '1px solid var(--accent)', 
                                borderRadius: 20,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                backgroundColor: 'rgba(99, 102, 241, 0.05)'
                             }}>
                                <div style={{ width: 44, height: 44, backgroundColor: 'var(--accent)', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                   <MessageSquare size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                   <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>Persistent Discussion Started</p>
                                   <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{msg.sender?.name} {msg.content}</p>
                                   <button 
                                      onClick={() => { setActiveTab('discussions'); setActiveDiscussion(null); }}
                                      style={{ marginTop: 10, padding: '6px 14px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                   >
                                      Join Discussion
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
                            background: isMe ? 'var(--accent-gradient)' : 'var(--bg-card)', 
                            color: isMe ? '#fff' : 'var(--text-primary)',
                            borderRadius: 22,
                            borderTopRightRadius: isMe ? 4 : 22,
                            borderTopLeftRadius: !isMe ? 4 : 22,
                            boxShadow: isMe ? 'var(--shadow-p-md)' : 'var(--shadow-sm)',
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
                                  backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'var(--bg-secondary)',
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

              {/* Message Input */}
              <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
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

                <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, width: 44, height: 44 }} disabled={uploading}>
                      <Paperclip size={20} />
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, width: 44, height: 44 }} disabled={uploading}>
                      <Image size={20} />
                    </button>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                      type="text" 
                      value={newMessage} 
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={uploading ? "Uploading file..." : "Type a message..."} 
                      className="input-field" 
                      style={{ borderRadius: 20, paddingLeft: 24, height: 56, paddingRight: 60, border: '2px solid transparent', transition: 'all 0.3s ease', backgroundColor: 'var(--bg-secondary)' }}
                      disabled={uploading}
                    />
                    <button type="submit" disabled={(!newMessage.trim() && !selectedFile) || uploading} style={{ position: 'absolute', right: 10, top: 10, background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: 14, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}>
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {activeTab === 'discussions' && (
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {!activeDiscussion ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800 }}>Persistent Discussions</h2>
                    {isAdmin && (
                      <button 
                        onClick={() => setShowTopicForm(!showTopicForm)} 
                        className="btn-primary" 
                        style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <MessageSquare size={18} /> {showTopicForm ? 'Cancel' : 'Start New Topic'}
                      </button>
                    )}
                  </div>

                  {showTopicForm && (
                     <div className="card" style={{ padding: 24, borderRadius: 20, border: '1px solid var(--accent)', backgroundColor: 'rgba(59, 130, 246, 0.02)' }}>
                        <form onSubmit={startDiscussionTopic} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                           <div>
                              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>TOPIC TITLE</label>
                              <input className="input-field" value={discussionTopic} onChange={e => setDiscussionTopic(e.target.value)} placeholder="What should we discuss?" required />
                           </div>
                           <div>
                              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-secondary)' }}>INITIAL CONTENT</label>
                              <textarea className="input-field" rows={3} value={discussionContent} onChange={e => setDiscussionContent(e.target.value)} placeholder="Provide some context..." />
                           </div>
                           <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Broadcast Topic</button>
                        </form>
                     </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {discussions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, border: '2px dashed var(--border)', borderRadius: 24 }}>
                        <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No discussions yet.</p>
                      </div>
                    ) : (
                      discussions.map(d => (
                        <div key={d._id} className="card hover-scale" style={{ padding: 20, borderRadius: 20, cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setActiveDiscussion(d)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                               <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                                  {d.admin?.avatar ? <img src={d.admin.avatar} style={{ width: '100%', height: '100%', borderRadius: 10 }} /> : d.admin?.name?.charAt(0)}
                               </div>
                               <div>
                                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{d.topic}</h3>
                                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Started by {d.admin?.name} • {format(new Date(d.createdAt), 'MMM d')}</p>
                               </div>
                            </div>
                            <span style={{ fontSize: 11, padding: '4px 10px', backgroundColor: d.status === 'active' ? 'var(--success-bg)' : 'var(--bg-secondary)', color: d.status === 'active' ? 'var(--success)' : 'var(--text-secondary)', borderRadius: 10, fontWeight: 800 }}>{d.status.toUpperCase()}</span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{d.content}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, pt: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                             <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={14}/> {d.responses.length} responses</span>
                             <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14}/> {d.participants.length} involved</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <button onClick={() => setActiveDiscussion(null)} className="card" style={{ padding: 8, borderRadius: 12, border: 'none', cursor: 'pointer' }}><ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /></button>
                      <h2 style={{ fontSize: 18, fontWeight: 800 }}>{activeDiscussion.topic}</h2>
                   </div>
                   
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div className="card" style={{ padding: 24, borderRadius: 24, backgroundColor: 'var(--bg-secondary)', border: 'none' }}>
                         <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{activeDiscussion.content}</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                         {activeDiscussion.responses.map((r, i) => (
                           <div key={i} style={{ display: 'flex', gap: 14 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                 {r.user?.avatar ? <img src={r.user.avatar} style={{ width: '100%', height: '100%', borderRadius: 12 }} /> : r.user?.name?.charAt(0)}
                              </div>
                              <div className="card" style={{ flex: 1, padding: '12px 16px', borderRadius: 16, borderRadiusBottomLeft: 4 }}>
                                 <p style={{ fontSize: 12, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>{r.user?.name}</p>
                                 <p style={{ fontSize: 14, lineHeight: 1.5 }}>{r.content}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {activeDiscussion.status === 'active' && (
                     <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                        <form onSubmit={submitResponse} style={{ display: 'flex', gap: 12 }}>
                           <input 
                              className="input-field" 
                              value={newResponse} 
                              onChange={e => setNewResponse(e.target.value)} 
                              placeholder="Your thoughts on this topic..." 
                              style={{ borderRadius: 16 }}
                           />
                           <button type="submit" className="btn-primary" style={{ borderRadius: 12, padding: '0 24px' }}>Reply</button>
                        </form>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div style={{ padding: 32, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>Group Resources</h2>
                <button 
                  onClick={() => window.location.href = '/upload'} // Or open a modal to select from user's resources
                  className="btn-primary" 
                  style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <FileText size={18} /> Share New Resource
                </button>
              </div>
              {group.resources.length > 0 ? (
                <>
                  {/* Separate Links from other resources */}
                  {(() => {
                    const links = group.resources.filter(r => r.type === 'link')
                    const others = group.resources.filter(r => r.type !== 'link')
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {links.length > 0 && (
                          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16, border: '1px solid var(--border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <tr>
                                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>USEFUL LINKS</th>
                                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>ACTION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {links.map((link, idx) => (
                                  <tr key={link._id} style={{ borderBottom: idx !== links.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Globe size={18} color="var(--accent)" />
                                        <a href={`/resources/${link._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{link.title}</a>
                                      </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                      <a href={link.fileUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Open</a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {others.length > 0 && (
                          <div>
                            {links.length > 0 && <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: 'var(--text-secondary)' }}>STUDY MATERIALS</h3>}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                              {others.map(res => (
                                <ResourceCard key={res._id} resource={res} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                  <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <p style={{ fontSize: 16, fontWeight: 600 }}>No resources shared yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div style={{ padding: 32, overflowY: 'auto' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Group Members</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {group.members.map(m => (
                  <div key={m.user._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                          {m.user.avatar ? <img src={m.user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : m.user.name.charAt(0)}
                        </div>
                        {onlineUsers.includes(m.user._id) && (
                          <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--success)', border: '2px solid #fff' }}></div>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {m.user.name} 
                          {m.role === 'admin' && <span style={{ fontSize: 9, padding: '2px 8px', backgroundColor: 'var(--warning)', color: '#fff', borderRadius: 20, textTransform: 'uppercase', fontWeight: 800 }}>Admin</span>}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{m.user.college || 'No college'}</p>
                      </div>
                    </div>
                    <div>
                      {isAdmin && m.user._id !== user._id && (
                        <button 
                          onClick={async () => {
                            try {
                              await api.post(`/groups/${id}/winner`, { userId: m.user._id })
                              toast.success(`${m.user.name} awarded a badge!`)
                            } catch (err) {
                              toast.error('Failed to assign winner')
                            }
                          }}
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8, marginRight: 8, backgroundColor: 'var(--warning)' }}
                        >
                          Award Winner
                        </button>
                      )}
                      {onlineUsers.includes(m.user._id) ? (
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--success)' }}>ONLINE</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>OFFLINE</span>
                      )}
                      {m.user._id !== user._id && (
                        <button 
                          onClick={() => (window.location.href = `/chat/${m.user._id}`)}
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8, marginLeft: 12, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'study-room' && (
            <StudyRoom groupId={id} group={group} socket={socket} user={user} />
          )}
        </div>

        {/* Sidebar Info (Only on larger screens) */}
        <div style={{ width: 320, display: 'none', flexDirection: 'column', gap: 24 }} className="hide-on-mobile">
          <div className="card" style={{ padding: 24, borderRadius: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} color="var(--accent)" /> Group Info</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{group.description}</p>
          </div>
        </div>
      </div>

      {/* Admin Panel Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Group Admin Control">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Daily Topic Update */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} /> Update Daily Topic</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                className="input-field" 
                value={topicInput} 
                onChange={e => setTopicInput(e.target.value)} 
                placeholder="What are we discussing today?" 
              />
              <button onClick={handleUpdateTopic} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Update</button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Meeting Link Update */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Video size={18} /> Update Meeting Link</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <select className="input-field" style={{ width: 140 }} value={meetingPlatform} onChange={e => setMeetingPlatform(e.target.value)}>
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Teams</option>
                  <option value="Other">Other</option>
                </select>
                <input 
                  className="input-field" 
                  value={meetingUrl} 
                  onChange={e => setMeetingUrl(e.target.value)} 
                  placeholder="https://zoom.us/j/..." 
                />
              </div>
              <button 
                onClick={handleUpdateMeeting} 
                className="btn-primary" 
                style={{ width: '100%', backgroundColor: '#10b981' }}
              >
                Set Meeting Link
              </button>
              {group.activeMeeting?.link && (
                <button 
                  onClick={async () => {
                    await api.put(`/groups/${id}/meeting`, { link: '', platform: 'Other' })
                    toast.success('Meeting link cleared')
                    refetch()
                    setIsAdminModalOpen(false)
                  }}
                  className="btn-primary" 
                  style={{ width: '100%', backgroundColor: 'var(--danger)', color: '#fff' }}
                >
                  Clear Active Meeting
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        @media (min-width: 1024px) {
          .hide-on-mobile { display: flex !important; }
        }
        .pulse-indicator {
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
      </div>
    </>
  )
}
