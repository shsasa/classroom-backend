const { Schema, model } = require('mongoose')

const attendanceSchema = new Schema(
  {
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }, // The batch for this attendance record
    date: { type: Date, required: true }, // The date of attendance
    period: { type: String, trim: true }, // Period name or code (e.g. "First", "Second", "Math", etc.)
    records: [
      {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'left_early'],
          required: true
        },
        checkInTime: { type: String },   // e.g. "09:05"
        checkOutTime: { type: String },  // e.g. "11:30"
        notes: { type: String, trim: true }
      }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

module.exports = model('Attendance', attendanceSchema)