const { Schema, model } = require('mongoose')

const batchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // Batch name (e.g. "Batch 2025", "Summer 2024")
    description: { type: String, trim: true, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    supervisors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // General teachers for the batch
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    isActive: { type: Boolean, default: true },
    schedule: [{
      day: { type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
      startTime: { type: String }, // e.g. "09:00"
      endTime: { type: String },   // e.g. "10:30"
      room: { type: String, trim: true }
    }]
  },
  { timestamps: true }
)

module.exports = model('Batch', batchSchema)