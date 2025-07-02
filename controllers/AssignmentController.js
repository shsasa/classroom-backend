const { Assignment } = require('../models')

// Get all assignments (with optional filters)
const GetAllAssignments = async (req, res) => {
  try {
    const { batch, course, teacher, search } = req.query
    let filter = {}
    if (batch) filter.batch = batch
    if (course) filter.course = course
    if (teacher) filter.teacher = teacher
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    const assignments = await Assignment.find(filter)
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')
      .sort({ dueDate: -1 })
    res.json(assignments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignments.' })
  }
}

// Get assignment by ID
const GetAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')
    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }
    res.json(assignment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignment.' })
  }
}

// Create assignment
const CreateAssignment = async (req, res) => {
  try {
    const { title, description, batch, course, teacher, dueDate, attachments, isActive } = req.body
    const assignment = await Assignment.create({
      title,
      description,
      batch,
      course,
      teacher,
      dueDate,
      attachments,
      isActive
    })
    res.status(201).json(assignment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create assignment.' })
  }
}

// Update assignment
const UpdateAssignment = async (req, res) => {
  try {
    const { title, description, batch, course, teacher, dueDate, attachments, isActive } = req.body
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }
    if (title) assignment.title = title
    if (description) assignment.description = description
    if (batch) assignment.batch = batch
    if (course) assignment.course = course
    if (teacher) assignment.teacher = teacher
    if (dueDate) assignment.dueDate = dueDate
    if (attachments) assignment.attachments = attachments
    if (typeof isActive !== 'undefined') assignment.isActive = isActive
    await assignment.save()
    res.json({ status: 'Success', msg: 'Assignment updated.', assignment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update assignment.' })
  }
}

// Delete assignment
const DeleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }
    await assignment.deleteOne()
    res.json({ status: 'Success', msg: 'Assignment deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete assignment.' })
  }
}

// Get assignments for current student
const GetStudentAssignments = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const { Batch } = require('../models')

    // Find batches that include this student
    const studentBatches = await Batch.find({
      students: studentId,
      isActive: true
    })

    if (!studentBatches || studentBatches.length === 0) {
      return res.json([]) // Return empty array if student is not in any batch
    }

    const studentBatchIds = studentBatches.map(batch => batch._id)

    // Find assignments for student's batches
    const assignments = await Assignment.find({
      batch: { $in: studentBatchIds },
      isActive: true
    })
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')
      .sort({ dueDate: -1 })

    res.json(assignments)
  } catch (error) {
    console.error('Error fetching student assignments:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignments.' })
  }
}

// Get assignment details for student
const GetStudentAssignmentDetails = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const assignmentId = req.params.id
    const { Batch } = require('../models')

    const assignment = await Assignment.findById(assignmentId)
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')

    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }

    // Check if student is enrolled in the assignment's batch
    const batch = await Batch.findById(assignment.batch._id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    const isEnrolled = batch.students.some(student =>
      student.toString() === studentId
    )

    if (!isEnrolled) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. You are not enrolled in this assignment\'s batch.' })
    }

    res.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment details:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignment details.' })
  }
}

// Get assignment details for student with submission status
const GetStudentAssignmentWithSubmission = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const assignmentId = req.params.id
    const { Batch, Submission } = require('../models')

    const assignment = await Assignment.findById(assignmentId)
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')

    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }

    // Check if student is enrolled in the assignment's batch
    const batch = await Batch.findById(assignment.batch._id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    const isEnrolled = batch.students.some(student =>
      student.toString() === studentId
    )

    if (!isEnrolled) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. You are not enrolled in this assignment\'s batch.' })
    }

    // Check for existing submission
    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    })

    const response = {
      assignment,
      submission: submission || null,
      hasSubmitted: !!submission,
      canSubmit: assignment.isActive && new Date() <= new Date(assignment.dueDate),
      isOverdue: new Date() > new Date(assignment.dueDate)
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching assignment with submission:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignment details.' })
  }
}

// Get assignments for teacher's courses
const GetTeacherAssignments = async (req, res) => {
  try {
    const teacherId = res.locals.payload.id

    // Find assignments where teacher is the creator
    const assignments = await Assignment.find({ teacher: teacherId })
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')
      .sort({ dueDate: -1 })

    res.json(assignments)
  } catch (error) {
    console.error('Error fetching teacher assignments:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignments.' })
  }
}

module.exports = {
  GetAllAssignments,
  GetAssignmentById,
  CreateAssignment,
  UpdateAssignment,
  DeleteAssignment,
  GetStudentAssignments,
  GetStudentAssignmentDetails,
  GetStudentAssignmentWithSubmission,
  GetTeacherAssignments
}