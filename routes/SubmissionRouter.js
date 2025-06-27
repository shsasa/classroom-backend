const router = require('express').Router()
const controller = require('../controllers/SubmissionController')
const middleware = require('../middleware')

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