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
    const { User, Batch } = require('../models')

    // Find batches that the student belongs to
    const student = await User.findById(studentId).populate('batches')
    if (!student) {
      return res.status(404).json({ status: 'Error', msg: 'Student not found.' })
    }

    const studentBatchIds = student.batches.map(batch => batch._id)

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
    const { User } = require('../models')

    // Check if student belongs to assignment's batch
    const student = await User.findById(studentId).populate('batches')
    if (!student) {
      return res.status(404).json({ status: 'Error', msg: 'Student not found.' })
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate('batch', 'name')
      .populate('course', 'name')
      .populate('teacher', 'name email')

    if (!assignment) {
      return res.status(404).json({ status: 'Error', msg: 'Assignment not found.' })
    }

    // Check if student is enrolled in the assignment's batch
    const isEnrolled = student.batches.some(batch =>
      batch._id.toString() === assignment.batch._id.toString()
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
  GetTeacherAssignments
}