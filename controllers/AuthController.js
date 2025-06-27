const { User } = require('../models')
const middleware = require('../middleware')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Add User (by admin or supervisor)
const AddUser = async (req, res) => {
  try {
    const { email, name, role } = req.body

    // Only admin or supervisor can add users
    if (!['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied.' })
    }

    let existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .json({ status: 'Error', msg: 'A user with that email already exists.' })
    }

    // Generate reset token for password setup
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const user = await User.create({
      name,
      email,
      role: role || 'student',
      accountStatus: 'pending',
      resetToken,
      resetTokenExpires
    })

    // TODO: Send email to user with resetToken link for password setup

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountStatus: user.accountStatus
    }
    res.status(201).json(userData)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'User creation failed.' })
  }
}

// Set password using reset token
const SetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body

    if (!resetToken || !password) {
      return res.status(400).json({ status: 'Error', msg: 'Token and password are required.' })
    }

    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: new Date() },
      accountStatus: 'pending'
    })

    if (!user) {
      return res.status(400).json({ status: 'Error', msg: 'Invalid or expired token.' })
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
    user.passwordDigest = await bcrypt.hash(password, saltRounds)
    user.accountStatus = 'active'
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    res.json({ status: 'Success', msg: 'Password has been set. You can now log in.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Password setup failed.' })
  }
}

// Login
const Login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({ status: 'Error', msg: 'Invalid credentials or inactive account.' })
    }
    const validPassword = await bcrypt.compare(password, user.passwordDigest)
    if (!validPassword) {
      return res.status(401).json({ status: 'Error', msg: 'Invalid credentials.' })
    }
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    }
    const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '24h' })
    res.json({ status: 'Success', token, user: payload })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Login failed.' })
  }
}

// Check session
const CheckSession = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    if (!req.user) {
      return res.status(401).json({ status: 'Error', msg: 'Not authenticated.' })
    }
    res.json({ status: 'Success', user: req.user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Session check failed.' })
  }
}

// Update password (for logged-in user)
const UpdatePassword = async (req, res) => {
  try {
    const userId = req.user.id
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }
    const validPassword = await bcrypt.compare(oldPassword, user.passwordDigest)
    if (!validPassword) {
      return res.status(400).json({ status: 'Error', msg: 'Old password is incorrect.' })
    }
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
    user.passwordDigest = await bcrypt.hash(newPassword, saltRounds)
    await user.save()
    res.json({ status: 'Success', msg: 'Password updated successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Password update failed.' })
  }
}

module.exports = {
  Login,
  AddUser,
  SetPassword,
  CheckSession,
  UpdatePassword
}