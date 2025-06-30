const { Schema, model } = require('mongoose')

const fileSchema = new Schema({
  filename: String,
  originalName: String,
  path: String,
  mimetype: String,
  size: Number
}, { _id: false })

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' }, // optional
    course: { type: Schema.Types.ObjectId, ref: 'Course' }, // optional
    attachments: [Schema.Types.Mixed], // Support both file objects and URL strings for backward compatibility
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

module.exports = model('Announcement', announcementSchema)