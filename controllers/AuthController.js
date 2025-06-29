const { User } = require('../models')
const middleware = require('../middleware')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const emailService = require('../services/emailService')

// Add User (by admin or supervisor)
const AddUser = async (req, res) => {
  try {
    const { email, name, role } = req.body
    const currentUser = res.locals.payload

    // Only admin or supervisor can add users
    if (!['admin', 'supervisor'].includes(currentUser.role)) {
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

    // Send email to user with resetToken link for password setup
    try {
      await emailService.sendAccountActivationEmail({
        ...user.toObject(),
        password: null // Indicate password setup required
      })
      console.log(`Account activation email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError)
      // Don't fail user creation if email fails
    }

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
    // res.locals.payload is set by verifyToken middleware
    const payload = res.locals.payload
    if (!payload) {
      return res.status(401).json({ status: 'Error', msg: 'Not authenticated.' })
    }
    res.json({ status: 'Success', user: payload })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Session check failed.' })
  }
}

// Update password (for logged-in user)
const UpdatePassword = async (req, res) => {
  try {
    const userId = res.locals.payload.id
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

// Generate reset token for existing user (by admin or supervisor)
const GenerateResetToken = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUser = res.locals.payload

    // Only admin or supervisor can generate reset tokens
    if (!['admin', 'supervisor'].includes(currentUser.role)) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied.' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    user.resetToken = resetToken
    user.resetTokenExpires = resetTokenExpires
    await user.save()

    // Send email to user with resetToken link for password reset
    try {
      await emailService.sendPasswordResetEmail(user, resetToken)
      console.log(`Password reset email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      return res.status(500).json({
        status: 'Error',
        msg: 'Failed to send reset email. Please try again.'
      })
    }

    res.json({
      status: 'Success',
      msg: 'Reset token generated successfully.',
      resetToken: resetToken,
      expiresAt: resetTokenExpires
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Reset token generation failed.' })
  }
}

// Reset password using token (for existing users)
const ResetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body

    if (!resetToken || !password) {
      return res.status(400).json({ status: 'Error', msg: 'Token and password are required.' })
    }

    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ status: 'Error', msg: 'Invalid or expired token.' })
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
    user.passwordDigest = await bcrypt.hash(password, saltRounds)
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    res.json({ status: 'Success', msg: 'Password has been reset successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Password reset failed.' })
  }
}

// Activate account and set password for first time
const ActivateAccount = async (req, res) => {
  try {
    const { resetToken, password } = req.body

    console.log('Activation attempt with token:', resetToken ? resetToken.substring(0, 8) + '...' : 'No token')

    if (!resetToken || !password) {
      return res.status(400).json({ status: 'Error', msg: 'Activation token and password are required.' })
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: new Date() }
    })

    if (!user) {
      console.log('No user found with token or token expired')
      return res.status(400).json({ status: 'Error', msg: 'Invalid or expired activation token.' })
    }

    console.log('User found for activation:', { id: user.id, email: user.email, status: user.accountStatus })

    // Check if account is already activated
    if (user.accountStatus === 'active') {
      console.log('Account already activated')
      return res.status(409).json({ status: 'Error', msg: 'Account is already activated.' })
    }

    // Hash password and activate account
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
    user.passwordDigest = await bcrypt.hash(password, saltRounds)
    user.accountStatus = 'active' // Activate the account
    user.resetToken = undefined
    user.resetTokenExpires = undefined
    await user.save()

    console.log('Account activated successfully for user:', user.email)

    res.json({
      status: 'Success',
      msg: 'Account activated successfully! You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountStatus: user.accountStatus
      }
    })
  } catch (error) {
    console.error('Error activating account:', error)
    res.status(500).json({ status: 'Error', msg: 'Account activation failed.' })
  }
}

module.exports = {
  Login,
  AddUser,
  SetPassword,
  CheckSession,
  UpdatePassword,
  GenerateResetToken,
  ResetPassword,
  ActivateAccount
}