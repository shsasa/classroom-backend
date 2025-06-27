const { Schema, model } = require('mongoose')

const submissionSchema = new Schema(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedAt: { type: Date, default: Date.now },
    content: { type: String, trim: true },
    attachments: [{ type: String }], // file paths or URLs
    grade: { type: Number }, // optional: grade/score
    feedback: { type: String, trim: true }, // optional: teacher feedback
    isLate: { type: Boolean, default: false }
  },
  { timestamps: true }
)

module.exports = model('Submission', submissionSchema)