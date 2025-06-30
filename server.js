const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const AuthRouter = require('./routes/AuthRouter')
const PostRouter = require('./routes/PostRouter')
const UserRouter = require('./routes/UserRouter')
const AnnouncementRouter = require('./routes/AnnouncementRouter')
const AssignmentRouter = require('./routes/AssignmentRouter')
const AttendanceRouter = require('./routes/AttendanceRouter')
const BatchRouter = require('./routes/BatchRouter')
const CourseRouter = require('./routes/CourseRouter')
const SubmissionRouter = require('./routes/SubmissionRouter')

const PORT = process.env.PORT || 3000

const db = require('./db')
const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

// Additional CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Serve static files (uploads from public/uploads directory)
app.use('/uploads', (req, res, next) => {
  // Add CORS headers for file access
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(path.join(__dirname, 'public', 'uploads')))

// Additional static file serving for debugging
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use('/auth', AuthRouter)
app.use('/posts', PostRouter)
app.use('/users', UserRouter)
app.use('/announcements', AnnouncementRouter)
app.use('/assignments', AssignmentRouter)
app.use('/attendance', AttendanceRouter)
app.use('/batches', BatchRouter)
app.use('/courses', CourseRouter)
app.use('/submissions', SubmissionRouter)

// Main route
app.get('/', (req, res) => {
  res.json({
    message: 'Classroom Manager API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      posts: '/posts',
      announcements: '/announcements',
      assignments: '/assignments',
      attendance: '/attendance',
      batches: '/batches',
      courses: '/courses',
      submissions: '/submissions'
    }
  })
})

// Debug route for uploads
app.get('/debug/uploads', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, 'public', 'uploads')
    const files = fs.readdirSync(uploadsPath)

    const fileList = files.map(file => {
      const filePath = path.join(uploadsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime,
        url: `/uploads/${encodeURIComponent(file)}`
      }
    })

    res.json({
      uploadsDirectory: uploadsPath,
      totalFiles: files.length,
      files: fileList
    })
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read uploads directory',
      details: error.message
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  })
})

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  })
})

app.listen(PORT, () => {
  console.log(`Running Express server on Port ${PORT} . . .`)
})