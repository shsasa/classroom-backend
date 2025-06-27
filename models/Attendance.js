const { Schema } = require('mongoose')

const attendanceSchema = new Schema(
  {
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }, // The batch for this attendance record
    date: { type: Date, required: true }, // The date of attendance
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
    period: { type: String, trim: true }, // Optional: period name or code
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

module.exports = attendanceSchema