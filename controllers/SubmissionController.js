const { Submission } = require('../models')

// Get all submissions (with optional filters)
const GetAllSubmissions = async (req, res) => {
  try {
    const { assignment, student, isLate } = req.query
    let filter = {}
    if (assignment) filter.assignment = assignment
    if (student) filter.student = student
    if (typeof isLate !== 'undefined') filter.isLate = isLate

    const submissions = await Submission.find(filter).sort({ submittedAt: -1 })
    res.json(submissions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch submissions.' })
  }
}

// Get submission by ID
const GetSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
    if (!submission) {
      return res.status(404).json({ status: 'Error', msg: 'Submission not found.' })
    }
    res.json(submission)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch submission.' })
  }
}

// Create submission
const CreateSubmission = async (req, res) => {
  try {
    const { assignment, student, content, attachments, grade, feedback, isLate } = req.body
    const submission = await Submission.create({
      assignment,
      student,
      content,
      attachments,
      grade,
      feedback,
      isLate
    })
    res.status(201).json(submission)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create submission.' })
  }
}

// Update submission (for grading/feedback)
const UpdateSubmission = async (req, res) => {
  try {
    const { content, attachments, grade, feedback, isLate } = req.body
    const submission = await Submission.findById(req.params.id)
    if (!submission) {
      return res.status(404).json({ status: 'Error', msg: 'Submission not found.' })
    }
    if (content) submission.content = content
    if (attachments) submission.attachments = attachments
    if (typeof grade !== 'undefined') submission.grade = grade
    if (typeof feedback !== 'undefined') submission.feedback = feedback
    if (typeof isLate !== 'undefined') submission.isLate = isLate
    await submission.save()
    res.json({ status: 'Success', msg: 'Submission updated.', submission })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update submission.' })
  }
}

// Delete submission
const DeleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
    if (!submission) {
      return res.status(404).json({ status: 'Error', msg: 'Submission not found.' })
    }
    await submission.deleteOne()
    res.json({ status: 'Success', msg: 'Submission deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete submission.' })
  }
}

// Submit assignment (for students)
const SubmitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { content, attachments } = req.body
    const studentId = res.locals.payload.id
    const { Assignment, Batch } = require('../models')

    // Check if assignment exists and student has access
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }

    // Check if student is enrolled in assignment's batch
    const batch = await Batch.findById(assignment.batch)
    if (!batch || !batch.students.includes(studentId)) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. You are not enrolled in this assignment\'s batch.' })
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    })

    if (existingSubmission) {
      return res.status(400).json({ status: 'Error', msg: 'You have already submitted this assignment. Use update instead.' })
    }

    // Check if assignment is still active and not overdue
    if (!assignment.isActive) {
      return res.status(400).json({ status: 'Error', msg: 'This assignment is no longer active.' })
    }

    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    const isLate = now > dueDate

    // Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      content,
      attachments: attachments || [],
      isLate,
      submittedAt: now
    })

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignment', 'title dueDate')
      .populate('student', 'name email')

    res.status(201).json({
      status: 'Success',
      msg: isLate ? 'Assignment submitted late.' : 'Assignment submitted successfully.',
      submission: populatedSubmission
    })
  } catch (error) {
    console.error('Error submitting assignment:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to submit assignment.' })
  }
}

// Update student's own submission
const UpdateStudentSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { content, attachments } = req.body
    const studentId = res.locals.payload.id
    const { Assignment } = require('../models')

    // Find the submission
    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    })

    if (!submission) {
      return res.status(404).json({ status: 'Error', msg: 'No submission found for this assignment.' })
    }

    // Check if assignment is still active
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment || !assignment.isActive) {
      return res.status(400).json({ status: 'Error', msg: 'Cannot update submission for inactive assignment.' })
    }

    // Update submission
    if (content !== undefined) submission.content = content
    if (attachments !== undefined) submission.attachments = attachments

    // Update isLate status
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    submission.isLate = now > dueDate

    await submission.save()

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignment', 'title dueDate')
      .populate('student', 'name email')

    res.json({
      status: 'Success',
      msg: 'Submission updated successfully.',
      submission: populatedSubmission
    })
  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update submission.' })
  }
}

// Get student's submission for specific assignment
const GetStudentSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const studentId = res.locals.payload.id

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    })
      .populate('assignment', 'title dueDate')
      .populate('student', 'name email')

    if (!submission) {
      return res.status(404).json({ status: 'Error', msg: 'No submission found for this assignment.' })
    }

    res.json(submission)
  } catch (error) {
    console.error('Error fetching student submission:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch submission.' })
  }
}

// Get all submissions for current student
const GetStudentSubmissions = async (req, res) => {
  try {
    const studentId = res.locals.payload.id

    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title dueDate batch course')
      .populate({
        path: 'assignment',
        populate: [
          { path: 'batch', select: 'name' },
          { path: 'course', select: 'name' }
        ]
      })
      .sort({ submittedAt: -1 })

    res.json(submissions)
  } catch (error) {
    console.error('Error fetching student submissions:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch submissions.' })
  }
}

module.exports = {
  GetAllSubmissions,
  GetSubmissionById,
  CreateSubmission,
  UpdateSubmission,
  DeleteSubmission,
  SubmitAssignment,
  UpdateStudentSubmission,
  GetStudentSubmission,
  GetStudentSubmissions
}