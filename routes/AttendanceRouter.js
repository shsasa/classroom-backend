const router = require('express').Router()
const controller = require('../controllers/AttendanceController')
const middleware = require('../middleware')

// Get all attendance records
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllAttendance
)

// Get attendance record by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAttendanceById
)

// Create attendance record
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreateAttendance
)

// Update attendance record
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateAttendance
)

// Delete attendance record
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteAttendance
)

module.exports = router