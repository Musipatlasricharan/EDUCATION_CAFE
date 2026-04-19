const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      let user = await User.findOne({ email })

      if (user) {
        // Update user if they don't have a googleId yet
        if (!user.googleId) {
          user.googleId = profile.id
          await user.save()
        }
        return done(null, user)
      }

      // Create new user if they don't exist
      user = await User.create({
        name: profile.displayName,
        email: email,
        googleId: profile.id,
        isVerified: true // Google accounts are pre-verified
      })

      done(null, user)
    } catch (err) {
      done(err, null)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})
