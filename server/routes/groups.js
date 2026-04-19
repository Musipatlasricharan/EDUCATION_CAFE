const express = require('express')
const router = express.Router()
const { protect, checkOwnership, checkGroupAdmin } = require('../middleware/auth')
const Group = require('../models/Group')
const {
  createGroup, getGroups, getSingleGroup, deleteGroup,
  joinGroup, leaveGroup, getGroupMembers, joinByInviteCode,
  updateDailyTopic, updateMeetingLink, addResourceToGroup, getGroupResources,
  assignGroupWinner
} = require('../controllers/groupController')

router.post('/:id/winner', protect, assignGroupWinner)

router.route('/')
  .get(protect, getGroups)
  .post(protect, createGroup)

router.route('/:id')
  .get(protect, getSingleGroup)
  .delete(protect, deleteGroup)

router.post('/:id/join', protect, joinGroup)
router.post('/join/:code', protect, joinByInviteCode)
router.post('/:id/leave', protect, leaveGroup)
router.get('/:id/members', protect, getGroupMembers)

router.route('/:id/resources')
  .get(protect, getGroupResources)
  .post(protect, addResourceToGroup)

router.put('/:id/topic', protect, checkGroupAdmin(Group), updateDailyTopic)
router.put('/:id/meeting', protect, checkGroupAdmin(Group), updateMeetingLink)

module.exports = router
