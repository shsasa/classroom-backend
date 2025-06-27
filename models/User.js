const { Schema, model } = require('mongoose')

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordDigest: { type: String },
    profilePicture: { type: String, default: '' },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'supervisor'],
      default: 'student'
    },
    accountStatus: {
      type: String,
      enum: ['pending', 'active'],
      default: 'pending'
    },
    resetToken: { type: String },
    resetTokenExpires: { type: Date }
  },
  { timestamps: true }
)

module.exports = model('User', userSchema)