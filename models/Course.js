const { Schema } = require('mongoose')

const courseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }], batches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }], // optional
    isActive: { type: Boolean, default: true },
    attachments: [{ type: String }] // optional
  },
  { timestamps: true }
)

module.exports = courseSchema