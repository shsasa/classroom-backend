const router = require('express').Router()
const controller = require('../controllers/AssignmentController')
const middleware = require('../middleware')

// Get all assignments
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllAssignments
)

// Get assignment by ID
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