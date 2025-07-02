const router = require('express').Router()
const controller = require('../controllers/AssignmentController')
const middleware = require('../middleware')

// Get assignments for current student (must come before /:id)
router.get(
  '/student/my-assignments',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentAssignments
)

// Get specific assignment details for student (must come before /:id)
router.get(
  '/student/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentAssignmentDetails
)

// Get assignment with submission status for student
router.get(
  '/student/:id/submission-status',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentAssignmentWithSubmission
)

// Get assignments for current teacher (must come before /:id)
router.get(
  '/teacher/my-assignments',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetTeacherAssignments
)

// Get all assignments
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllAssignments
)

// Get assignment by ID (must come after specific routes)
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAssignmentById
)

// Create assignment
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreateAssignment
)

// Update assignment
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateAssignment
)

// Delete assignment
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteAssignment
)

module.exports = router