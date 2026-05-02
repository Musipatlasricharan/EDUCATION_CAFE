require('dotenv').config() // Force reload env
const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const xss = require('xss-clean')
const compression = require('compression')
const session = require('express-session')
const passport = require('passport')
require('./config/passport') // Google Passport Config


const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const socketHandler = require('./socket/socketHandler')
const seedProblems = require('./utils/seeder')


// connectDB() - Removed as it's now handled in startServer()


const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  },
  transports: ['websocket', 'polling']
})

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "http://res.cloudinary.com"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000", "https://*.mongodb.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }
}))

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true
}))

app.use('/api/users/avatar', express.json({ limit: '5mb' })) // Allow large base64 avatars
app.use(express.json({ limit: '2mb' })) // Body parser - allow large AI inputs
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(mongoSanitize())
app.use(xss()) // Prevent XSS attacks
app.use(hpp()) // Prevent HTTP Parameter Pollution
app.use(compression()) // Compress responses for performance

// Session configuration for Passport
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}))

app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Serve uploaded files statically
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased limit from 100 to avoid 429 errors during normal usage/testing
  message: 'Too many requests from this IP, please try again after 15 minutes'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Strict limiter for auth routes
  message: 'Too many login/register attempts, please try again after 15 minutes'
})

app.use('/api/', globalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Connect to DB for Serverless Environments (Vercel)
// This ensures every request has a DB connection before reaching routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB Middleware Error:', err.message);
    next(err);
  }
});

app.use('/api/auth', require('./routes/auth'))

app.use('/api/resources', require('./routes/resources'))
app.use('/api/groups', require('./routes/groups'))
app.use('/api/chat', require('./routes/chat'))
app.use('/api/users', require('./routes/users'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/discussions', require('./routes/discussions'))
app.use('/api/coding', require('./routes/coding'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/tutoring', require('./routes/tutoring'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/payment', require('./routes/payment'))
app.use('/api/projects', require('./routes/projects'))

// Socket Handling
socketHandler(io)
app.set('io', io)

// Error Handler
app.use(errorHandler)

// Environment Logging
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔌 Port: ${process.env.PORT || 5000}`);

// Health check routes
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

app.get('/healthz', (req, res) => res.status(200).send('OK')); // For Render health checks

// Serve Frontend in Production
// We check for both NODE_ENV=production AND the existence of the dist folder
const distPath = path.join(__dirname, '../client/dist');
const fs = require('fs');

if (process.env.NODE_ENV === 'production' || fs.existsSync(distPath)) {
  console.log(`📁 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    // If request is for API, don't serve index.html (let it fall through or 404)
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API Route Not Found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('⚠️ Static files (client/dist) not found. Frontend will not be served.');
}

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB();
    await seedProblems();
  } catch (err) {
    console.error('⚠️ DB Initialization warning:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🏥 Health check: /api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      process.exit(1);
    }
  });
}

// In Vercel (serverless), we don't call server.listen()
// We only call it for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  if (require.main === module) {
    startServer()
  }
}

module.exports = app;

 
 
