const router = require('express').Router()
const controller = require('../controllers/BatchController')
const middleware = require('../middleware')

// Get all batches
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetAllBatches
)

// Get batch by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetBatchById
)

// Create batch
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreateBatch
)

// Update batch
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateBatch
)

// Delete batch
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteBatch
)

// Add student to batch
router.post(
  '/:id/students',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.addStudentToBatch
)

// Remove student from batch
router.delete(
  '/:id/students/:studentId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.removeStudentFromBatch
)

module.exports = router