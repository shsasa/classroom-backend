const { Course } = require('../models')

// Get all courses (with optional filters)
const GetAllCourses = async (req, res) => {
  try {
    const { isActive, search, teacher, batch } = req.query
    let filter = {}
    if (typeof isActive !== 'undefined') filter.isActive = isActive
    if (teacher) filter.teachers = teacher
    if (batch) filter.batches = batch
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }
    const courses = await Course.find(filter)
      .populate('teachers', 'name email')
      .populate('batches', 'name')
      .sort({ name: 1 })
    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch courses.' })
  }
}

// Get course by ID
const GetCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teachers', 'name email')
      .populate('batches', 'name')
    if (!course) {
      return res.status(404).json({ status: 'Error', msg: 'Course not found.' })
    }
    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch course.' })
  }
}

// Create course
const CreateCourse = async (req, res) => {
  try {
    const { name, description, teachers, batches, isActive, attachments } = req.body
    const course = await Course.create({
      name,
      description,
      teachers,
      batches,
      isActive,
      attachments
    })
    res.status(201).json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create course.' })
  }
}

// Update course
const UpdateCourse = async (req, res) => {
  try {
    const { name, description, teachers, batches, isActive, attachments } = req.body
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ status: 'Error', msg: 'Course not found.' })
    }
    if (name) course.name = name
    if (description) course.description = description
    if (teachers) course.teachers = teachers
    if (batches) course.batches = batches
    if (typeof isActive !== 'undefined') course.isActive = isActive
    if (attachments) course.attachments = attachments
    await course.save()
    res.json({ status: 'Success', msg: 'Course updated.', course })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update course.' })
  }
}

// Delete course
const DeleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ status: 'Error', msg: 'Course not found.' })
    }
    await course.deleteOne()
    res.json({ status: 'Success', msg: 'Course deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete course.' })
  }
}

module.exports = {
  GetAllCourses,
  GetCourseById,
  CreateCourse,
  UpdateCourse,
  DeleteCourse
}