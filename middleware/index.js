const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('./multer.js')

require('dotenv').config()

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const APP_SECRET = process.env.APP_SECRET

if (!APP_SECRET) {
  throw new Error('APP_SECRET is required in environment variables')
}

const hashPassword = async (password) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Valid password is required')
    }

    let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
    throw error
  }
}

const comparePassword = async (password, storedPassword) => {
  try {
    if (!password || !storedPassword) {
      throw new Error('Password and stored password are required')
    }

    let passwordMatch = await bcrypt.compare(password, storedPassword)
    return passwordMatch
  } catch (error) {
    console.error('Error comparing passwords:', error)
    throw error
  }
}

const createToken = (payload) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Valid payload is required')
    }

    let token = jwt.sign(payload, APP_SECRET, {
      expiresIn: '24h',
      issuer: 'classroom-manager'
    })
    return token
  } catch (error) {
    console.error('Error creating token:', error)
    throw error
  }
}

const stripToken = (req, res, next) => {
  console.log('🔍 stripToken middleware called for:', req.method, req.url)
  console.log('📝 Request headers:', req.headers)

  try {
    const authHeader = req.headers['authorization']
    console.log('🔑 Authorization header:', authHeader)

    if (!authHeader) {
      console.log('❌ No authorization header provided')
      return res.status(401).json({
        status: 'Error',
        msg: 'No authorization header provided'
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header must start with Bearer')
      return res.status(401).json({
        status: 'Error',
        msg: 'Authorization header must start with Bearer'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      console.log('❌ No token provided in authorization header')
      return res.status(401).json({
        status: 'Error',
        msg: 'No token provided in authorization header'
      })
    }

    console.log('✅ Token extracted successfully')
    res.locals.token = token
    return next()

  } catch (error) {
    console.error('💥 Error stripping token:', error)
    return res.status(401).json({
      status: 'Error',
      msg: 'Invalid authorization header format'
    })
  }
}

const verifyToken = (req, res, next) => {
  const { token } = res.locals

  if (!token) {
    return res.status(401).json({
      status: 'Error',
      msg: 'No token found'
    })
  }

  try {
    let payload = jwt.verify(token, APP_SECRET)

    if (payload) {
      res.locals.payload = payload
      return next()
    }

    return res.status(401).json({
      status: 'Error',
      msg: 'Invalid token payload'
    })

  } catch (error) {
    console.error('Token verification error:', error)

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'Error',
        msg: 'Token has expired'
      })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'Error',
        msg: 'Invalid token format'
      })
    } else {
      return res.status(401).json({
        status: 'Error',
        msg: 'Token verification failed'
      })
    }
  }
}

const isAdmin = (req, res, next) => {
  const { payload } = res.locals

  if (!payload) {
    return res.status(401).json({
      status: 'Error',
      msg: 'No user payload found'
    })
  }

  if (payload.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    status: 'Error',
    msg: 'Access denied. Admin privileges required.'
  })
}

const hasRole = (...roles) => {
  return (req, res, next) => {
    const { payload } = res.locals

    if (!payload) {
      return res.status(401).json({
        status: 'Error',
        msg: 'No user payload found'
      })
    }

    if (roles.includes(payload.role)) {
      return next()
    }

    return res.status(403).json({
      status: 'Error',
      msg: `Access denied. Required roles: ${roles.join(', ')}`
    })
  }
}

const isOwnerOrAdmin = (req, res, next) => {
  const { payload } = res.locals
  const resourceUserId = req.params.userId || req.body.userId

  if (!payload) {
    return res.status(401).json({
      status: 'Error',
      msg: 'No user payload found'
    })
  }

  if (payload.role === 'admin' || payload.id === resourceUserId) {
    return next()
  }

  return res.status(403).json({
    status: 'Error',
    msg: 'Access denied. You can only access your own resources.'
  })
}

const isAdminOrSupervisor = (req, res, next) => {
  const { payload } = res.locals

  if (!payload) {
    return res.status(401).json({
      status: 'Error',
      msg: 'No user payload found'
    })
  }

  if (payload.role === 'admin' || payload.role === 'supervisor') {
    return next()
  }

  return res.status(403).json({
    status: 'Error',
    msg: 'Access denied. Admin or supervisor privileges required.'
  })
}

const isTeacherOrAbove = (req, res, next) => {
  const { payload } = res.locals

  if (!payload) {
    return res.status(401).json({
      status: 'Error',
      msg: 'No user payload found'
    })
  }

  if (payload.role === 'admin' || payload.role === 'supervisor' || payload.role === 'teacher') {
    return next()
  }

  return res.status(403).json({
    status: 'Error',
    msg: 'Access denied. Teacher privileges or above required.'
  })
}

module.exports = {
  hashPassword,
  comparePassword,
  createToken,
  stripToken,
  verifyToken,
  isAdmin,
  hasRole,
  isOwnerOrAdmin,
  isAdminOrSupervisor,
  isTeacherOrAbove,
  multer
}