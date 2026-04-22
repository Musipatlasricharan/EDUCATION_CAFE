const jwt = require('jsonwebtoken')
const Message = require('../models/Message')
const User = require('../models/User')

module.exports = (io) => {
  const onlineUsers = new Map()

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication error'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch {
      next(new Error('Token invalid or expired'))
    }
  })

  io.on('connection', async (socket) => {
    onlineUsers.set(socket.userId, socket.id)
    
    // Fetch and store user info for efficient signaling
    const user = await User.findById(socket.userId).select('name')
    if (user) socket.userName = user.name

    io.emit('online_users', Array.from(onlineUsers.keys()))
    socket.broadcast.emit('user_online', socket.userId)

    // Join personal room for private messages
    socket.join(socket.userId)

    // Automatically join all groups the user is a member of
    User.findById(socket.userId).populate('groups').then(user => {
      if (user && user.groups) {
        user.groups.forEach(group => {
          socket.join(group._id.toString())
        })
      }
    }).catch(err => console.error('Error joining group rooms:', err))

    socket.on('join_group', (groupId) => {
      if (groupId) socket.join(groupId.toString())
    })

    socket.on('get_online_users', () => {
      socket.emit('online_users', Array.from(onlineUsers.keys()))
    })

    socket.on('leave_group', (groupId) => {
      socket.leave(groupId)
    })

    socket.on('send_message', async ({ groupId, content, messageType = 'text', replyTo = null, fileUrl = null, resourceId = null }) => {
      try {
        const message = await Message.create({
          group: groupId,
          sender: socket.userId,
          content,
          messageType,
          replyTo,
          fileUrl,
          resource: resourceId
        })
        await message.populate('sender', 'name avatar')
        if (replyTo) {
          await message.populate('replyTo')
        }

        const msgObj = message.toObject()
        msgObj.reactions = Object.fromEntries(message.reactions || new Map())
        msgObj.group = groupId.toString() // Ensure string

        io.to(groupId.toString()).emit('new_message', msgObj)
        io.to(groupId.toString()).emit('group_active', { groupId: groupId.toString() })

        // 🔔 Create Notifications for all members except sender
        const Group = require('../models/Group')
        const Notification = require('../models/Notification')
        
        const group = await Group.findById(groupId)
        if (group) {
          const notificationPromises = group.members
            .filter(member => member.user.toString() !== socket.userId)
            .map(async (member) => {
              const notif = await Notification.create({
                recipient: member.user,
                sender: socket.userId,
                type: 'group_message',
                message: `New message in ${group.name}`,
                group: groupId,
                link: `/groups/${groupId}`
              })
              
              const recipientSocketId = onlineUsers.get(member.user.toString())
              if (recipientSocketId) {
                io.to(recipientSocketId).emit('new_notification', notif)
              }
            })
          
          await Promise.all(notificationPromises)
        }
      } catch (err) {
        console.error('Socket Message Error:', err)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('start_discussion', async ({ groupId, topic, content }) => {
      try {
        const Discussion = require('../models/Discussion')
        const discussion = await Discussion.create({
          group: groupId,
          topic,
          content,
          admin: socket.userId
        })
        await discussion.populate('admin', 'name avatar')
        io.to(groupId).emit('new_discussion', discussion)

        // 📣 Integrated: Also send a message to the group chat about the discussion
        const message = await Message.create({
          group: groupId,
          sender: socket.userId,
          content: `started a new persistent discussion: **${topic}**`,
          messageType: 'discussion_launch',
          resource: discussion._id // Use resource field to link to discussion if needed, or handle specially in UI
        })
        await message.populate('sender', 'name avatar')
        io.to(groupId).emit('new_message', message)

      } catch (err) {
        console.error('Socket Discussion Error:', err)
        socket.emit('error', { message: 'Failed to start discussion' })
      }
    })

    socket.on('send_private_message', async ({ recipientId, content, messageType = 'text', fileUrl = null }) => {
      try {
        const message = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          content,
          messageType,
          fileUrl
        })
        await message.populate('sender', 'name avatar')
        await message.populate('recipient', 'name avatar')

        const msgObj = message.toObject()
        
        // Emitting to recipient's personal room
        io.to(recipientId).emit('new_private_message', msgObj)
        // Also send to sender's own room (useful for multi-device sync)
        io.to(socket.userId).emit('new_private_message', msgObj)

        // Notification for private message
        const Notification = require('../models/Notification')
        const notif = await Notification.create({
          recipient: recipientId,
          sender: socket.userId,
          type: 'private_message',
          message: `Sent you a private message`,
          link: `/chat/${socket.userId}`
        })
        
        const recipientSocketId = onlineUsers.get(recipientId)
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_notification', notif)
        }
      } catch (err) {
        console.error('Socket Private Message Error:', err)
        socket.emit('error', { message: 'Failed to send private message' })
      }
    })

    socket.on('post_discussion_response', async ({ discussionId, content }) => {
      try {
        const Discussion = require('../models/Discussion')
        const discussion = await Discussion.findById(discussionId)
        if (!discussion || discussion.status !== 'active') return

        discussion.responses.push({
          user: socket.userId,
          content,
          createdAt: new Date()
        })
        
        if (!discussion.participants.includes(socket.userId)) {
          discussion.participants.push(socket.userId)
        }

        await discussion.save()
        await discussion.populate('responses.user', 'name avatar')
        await discussion.populate('admin', 'name avatar')

        io.to(discussion.group.toString()).emit('discussion_updated', discussion)
      } catch (err) {
        console.error('Socket Response Error:', err)
        socket.emit('error', { message: 'Failed to post response' })
      }
    })

    socket.on('typing', ({ groupId, isTyping }) => {
      socket.to(groupId).emit('user_typing', { userId: socket.userId, isTyping })
    })

    socket.on('react_message', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId)
        if (!message) return

        if (!message.reactions) message.reactions = new Map()
        const usersArray = message.reactions.get(emoji) || []
        
        const userIndex = usersArray.indexOf(socket.userId)
        if (userIndex > -1) {
          usersArray.splice(userIndex, 1)
        } else {
          usersArray.push(socket.userId)
        }
        
        if (usersArray.length === 0) {
          message.reactions.delete(emoji)
        } else {
          message.reactions.set(emoji, usersArray)
        }

        await message.save()
        
        const msgObj = message.toObject()
        msgObj.reactions = Object.fromEntries(message.reactions || new Map())
        
        io.to(message.group.toString()).emit('message_reaction', { messageId, reactions: msgObj.reactions })
      } catch (err) {
        console.error(err)
      }
    })

    socket.on('join_user_room', () => {
      socket.join(socket.userId)
    })

    socket.on('sync_study_timer', ({ groupId, timer, isActive, mode }) => {
      socket.to(groupId).emit('study_timer_updated', { timer, isActive, mode, senderId: socket.userId })
    })

    socket.on('sync_ai_chat', ({ groupId, message }) => {
      // message should include { role, text, senderName }
      socket.to(groupId).emit('ai_chat_updated', message)
    })

    // ─── Engage Room: Live Video Signaling ───────────────────────────────────
    // Track room participants: engageRooms[groupId] = [{ userId, name, isMuted, isVideoOff }]
    const engageRoomKey = (groupId) => `engage:${groupId}`

    socket.on('engage:join', async ({ groupId, userId, name, isMuted, isVideoOff }) => {
      const roomKey = engageRoomKey(groupId)
      socket.join(roomKey)

      // Store participant info on socket for cleanup
      if (!socket.engageRooms) socket.engageRooms = {}
      socket.engageRooms[groupId] = { userId, name }

      // Get all current participants in this room (excluding self)
      const roomSockets = await io.in(roomKey).fetchSockets()
      const existingParticipants = roomSockets
        .filter(s => s.id !== socket.id && s.engageRooms?.[groupId])
        .map(s => ({
          userId: s.engageRooms[groupId].userId,
          name: s.engageRooms[groupId].name,
          isMuted: s.engageStatus?.[groupId]?.isMuted ?? false,
          isVideoOff: s.engageStatus?.[groupId]?.isVideoOff ?? false
        }))

      // Send current participants list to the new joiner
      socket.emit('engage:room-participants', existingParticipants)

      // Notify everyone else that a new user has joined
      socket.to(roomKey).emit('engage:user-joined', { userId, name, isMuted, isVideoOff })
    })

    socket.on('engage:leave', ({ groupId, userId, name }) => {
      const roomKey = engageRoomKey(groupId)
      socket.leave(roomKey)
      socket.to(roomKey).emit('engage:user-left', { userId, name })
      if (socket.engageRooms) delete socket.engageRooms[groupId]
    })

    // WebRTC signaling: forward offer/answer/ICE to specific peer
    socket.on('engage:offer', ({ to, groupId, offer }) => {
      const recipientSocketId = onlineUsers.get(to)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('engage:offer', {
          from: socket.userId,
          name: socket.userName || 'Participant',
          offer
        })
      }
    })

    socket.on('engage:answer', ({ to, groupId, answer }) => {
      const recipientSocketId = onlineUsers.get(to)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('engage:answer', { from: socket.userId, answer })
      }
    })

    socket.on('engage:ice-candidate', ({ to, groupId, candidate }) => {
      const recipientSocketId = onlineUsers.get(to)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('engage:ice-candidate', { from: socket.userId, candidate })
      }
    })

    // Status updates (mute, video, hand)
    socket.on('engage:status', ({ groupId, userId, isMuted, isVideoOff, isHandRaised }) => {
      if (!socket.engageStatus) socket.engageStatus = {}
      socket.engageStatus[groupId] = { isMuted, isVideoOff, isHandRaised }
      socket.to(engageRoomKey(groupId)).emit('engage:status-update', { userId, isMuted, isVideoOff, isHandRaised })
    })

    // In-room chat (separate from group chat)
    socket.on('engage:chat', ({ groupId, msg }) => {
      socket.to(engageRoomKey(groupId)).emit('engage:room-chat', msg)
    })
    // ─── End Engage Room ─────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      // Leave all engage rooms and notify participants
      if (socket.engageRooms) {
        Object.entries(socket.engageRooms).forEach(([groupId, { userId, name }]) => {
          socket.to(engageRoomKey(groupId)).emit('engage:user-left', { userId, name })
        })
      }
      onlineUsers.delete(socket.userId)
      io.emit('online_users', Array.from(onlineUsers.keys()))
      socket.broadcast.emit('user_offline', socket.userId)
    })
  })
}

