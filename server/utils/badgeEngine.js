const User = require('../models/User')
const Badge = require('../models/Badge')
const EarnedBadge = require('../models/EarnedBadge')
const Notification = require('../models/Notification')
const Message = require('../models/Message')
const Group = require('../models/Group')
const { DateTime } = require('luxon') // Use luxon for timezone handling

const checkAndAward = async (userId, category, data = {}) => {
  try {
    const user = await User.findById(userId).populate('badges')
    if (!user) return null

    let earnedNewBadge = false
    const currentBadges = user.badges.map(b => b.trigger)

    const newlyEarned = []

    const postAppreciation = async (user, badge) => {
      try {
        // Create Notification
        await Notification.create({
          recipient: user._id,
          type: 'badge',
          message: `Congratulations! You've earned the ${badge.name} badge: ${badge.description}`,
          sender: user._id // Self-sender for system notification
        });

        // Create Appreciation Post in General Group
        const groupName = `General-${user.college}`;
        const group = await Group.findOne({ name: groupName, college: user.college });
        
        if (group) {
          await Message.create({
            group: group._id,
            sender: user._id,
            content: `🎉 I just earned the **${badge.name}** badge! ${badge.description} #Achievement #EduCafe`,
            messageType: 'text'
          });
          console.log(`Appreciation post created for ${user.name} in ${groupName}`);
        }
      } catch (err) {
        console.error('Appreciation post error:', err);
      }
    };

    const award = async (trigger) => {
      if (currentBadges.includes(trigger)) return
      const badge = await Badge.findOne({ trigger })
      if (!badge) return

      user.badges.push(badge._id)
      user.points += badge.points
      user.totalPoints += badge.points
      
      await EarnedBadge.create({
        user: userId,
        badge: badge._id,
        triggerData: data
      })
      
      await postAppreciation(user, badge);

      newlyEarned.push(badge)
      earnedNewBadge = true
      return badge
    }

    // 1. Resource Contributor Track
    if (category === 'Resource') {
      const uploads = user.totalUploads
      if (uploads >= 1) await award('first_launch')
      if (uploads >= 10) await award('payload_drop')
      if (uploads >= 50) await award('orbital_contributor')
      if (uploads >= 100 && data.avgRating >= 4) await award('deep_space_archive')
    }

    // 2. Daily Engagement Track
    if (category === 'Engagement') {
      const timezone = user.timezone || 'UTC'
      const now = DateTime.now().setZone(timezone)
      const lastActive = user.lastActiveDate ? DateTime.fromJSDate(user.lastActiveDate).setZone(timezone) : null

      if (!lastActive || now.diff(lastActive, 'days').days >= 1) {
        if (lastActive && now.diff(lastActive, 'days').days <= 1.5) {
          user.currentStreak += 1
        } else if (lastActive) {
          // Streak broken
          if (user.currentStreak >= 14) {
             user.hasLapsedLargeStreak = true
          }
          user.currentStreak = 1
        } else {
          user.currentStreak = 1
        }

        user.lastActiveDate = now.toJSDate()
        if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak

        // Award streak badges
        if (user.currentStreak >= 3) await award('ignition')
        if (user.currentStreak >= 7) {
          await award('steady_orbit')
          if (user.hasLapsedLargeStreak) {
            await award('streak_resurrection')
            user.hasLapsedLargeStreak = false
          }
        }
        if (user.currentStreak >= 30) await award('atmospheric_burn')
        if (user.currentStreak >= 100) await award('gravity_lock')
      }
    }

    // 3. Discussion Victory Track
    if (category === 'Discussion') {
      const wins = user.discussionWins
      if (wins >= 1) await award('signal_found')
      if (wins >= 3) await award('resonance')
      if (wins >= 10) await award('event_horizon')
      
      if (data.isUnanimous) await award('unanimous_call')
      if (data.uniqueGroupsWon >= 5) await award('the_arbitrator')
    }

    // 4. Download Milestone Track
    if (category === 'Download') {
      const downloads = user.totalDownloads
      if (downloads >= 1) await award('first_download')
    }

    // 5. Coding Challenge Track
    if (category === 'CodingChallenge') {
      const CodingSubmission = require('../models/CodingSubmission')
      const acceptedCount = await CodingSubmission.countDocuments({
        user: userId,
        isAccepted: true
      })
      
      if (acceptedCount >= 1) await award('first_code')
      if (acceptedCount >= 5) await award('rookie_coder')
      if (acceptedCount >= 15) await award('intermediate_coder')
      if (acceptedCount >= 50) await award('code_master')
      if (acceptedCount >= 100) await award('code_legend')
      
      // Language-specific badges
      if (data.language === 'cpp') {
        const cppCount = await CodingSubmission.countDocuments({
          user: userId,
          language: 'cpp',
          isAccepted: true
        })
        if (cppCount >= 5) await award('cpp_expert')
      }
      if (data.language === 'python') {
        const pythonCount = await CodingSubmission.countDocuments({
          user: userId,
          language: 'python',
          isAccepted: true
        })
        if (pythonCount >= 5) await award('python_expert')
      }
      if (data.language === 'java') {
        const javaCount = await CodingSubmission.countDocuments({
          user: userId,
          language: 'java',
          isAccepted: true
        })
        if (javaCount >= 5) await award('java_expert')
      }
      if (data.language === 'c') {
        const cCount = await CodingSubmission.countDocuments({
          user: userId,
          language: 'c',
          isAccepted: true
        })
        if (cCount >= 5) await award('c_expert')
      }
      
      // Difficulty-based badges
      if (data.difficulty === 'Hard') {
        const hardCount = await CodingSubmission.aggregate([
          { $match: { user: require('mongoose').Types.ObjectId ? new (require('mongoose').Types.ObjectId)(userId) : userId, isAccepted: true } },
          { $lookup: { from: 'codingquestions', localField: 'question', foreignField: '_id', as: 'q' } },
          { $unwind: '$q' },
          { $match: { 'q.difficulty': 'Hard' } },
          { $count: 'total' }
        ]);
        if ((hardCount[0]?.total || 0) >= 10) await award('hard_problem_solver')
      }
    }

    // 6. General Milestones
    const combinedActivity = (user.totalUploads || 0) + (user.totalDownloads || 0)
    if (combinedActivity >= 100) await award('milestone_100')
    if (combinedActivity >= 200) await award('milestone_200')
    if (combinedActivity >= 1000) await award('milestone_1000')

    if (earnedNewBadge || category === 'Engagement') {
      await user.save({ validateBeforeSave: false })
    }
    
    return newlyEarned
  } catch (error) {
    console.error('Badge Engine Error:', error)
    return false
  }
}

module.exports = { checkAndAward }

