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

// Get courses for current student (courses from student's batches)
const GetStudentCourses = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const userRole = res.locals.payload.role

    // Only students can access this endpoint
    if (userRole !== 'student') {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. Students only.' })
    }

    // Find batches that the student is enrolled in
    const { Batch } = require('../models')
    const studentBatches = await Batch.find({
      students: studentId,
      isActive: true
    }).select('courses')

    // Extract course IDs from batches
    const courseIds = []
    studentBatches.forEach(batch => {
      batch.courses.forEach(courseId => {
        if (!courseIds.includes(courseId.toString())) {
          courseIds.push(courseId)
        }
      })
    })

    // Get the actual courses
    const courses = await Course.find({
      _id: { $in: courseIds },
      isActive: true
    })
      .populate('teachers', 'name email')
      .select('name description teachers createdAt')
      .sort({ name: 1 })

    res.json(courses)
  } catch (error) {
    console.error('Error fetching student courses:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch student courses.' })
  }
}

// Get specific course details for student
const GetStudentCourseDetails = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const userRole = res.locals.payload.role
    const courseId = req.params.id

    // Only students can access this endpoint
    if (userRole !== 'student') {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. Students only.' })
    }

    // Check if student has access to this course through their batches
    const { Batch } = require('../models')
    const studentBatches = await Batch.find({
      students: studentId,
      courses: courseId,
      isActive: true
    })

    if (studentBatches.length === 0) {
      return res.status(404).json({ status: 'Error', msg: 'Course not found or you are not enrolled in any batch with this course.' })
    }

    const course = await Course.findOne({
      _id: courseId,
      isActive: true
    })
      .populate('teachers', 'name email')

    if (!course) {
      return res.status(404).json({ status: 'Error', msg: 'Course not found.' })
    }

    // Add batch information
    const courseWithBatches = {
      ...course.toObject(),
      enrolledBatches: studentBatches.map(batch => ({
        _id: batch._id,
        name: batch.name
      }))
    }

    res.json(courseWithBatches)
  } catch (error) {
    console.error('Error fetching student course details:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch course details.' })
  }
}

module.exports = {
  GetAllCourses,
  GetCourseById,
  CreateCourse,
  UpdateCourse,
  DeleteCourse,
  GetStudentCourses,
  GetStudentCourseDetails
}