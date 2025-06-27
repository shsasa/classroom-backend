const { User } = require('../models')
const middleware = require('../middleware')
const crypto = require('crypto')
const bcrypt = require('bcrypt')



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

module.exports = {
  AddUser,
  SetPassword
}
