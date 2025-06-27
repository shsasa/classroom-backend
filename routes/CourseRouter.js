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

module.exports = router