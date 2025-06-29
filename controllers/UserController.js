const { User } = require('../models')
const PasswordReset = require('../models/PasswordReset')
const emailService = require('../services/emailService')
const crypto = require('crypto')

// Get all users (with optional filters)
const GetAllUsers = async (req, res) => {
  try {
    const currentUser = res.locals.payload
    const { role, status, search } = req.query
    let filter = {}
    if (role) filter.role = role
    if (status) filter.accountStatus = status
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Determine what fields to select based on user role
    let selectFields = '-passwordDigest'
    if (!['admin', 'supervisor'].includes(currentUser.role)) {
      selectFields += ' -resetToken -resetTokenExpires'
    }

    const users = await User.find(filter).select(selectFields)

    // For admin/supervisor, include reset token info
    if (['admin', 'supervisor'].includes(currentUser.role)) {
      const usersWithTokenInfo = users.map(user => ({
        ...user.toObject(),
        hasActiveResetToken: user.resetToken && user.resetTokenExpires && user.resetTokenExpires > new Date(),
        resetTokenExpires: user.resetTokenExpires
      }))
      return res.json(usersWithTokenInfo)
    }

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch users.' })
  }
}

// Get user by ID
const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordDigest -resetToken -resetTokenExpires')
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch user.' })
  }
}

// Update user (admin/supervisor only)
const UpdateUser = async (req, res) => {
  try {
    const { name, role, accountStatus, profilePicture } = req.body
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }
    if (name) user.name = name
    if (role) user.role = role
    if (accountStatus) user.accountStatus = accountStatus
    if (profilePicture) user.profilePicture = profilePicture
    await user.save()
    res.json({ status: 'Success', msg: 'User updated.', user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update user.' })
  }
}

// Delete user (soft delete: set accountStatus to inactive)
const DeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }
    user.accountStatus = 'inactive'
    await user.save()
    res.json({ status: 'Success', msg: 'User deleted (set to inactive).' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete user.' })
  }
}

// Change user role
const ChangeUserRole = async (req, res) => {
  try {
    const { role } = req.body
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }
    user.role = role
    await user.save()
    res.json({ status: 'Success', msg: 'User role updated.', user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to change user role.' })
  }
}

// Change user status
const ChangeUserStatus = async (req, res) => {
  try {
    const { accountStatus } = req.body

    if (!accountStatus) {
      return res.status(400).json({ status: 'Error', msg: 'Account status is required.' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }

    user.accountStatus = accountStatus
    await user.save()

    res.json({ status: 'Success', msg: 'User status updated.', user })
  } catch (error) {
    console.error('Error in ChangeUserStatus:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to change user status.' })
  }
}

// Get user's reset token (admin/supervisor only)
const GetUserResetToken = async (req, res) => {
  try {
    const currentUser = res.locals.payload

    // Only admin or supervisor can get reset tokens
    if (!['admin', 'supervisor'].includes(currentUser.role)) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied.' })
    }

    const user = await User.findById(req.params.id).select('resetToken resetTokenExpires name email')
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }

    // Check if reset token exists and is valid
    if (!user.resetToken || !user.resetTokenExpires || user.resetTokenExpires <= new Date()) {
      return res.status(404).json({
        status: 'Error',
        msg: 'No active reset token found for this user.'
      })
    }

    res.json({
      status: 'Success',
      resetToken: user.resetToken,
      expiresAt: user.resetTokenExpires,
      userName: user.name,
      userEmail: user.email,
      resetLink: `${req.protocol}://${req.get('host')}/reset-password?token=${user.resetToken}`
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch reset token.' })
  }
}

// Create new user (admin/supervisor only)
const CreateUser = async (req, res) => {
  try {
    const { name, email, role, accountStatus, password } = req.body

    console.log('CreateUser request data:', { name, email, role, accountStatus, hasPassword: !!password })

    // Check if user with email already exists
    const existingUser = await User.findOne({ email })

    console.log('Existing user found:', existingUser ? { id: existingUser._id, email: existingUser.email } : null)

    if (existingUser) {
      return res.status(400).json({
        status: 'Error',
        msg: 'User with this email already exists.'
      })
    }

    // Create new user
    const userData = {
      name,
      email,
      role: role || 'student',
      accountStatus: accountStatus || 'active'
    }

    // Add password if provided
    if (password) {
      userData.password = password
    }

    const user = await User.create(userData)

    // Send welcome email
    try {
      await emailService.sendAccountActivationEmail(user)
      console.log(`Welcome email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the user creation if email fails
    }

    // Return user without sensitive data
    const userResponse = user.toObject()
    delete userResponse.passwordDigest
    delete userResponse.resetToken
    delete userResponse.resetTokenExpires

    res.status(201).json({
      status: 'Success',
      msg: 'User created successfully. Welcome email sent.',
      user: userResponse
    })
  } catch (error) {
    console.error('Error in CreateUser:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create user.' })
  }
}

// Request password reset
const RequestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ status: 'Error', msg: 'Email is required.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        status: 'Success',
        msg: 'If the email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Save reset token to database
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    })

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken)
      console.log(`Password reset email sent to ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      return res.status(500).json({
        status: 'Error',
        msg: 'Failed to send password reset email.'
      })
    }

    res.json({
      status: 'Success',
      msg: 'Password reset link has been sent to your email.'
    })
  } catch (error) {
    console.error('Error in RequestPasswordReset:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to process password reset request.' })
  }
}

// Verify password reset token
const VerifyPasswordResetToken = async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ status: 'Error', msg: 'Reset token is required.' })
    }

    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'name email')

    if (!passwordReset) {
      return res.status(400).json({
        status: 'Error',
        msg: 'Invalid or expired reset token.'
      })
    }

    res.json({
      status: 'Success',
      msg: 'Token is valid.',
      user: {
        name: passwordReset.userId.name,
        email: passwordReset.userId.email
      }
    })
  } catch (error) {
    console.error('Error in VerifyPasswordResetToken:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to verify reset token.' })
  }
}

// Reset password with token
const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'Error',
        msg: 'Reset token and new password are required.'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'Error',
        msg: 'Password must be at least 6 characters long.'
      })
    }

    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!passwordReset) {
      return res.status(400).json({
        status: 'Error',
        msg: 'Invalid or expired reset token.'
      })
    }

    // Update user password
    const user = await User.findById(passwordReset.userId)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }

    user.password = newPassword
    await user.save()

    // Mark token as used
    passwordReset.used = true
    await passwordReset.save()

    console.log(`Password reset successful for user: ${user.email}`)

    res.json({
      status: 'Success',
      msg: 'Password has been reset successfully. You can now login with your new password.'
    })
  } catch (error) {
    console.error('Error in ResetPassword:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to reset password.' })
  }
}

module.exports = {
  GetAllUsers,
  GetUserById,
  CreateUser,
  UpdateUser,
  DeleteUser,
  ChangeUserRole,
  ChangeUserStatus,
  GetUserResetToken,
  RequestPasswordReset,
  VerifyPasswordResetToken,
  ResetPassword
}