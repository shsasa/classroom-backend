const router = require('express').Router()
const controller = require('../controllers/CourseController')
const middleware = require('../middleware')

// Get all courses
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllCourses
)

// Get course by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetCourseById
)

// Create course
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreateCourse
)

// Update course
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateCourse
)

// Delete course
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteCourse
)

// Get courses for current student
router.get(
  '/student/my-courses',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentCourses
)

// Get specific course details for student
router.get(
  '/student/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentCourseDetails
)

// Get courses for current teacher
router.get(
  '/teacher/my-courses',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetTeacherCourses
)

// Get specific course details for teacher
router.get(
  '/teacher/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetTeacherCourseDetails
)

module.exports = router