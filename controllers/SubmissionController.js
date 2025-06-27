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


module.exports = {
  GetAllSubmissions,
  GetSubmissionById,
  CreateSubmission,
  UpdateSubmission,
  DeleteSubmission
}