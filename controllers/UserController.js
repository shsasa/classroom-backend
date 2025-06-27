const { User } = require('../models')

// Get all users (with optional filters)
const GetAllUsers = async (req, res) => {
  try {
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
    const users = await User.find(filter).select('-passwordDigest -resetToken -resetTokenExpires')
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
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ status: 'Error', msg: 'User not found.' })
    }
    user.accountStatus = accountStatus
    await user.save()
    res.json({ status: 'Success', msg: 'User status updated.', user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to change user status.' })
  }
}

module.exports = {
  GetAllUsers,
  GetUserById,
  UpdateUser,
  DeleteUser,
  ChangeUserRole,
  ChangeUserStatus
}