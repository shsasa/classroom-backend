const { User } = require('../models')

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
    console.log('ChangeUserStatus called with:', {
      userId: req.params.id,
      body: req.body,
      userRole: res.locals.payload?.role
    })

    const { accountStatus } = req.body

    if (!accountStatus) {
      console.log('No accountStatus provided in request body')
      return res.status(400).json({ status: 'Error', msg: 'Account status is required.' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      console.log('User not found:', req.params.id)
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }

    console.log('User found, updating status from', user.accountStatus, 'to', accountStatus)

    user.accountStatus = accountStatus
    await user.save()

    console.log('User status updated successfully')
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

module.exports = {
  GetAllUsers,
  GetUserById,
  UpdateUser,
  DeleteUser,
  ChangeUserRole,
  ChangeUserStatus,
  GetUserResetToken
}