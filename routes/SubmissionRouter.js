const router = require('express').Router()
const controller = require('../controllers/SubmissionController')
const middleware = require('../middleware')

// Student routes (must come first - more specific)

// Submit assignment (for students)
router.post(
  '/student/submit/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  controller.SubmitAssignment
)

// Update student's own submission
router.put(
  '/student/update/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  controller.UpdateStudentSubmission
)

// Get student's submission for specific assignment
router.get(
  '/student/assignment/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentSubmission
)

// Get all submissions for current student
router.get(
  '/student/my-submissions',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentSubmissions
)

// General routes

// Get all submissions
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllSubmissions
)

// Get submission by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetSubmissionById
)

// Create submission
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.CreateSubmission
)

// Update submission (grading/feedback)
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateSubmission
)

// Delete submission
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteSubmission
)

module.exports = router