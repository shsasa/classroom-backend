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
    const assignments = await Assignment.find(filter).sort({ dueDate: -1 })
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

module.exports = {
  GetAllAssignments,
  GetAssignmentById,
  CreateAssignment,
  UpdateAssignment,
  DeleteAssignment
}