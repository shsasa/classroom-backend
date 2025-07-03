const { Batch, User, Course } = require('../models')
const { Assignment } = require('../models')

// Get all batches
const GetAllBatches = async (req, res) => {
  try {
    const { status, search } = req.query
    let filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const batches = await Batch.find(filter)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')
      .sort({ createdAt: -1 })

    res.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batches.' })
  }
}

// Get batch by ID
const GetBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name description')

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    res.json(batch)
  } catch (error) {
    console.error('Error fetching batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batch.' })
  }
}

// Create batch
const CreateBatch = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, students, teachers, courses } = req.body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        status: 'Error',
        msg: 'Name, start date, and end date are required.'
      })
    }

    // Check if batch name already exists
    const existingBatch = await Batch.findOne({ name })
    if (existingBatch) {
      return res.status(400).json({
        status: 'Error',
        msg: 'A batch with this name already exists.'
      })
    }

    const batch = await Batch.create({
      name,
      description,
      startDate,
      endDate,
      status: status || 'upcoming',
      students: students || [],
      teachers: teachers || [],
      courses: courses || []
    })

    // Populate the created batch before sending response
    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.status(201).json(populatedBatch)
  } catch (error) {
    console.error('Error creating batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create batch.' })
  }
}

// Update batch
const UpdateBatch = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, students, teachers, courses, schedule } = req.body

    const batch = await Batch.findById(req.params.id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Check if new name conflicts with existing batch (excluding current batch)
    if (name && name !== batch.name) {
      const existingBatch = await Batch.findOne({ name, _id: { $ne: req.params.id } })
      if (existingBatch) {
        return res.status(400).json({
          status: 'Error',
          msg: 'A batch with this name already exists.'
        })
      }
    }

    // Update fields
    if (name) batch.name = name
    if (description !== undefined) batch.description = description
    if (startDate) batch.startDate = startDate
    if (endDate) batch.endDate = endDate
    if (status) batch.status = status
    if (students !== undefined) batch.students = students
    if (teachers !== undefined) batch.teachers = teachers
    if (courses !== undefined) batch.courses = courses
    if (schedule !== undefined) batch.schedule = schedule

    await batch.save()

    // Populate the updated batch before sending response
    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error updating batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update batch.' })
  }
}

// Delete batch
const DeleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    await batch.deleteOne()
    res.json({ status: 'Success', msg: 'Batch deleted successfully.' })
  } catch (error) {
    console.error('Error deleting batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete batch.' })
  }
}

// Add student to batch
const AddStudentToBatch = async (req, res) => {
  try {
    const { studentId } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Check if student exists
    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return res.status(400).json({ status: 'Error', msg: 'Invalid student ID.' })
    }

    // Check if student is already in the batch
    if (batch.students.includes(studentId)) {
      return res.status(400).json({ status: 'Error', msg: 'Student is already in this batch.' })
    }

    batch.students.push(studentId)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error adding student to batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to add student to batch.' })
  }
}

// Add multiple students to batch
const AddStudentsToBatch = async (req, res) => {
  try {
    const { studentIds } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ status: 'Error', msg: 'Student IDs array is required.' })
    }

    // Validate all student IDs
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    })

    if (students.length !== studentIds.length) {
      return res.status(400).json({ status: 'Error', msg: 'One or more invalid student IDs.' })
    }

    // Filter out students already in the batch
    const newStudentIds = studentIds.filter(id => !batch.students.includes(id))

    if (newStudentIds.length === 0) {
      return res.status(400).json({ status: 'Error', msg: 'All selected students are already in this batch.' })
    }

    // Add new students to the batch
    batch.students.push(...newStudentIds)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json({
      status: 'Success',
      msg: `${newStudentIds.length} student(s) added successfully.`,
      batch: populatedBatch
    })
  } catch (error) {
    console.error('Error adding students to batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to add students to batch.' })
  }
}

// Remove student from batch
const RemoveStudentFromBatch = async (req, res) => {
  try {
    const { studentId } = req.params
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Remove student from batch
    batch.students = batch.students.filter(id => id.toString() !== studentId)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error removing student from batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to remove student from batch.' })
  }
}

// Add teacher to batch
const AddTeacherToBatch = async (req, res) => {
  try {
    const { teacherId } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ status: 'Error', msg: 'Invalid teacher ID.' })
    }

    // Check if teacher is already in the batch
    if (batch.teachers.includes(teacherId)) {
      return res.status(400).json({ status: 'Error', msg: 'Teacher is already assigned to this batch.' })
    }

    batch.teachers.push(teacherId)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error adding teacher to batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to add teacher to batch.' })
  }
}

// Add multiple teachers to batch
const AddTeachersToBatch = async (req, res) => {
  try {
    const { teacherIds } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res.status(400).json({ status: 'Error', msg: 'Teacher IDs array is required.' })
    }

    // Validate all teacher IDs
    const teachers = await User.find({
      _id: { $in: teacherIds },
      role: 'teacher'
    })

    if (teachers.length !== teacherIds.length) {
      return res.status(400).json({ status: 'Error', msg: 'One or more invalid teacher IDs.' })
    }

    // Filter out teachers already in the batch
    const newTeacherIds = teacherIds.filter(id => !batch.teachers.includes(id))

    if (newTeacherIds.length === 0) {
      return res.status(400).json({ status: 'Error', msg: 'All selected teachers are already in this batch.' })
    }

    // Add new teachers to the batch
    batch.teachers.push(...newTeacherIds)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json({
      status: 'Success',
      msg: `${newTeacherIds.length} teacher(s) added successfully.`,
      batch: populatedBatch
    })
  } catch (error) {
    console.error('Error adding teachers to batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to add teachers to batch.' })
  }
}

// Remove teacher from batch
const RemoveTeacherFromBatch = async (req, res) => {
  try {
    const { teacherId } = req.params
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Remove teacher from batch
    batch.teachers = batch.teachers.filter(id => id.toString() !== teacherId)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error removing teacher from batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to remove teacher from batch.' })
  }
}

// Add course to batch
const AddCourseToBatch = async (req, res) => {
  try {
    const { courseId } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ status: 'Error', msg: 'Course not found.' })
    }

    // Check if course is already in batch
    if (batch.courses.includes(courseId)) {
      return res.status(400).json({ status: 'Error', msg: 'Course is already assigned to this batch.' })
    }

    batch.courses.push(courseId)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name description')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error adding course to batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to add course to batch.' })
  }
}

// Add multiple courses to batch
const AddCoursesToBatch = async (req, res) => {
  try {
    const { courseIds } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ status: 'Error', msg: 'Course IDs array is required.' })
    }

    // Validate all course IDs
    const courses = await Course.find({
      _id: { $in: courseIds }
    })

    if (courses.length !== courseIds.length) {
      return res.status(400).json({ status: 'Error', msg: 'One or more invalid course IDs.' })
    }

    // Filter out courses already in the batch
    const newCourseIds = courseIds.filter(id => !batch.courses.includes(id))

    if (newCourseIds.length === 0) {
      return res.status(400).json({ status: 'Error', msg: 'All selected courses are already assigned to this batch.' })
    }

    // Add new courses to the batch
    batch.courses.push(...newCourseIds)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name description')

    res.json({
      status: 'Success',
      msg: `${newCourseIds.length} course(s) added successfully.`,
      batch: populatedBatch
    })
  } catch (error) {
    console.error('Error adding courses to batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to add courses to batch.' })
  }
}

// Remove course from batch
const RemoveCourseFromBatch = async (req, res) => {
  try {
    const { courseId } = req.params
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Remove course from batch
    batch.courses = batch.courses.filter(id => id.toString() !== courseId)
    await batch.save()

    const populatedBatch = await Batch.findById(batch._id)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('courses', 'name description')

    res.json(populatedBatch)
  } catch (error) {
    console.error('Error removing course from batch:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to remove course from batch.' })
  }
}

// Get assignments for a specific batch
const GetBatchAssignments = async (req, res) => {
  try {
    const batchId = req.params.id
    const { courseId } = req.query

    let filter = { batch: batchId }
    if (courseId) {
      filter.course = courseId
    }

    const assignments = await Assignment.find(filter)
      .populate('course', 'name')
      .populate('teacher', 'name email')
      .sort({ dueDate: 1 })

    res.json(assignments)
  } catch (error) {
    console.error('Error fetching batch assignments:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch assignments.' })
  }
}

// Create assignment for batch
const CreateBatchAssignment = async (req, res) => {
  try {
    const batchId = req.params.id
    const { title, description, courseId, teacherId, dueDate, attachments } = req.body

    // Verify batch exists
    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Verify course is part of the batch
    if (!batch.courses.includes(courseId)) {
      return res.status(400).json({ status: 'Error', msg: 'Course is not part of this batch.' })
    }

    // Verify teacher is part of the batch
    if (!batch.teachers.includes(teacherId)) {
      return res.status(400).json({ status: 'Error', msg: 'Teacher is not assigned to this batch.' })
    }

    const assignment = await Assignment.create({
      title,
      description,
      batch: batchId,
      course: courseId,
      teacher: teacherId,
      dueDate,
      attachments: attachments || []
    })

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'name')
      .populate('teacher', 'name email')

    res.status(201).json({
      status: 'Success',
      msg: 'Assignment created successfully.',
      assignment: populatedAssignment
    })
  } catch (error) {
    console.error('Error creating batch assignment:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create assignment.' })
  }
}

// Get batches for current student
const GetStudentBatches = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const userRole = res.locals.payload.role

    // Only students can access this endpoint
    if (userRole !== 'student') {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. Students only.' })
    }

    const batches = await Batch.find({
      students: studentId,
      isActive: true
    })
      .populate('teachers', 'name email')
      .populate('courses', 'name description')
      .select('name description startDate endDate schedule')
      .sort({ startDate: -1 })

    res.json(batches)
  } catch (error) {
    console.error('Error fetching student batches:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch student batches.' })
  }
}

// Get specific batch details for student
const GetStudentBatchDetails = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const userRole = res.locals.payload.role
    const batchId = req.params.id

    // Only students can access this endpoint
    if (userRole !== 'student') {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. Students only.' })
    }

    const batch = await Batch.findOne({
      _id: batchId,
      students: studentId,
      isActive: true
    })
      .populate('teachers', 'name email')
      .populate('courses', 'name description')
      .populate('students', 'name email')

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found or you are not enrolled in this batch.' })
    }

    res.json(batch)
  } catch (error) {
    console.error('Error fetching student batch details:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batch details.' })
  }
}

// Get batches for current teacher
const GetTeacherBatches = async (req, res) => {
  try {
    const teacherId = res.locals.payload.id
    const { status, search } = req.query

    let filter = {
      $or: [
        { teachers: teacherId }, // Teacher assigned to batch
        { supervisors: teacherId } // Teacher is supervisor of batch
      ]
    }

    if (status && status !== 'all') {
      filter.status = status
    }

    if (search) {
      filter.$and = [
        filter,
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }

    // Also include batches where teacher teaches courses in the batch
    const teacherCourses = await Course.find({ teachers: teacherId })
    const teacherCourseIds = teacherCourses.map(course => course._id)

    if (teacherCourseIds.length > 0) {
      filter = {
        $or: [
          ...filter.$or,
          { courses: { $in: teacherCourseIds } } // Batches containing teacher's courses
        ]
      }
    }

    const batches = await Batch.find(filter)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('supervisors', 'name email')
      .populate('courses', 'name description')
      .sort({ createdAt: -1 })

    res.json(batches)
  } catch (error) {
    console.error('Error fetching teacher batches:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch teacher batches.' })
  }
}

// Get batch details for teacher (if teacher has access to it)
const GetTeacherBatchDetails = async (req, res) => {
  try {
    const teacherId = res.locals.payload.id
    const batchId = req.params.id

    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate('students', 'name email')
      .populate('teachers', 'name email')
      .populate('supervisors', 'name email')
      .populate('courses', 'name description')

    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }

    // Check if teacher has access to this batch
    let hasAccess =
      batch.teachers.some(teacher => teacher._id.toString() === teacherId) ||
      batch.supervisors.some(supervisor => supervisor._id.toString() === teacherId)

    // Also check if teacher teaches any courses in this batch
    if (!hasAccess) {
      const teacherCourses = await Course.find({ teachers: teacherId })
      const teacherCourseIds = teacherCourses.map(course => course._id.toString())
      const batchCourseIds = batch.courses.map(course => course._id.toString())

      const courseAccessCheck = teacherCourseIds.some(courseId => batchCourseIds.includes(courseId))
      hasAccess = courseAccessCheck
    }

    if (!hasAccess) {
      return res.status(403).json({ status: 'Error', msg: 'Access denied. You do not have permission to view this batch.' })
    }

    res.json(batch)
  } catch (error) {
    console.error('Error fetching teacher batch details:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batch details.' })
  }
}

module.exports = {
  GetAllBatches,
  GetBatchById,
  CreateBatch,
  UpdateBatch,
  DeleteBatch,
  AddStudentToBatch,
  AddStudentsToBatch,
  RemoveStudentFromBatch,
  AddTeacherToBatch,
  AddTeachersToBatch,
  RemoveTeacherFromBatch,
  AddCourseToBatch,
  AddCoursesToBatch,
  RemoveCourseFromBatch,
  GetBatchAssignments,
  CreateBatchAssignment,
  GetStudentBatches,
  GetStudentBatchDetails,
  GetTeacherBatches,
  GetTeacherBatchDetails
}
