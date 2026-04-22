import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorOff,
  Users, MessageSquare, Send, X, Maximize2, Minimize2, Signal,
  Hand, HandMetal, Volume2, VolumeX, Grid, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ─── ICE STUN Servers ────────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

// ─── Participant Video Tile ───────────────────────────────────────────────────
function ParticipantTile({ stream, name, isMe, isMuted, isVideoOff, isHandRaised, isSpeaking, isScreenShare }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
        border: isSpeaking
          ? '2px solid #10b981'
          : isMe
            ? '2px solid rgba(99,102,241,0.5)'
            : '2px solid rgba(255,255,255,0.06)',
        aspectRatio: isScreenShare ? '16/9' : '4/3',
        minHeight: isScreenShare ? 300 : 160,
        boxShadow: isSpeaking ? '0 0 0 4px rgba(16,185,129,0.2)' : 'none',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMe}
        style={{
          width: '100%',
          height: '100%',
          objectFit: isScreenShare ? 'contain' : 'cover',
          display: isVideoOff && !isScreenShare ? 'none' : 'block',
          transform: isMe && !isScreenShare ? 'scaleX(-1)' : 'none',
          backgroundColor: '#000'
        }}
      />

      {/* Avatar fallback when video is off */}
      {isVideoOff && !isScreenShare && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          gap: 12
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
          }}>
            {initials}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Camera Off</span>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 14px 12px 14px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#fff',
            maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {name}{isMe ? ' (You)' : ''}
          </span>
          {isScreenShare && (
            <span style={{
              fontSize: 9, padding: '2px 6px', backgroundColor: '#10b981',
              color: '#fff', borderRadius: 6, fontWeight: 800, textTransform: 'uppercase'
            }}>Screen</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {isHandRaised && (
            <div style={{ width: 24, height: 24, backgroundColor: '#f59e0b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✋
            </div>
          )}
          <div style={{
            width: 24, height: 24,
            backgroundColor: isMuted ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.1)',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {isMuted ? <MicOff size={12} color="#fff" /> : <Mic size={12} color="#fff" />}
          </div>
        </div>
      </div>

      {/* Speaking indicator ring */}
      {isSpeaking && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          border: '3px solid #10b981',
          pointerEvents: 'none',
          animation: 'speakingPulse 1.5s ease-in-out infinite'
        }} />
      )}
    </motion.div>
  );
}

// ─── Main EngageRoom Component ────────────────────────────────────────────────
export default function EngageRoom({ groupId, group, socket, user, onClose }) {
  // Media state
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Participants: { userId, name, stream, isMuted, isVideoOff, isHandRaised, isSpeaking }
  const [participants, setParticipants] = useState([]);
  const [liveCount, setLiveCount] = useState(1);

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // UI
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState('grid'); // 'grid' | 'spotlight'
  const [isConnecting, setIsConnecting] = useState(true);
  const [duration, setDuration] = useState(0);

  // WebRTC
  const peersRef = useRef({}); // { userId: RTCPeerConnection }
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // ─── Duration ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  // ─── Auto-scroll chat ─────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Get local media ──────────────────────────────────────────────────────
  useEffect(() => {
    let stream;
    const initMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (err) {
        console.warn('Camera/mic not available, audio-only fallback:', err);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setLocalStream(stream);
          localStreamRef.current = stream;
          setIsVideoOff(true);
        } catch (audioErr) {
          console.warn('No media devices, joining without media:', audioErr);
          setIsVideoOff(true);
          setIsMuted(true);
        }
      } finally {
        setIsConnecting(false);
      }
    };
    initMedia();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ─── WebRTC helpers ───────────────────────────────────────────────────────
  const createPeer = useCallback((targetUserId, isInitiator) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach(track => pc.addTrack(track, currentStream));
    }

    // ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket) {
        socket.emit('engage:ice-candidate', { to: targetUserId, groupId, candidate });
      }
    };

    // Remote stream
    pc.ontrack = (evt) => {
      const [remoteStream] = evt.streams;
      setParticipants(prev => {
        const existing = prev.find(p => p.userId === targetUserId);
        if (existing) {
          return prev.map(p => p.userId === targetUserId ? { ...p, stream: remoteStream } : p);
        }
        return prev;
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    peersRef.current[targetUserId] = pc;
    return pc;
  }, [socket, groupId]);

  // ─── Socket signaling ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Announce joining
    socket.emit('engage:join', {
      groupId,
      userId: user._id,
      name: user.name,
      isMuted,
      isVideoOff: isVideoOff || !localStreamRef.current
    });

    // Someone new joined → send them an offer
    const handleUserJoined = async ({ userId, name, isMuted: theirMuted, isVideoOff: theirVideo }) => {
      if (userId === user._id) return;
      toast(`${name} joined the room`, { icon: '👋' });
      setParticipants(prev => {
        if (prev.find(p => p.userId === userId)) return prev;
        return [...prev, { userId, name, stream: null, isMuted: theirMuted, isVideoOff: theirVideo, isHandRaised: false, isSpeaking: false }];
      });
      setLiveCount(c => c + 1);

      // Initiator sends offer
      const pc = createPeer(userId, true);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('engage:offer', { to: userId, groupId, offer });
      } catch (err) {
        console.error('Offer error:', err);
      }
    };

    // Existing participants list on join
    const handleRoomParticipants = (participants) => {
      participants.forEach(async ({ userId, name, isMuted: theirMuted, isVideoOff: theirVideo }) => {
        if (userId === user._id) return;
        setParticipants(prev => {
          if (prev.find(p => p.userId === userId)) return prev;
          return [...prev, { userId, name, stream: null, isMuted: theirMuted, isVideoOff: theirVideo, isHandRaised: false, isSpeaking: false }];
        });
        setLiveCount(c => c + 1);
      });
    };

    // Receive offer → send answer
    const handleOffer = async ({ from, offer, name }) => {
      if (!peersRef.current[from]) {
        setParticipants(prev => {
          if (prev.find(p => p.userId === from)) return prev;
          return [...prev, { userId: from, name: name || 'Participant', stream: null, isMuted: false, isVideoOff: false, isHandRaised: false, isSpeaking: false }];
        });
      }
      const pc = peersRef.current[from] || createPeer(from, false);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('engage:answer', { to: from, groupId, answer });
      } catch (err) {
        console.error('Answer error:', err);
      }
    };

    // Receive answer
    const handleAnswer = async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('setRemoteDescription error:', err);
      }
    };

    // ICE candidate
    const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    };

    // User left
    const handleUserLeft = ({ userId, name }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
      setLiveCount(c => Math.max(1, c - 1));
      const pc = peersRef.current[userId];
      if (pc) { pc.close(); delete peersRef.current[userId]; }
      toast(`${name || 'Someone'} left the room`, { icon: '👋' });
    };

    // Status updates (mute/video/hand)
    const handleStatusUpdate = ({ userId, isMuted: m, isVideoOff: v, isHandRaised: h }) => {
      setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, isMuted: m, isVideoOff: v, isHandRaised: h } : p));
    };

    // Room chat
    const handleRoomChat = (msg) => {
      setChatMessages(prev => [...prev, msg]);
    };

    socket.on('engage:user-joined', handleUserJoined);
    socket.on('engage:room-participants', handleRoomParticipants);
    socket.on('engage:offer', handleOffer);
    socket.on('engage:answer', handleAnswer);
    socket.on('engage:ice-candidate', handleIceCandidate);
    socket.on('engage:user-left', handleUserLeft);
    socket.on('engage:status-update', handleStatusUpdate);
    socket.on('engage:room-chat', handleRoomChat);

    return () => {
      socket.emit('engage:leave', { groupId, userId: user._id, name: user.name });
      socket.off('engage:user-joined', handleUserJoined);
      socket.off('engage:room-participants', handleRoomParticipants);
      socket.off('engage:offer', handleOffer);
      socket.off('engage:answer', handleAnswer);
      socket.off('engage:ice-candidate', handleIceCandidate);
      socket.off('engage:user-left', handleUserLeft);
      socket.off('engage:status-update', handleStatusUpdate);
      socket.off('engage:room-chat', handleRoomChat);

      // Close all peers
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
    };
  }, [socket, groupId, user, createPeer]);

  // ─── Broadcast status changes ─────────────────────────────────────────────
  const broadcastStatus = useCallback((updates = {}) => {
    socket?.emit('engage:status', {
      groupId, userId: user._id,
      isMuted: updates.isMuted ?? isMuted,
      isVideoOff: updates.isVideoOff ?? isVideoOff,
      isHandRaised: updates.isHandRaised ?? isHandRaised,
    });
  }, [socket, groupId, user._id, isMuted, isVideoOff, isHandRaised]);

  // ─── Controls ─────────────────────────────────────────────────────────────
  const toggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = !next);
    broadcastStatus({ isMuted: next });
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = !next);
    broadcastStatus({ isVideoOff: next });
  };

  const toggleHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    broadcastStatus({ isHandRaised: next });
    if (next) toast('✋ Hand raised!', { duration: 2000 });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsScreenSharing(false);

      // Replace tracks in all peers with camera
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(camTrack).catch(console.error);
        });
      }
      toast('Screen share stopped');
    } else {
      try {
        const sStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = sStream;
        setScreenStream(sStream);
        setIsScreenSharing(true);

        // Replace video tracks in all peer connections
        const screenTrack = sStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack).catch(console.error);
        });

        // Auto-stop when user stops from browser UI
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          screenStreamRef.current = null;
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            Object.values(peersRef.current).forEach(pc => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(camTrack).catch(console.error);
            });
          }
        };
        toast.success('Screen sharing started');
      } catch (err) {
        if (err.name !== 'NotAllowedError') toast.error('Failed to share screen');
      }
    }
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { userId: user._id, name: user.name, text: chatInput.trim(), time: new Date().toISOString() };
    socket?.emit('engage:chat', { groupId, msg });
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  // ─── Leave ────────────────────────────────────────────────────────────────
  const handleLeave = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    onClose();
  };

  // ─── Build participant grid ───────────────────────────────────────────────
  const allParticipants = [
    {
      userId: user._id,
      name: user.name,
      stream: isScreenSharing ? screenStream : localStream,
      isMuted,
      isVideoOff: isScreenSharing ? false : isVideoOff,
      isHandRaised,
      isSpeaking: false,
      isMe: true,
      isScreenShare: isScreenSharing
    },
    ...participants
  ];

  const colCount = allParticipants.length <= 1 ? 1
    : allParticipants.length <= 2 ? 2
    : allParticipants.length <= 4 ? 2
    : allParticipants.length <= 6 ? 3
    : 3;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#080c14',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      <style>{`
        @keyframes speakingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes liveBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .engage-chat-msg:hover { background: rgba(255,255,255,0.04) !important; }
        .engage-ctrl-btn {
          width: 52px; height: 52px; border-radius: 16px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s ease; font-size: 13px;
        }
        .engage-ctrl-btn:hover { transform: translateY(-2px); }
        .engage-ctrl-btn:active { transform: scale(0.94); }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981',
              animation: 'liveBlink 2s ease infinite',
              boxShadow: '0 0 6px rgba(16,185,129,0.7)'
            }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>
              Live
            </span>
          </div>
          <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {group?.name || 'Engage Room'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Duration */}
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontWeight: 600 }}>
            {formatDuration(duration)}
          </span>
          {/* Participant count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 30, backgroundColor: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Users size={14} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>{liveCount} live</span>
          </div>
          {/* Signal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Signal size={16} color="#10b981" />
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Connected</span>
          </div>
          {/* Layout toggle */}
          <button
            onClick={() => setLayout(l => l === 'grid' ? 'spotlight' : 'grid')}
            className="engage-ctrl-btn"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', width: 36, height: 36 }}
            title={layout === 'grid' ? 'Spotlight view' : 'Grid view'}
          >
            <Grid size={16} />
          </button>
          {/* Chat toggle */}
          <button
            onClick={() => setIsChatOpen(c => !c)}
            className="engage-ctrl-btn"
            style={{ backgroundColor: isChatOpen ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)', color: isChatOpen ? '#a5b4fc' : 'rgba(255,255,255,0.7)', width: 36, height: 36, position: 'relative' }}
            title="Room Chat"
          >
            <MessageSquare size={16} />
            {chatMessages.length > 0 && !isChatOpen && (
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            )}
          </button>
          {/* Close */}
          <button
            onClick={handleLeave}
            className="engage-ctrl-btn"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', width: 36, height: 36 }}
            title="Leave Room"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Video Grid */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, overflow: 'hidden'
        }}>
          {isConnecting ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <Loader size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600 }}>Setting up your media...</p>
            </div>
          ) : (
            <AnimatePresence>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                gap: 16,
                width: '100%',
                maxWidth: 1400,
                alignItems: 'start',
                justifyContent: 'center'
              }}>
                {allParticipants.map((p) => (
                  <ParticipantTile
                    key={p.userId + (p.isScreenShare ? '-screen' : '')}
                    stream={p.stream}
                    name={p.name}
                    isMe={p.isMe}
                    isMuted={p.isMuted}
                    isVideoOff={p.isVideoOff}
                    isHandRaised={p.isHandRaised}
                    isSpeaking={p.isSpeaking}
                    isScreenShare={p.isScreenShare}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Side Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: 340, display: 'flex', flexDirection: 'column',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                overflow: 'hidden', flexShrink: 0
              }}
            >
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Room Chat</h3>
                <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.25)' }}>
                    <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>No messages yet</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Say hi to everyone!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isMe = msg.userId === user._id;
                    return (
                      <div key={i} className="engage-chat-msg" style={{
                        padding: '8px 12px', borderRadius: 12,
                        backgroundColor: isMe ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        border: isMe ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        transition: 'background 0.2s'
                      }}>
                        {!isMe && (
                          <p style={{ fontSize: 10, fontWeight: 800, color: '#a5b4fc', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {msg.name}
                          </p>
                        )}
                        <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{msg.text}</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' }}>
                          {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChat} style={{
                padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 10, backgroundColor: 'rgba(0,0,0,0.2)'
              }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Message room..."
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: '#fff', fontSize: 13, outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', opacity: !chatInput.trim() ? 0.5 : 1, flexShrink: 0
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls Bar ── */}
      <div style={{
        height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(20px)',
        gap: 12, flexShrink: 0
      }}>

        {/* Mic */}
        <button
          onClick={toggleMic}
          className="engage-ctrl-btn"
          style={{
            backgroundColor: isMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            color: isMuted ? '#f87171' : '#fff',
            border: isMuted ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleVideo}
          className="engage-ctrl-btn"
          style={{
            backgroundColor: isVideoOff ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            color: isVideoOff ? '#f87171' : '#fff',
            border: isVideoOff ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
          }}
          title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className="engage-ctrl-btn"
          style={{
            backgroundColor: isScreenSharing ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
            color: isScreenSharing ? '#a5b4fc' : '#fff',
            border: isScreenSharing ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
          }}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff size={22} /> : <MonitorUp size={22} />}
        </button>

        {/* Hand */}
        <button
          onClick={toggleHand}
          className="engage-ctrl-btn"
          style={{
            backgroundColor: isHandRaised ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)',
            color: isHandRaised ? '#fbbf24' : '#fff',
            border: isHandRaised ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
          }}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          ✋
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* Leave */}
        <button
          onClick={handleLeave}
          className="engage-ctrl-btn"
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            width: 60, height: 52,
            boxShadow: '0 8px 24px rgba(239,68,68,0.4)'
          }}
          title="Leave call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </motion.div>,
    document.body
  );
}
