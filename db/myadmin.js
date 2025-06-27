const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()

const User = require('../models/User')

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI)

  const existing = await User.findOne({ email: 'admin@admin.com' })
  if (existing) {
    console.log('Admin user already exists.')
    process.exit(0)
  }

  const passwordDigest = await bcrypt.hash('ShsaAdmin123#@!', parseInt(process.env.SALT_ROUNDS) || 10)
  const admin = await User.create({
    name: 'admin',
    email: 'admin@admin.com',
    passwordDigest,
    role: 'admin',
    accountStatus: 'active'
  })
  console.log('Admin user created:', admin)
  process.exit(0)
}

createAdmin().catch(err => {
  console.error(err)
  process.exit(1)
})