const { Schema } = require('mongoose')

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' }, // optional
    course: { type: Schema.Types.ObjectId, ref: 'Course' }, // optional
    attachments: [{ type: String }], // file paths or URLs
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

module.exports = announcementSchema