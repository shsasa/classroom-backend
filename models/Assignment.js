const { Schema, model } = require('mongoose')

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    attachments: [{ type: String }], // file paths or URLs
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

module.exports = model('Assignment', assignmentSchema)