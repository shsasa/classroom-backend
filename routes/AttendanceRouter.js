const router = require('express').Router()
const controller = require('../controllers/AttendanceController')
const middleware = require('../middleware')

// Get all attendance records (admin/supervisor/teacher only)
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.GetAllAttendance
)

// Get attendance record by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAttendanceById
)

// Create attendance record (teacher/admin/supervisor only)
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.CreateAttendance
)

// Update attendance record (teacher/admin/supervisor only)
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.UpdateAttendance
)

// Delete attendance record (admin/supervisor only)
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteAttendance
)

// Get attendance for specific batch
router.get(
  '/batch/:batchId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.GetBatchAttendance
)

// Get attendance statistics for batch
router.get(
  '/batch/:batchId/stats',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.GetAttendanceStats
)

// Get student's own attendance history
router.get(
  '/student/my-attendance',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentAttendance
)

module.exports = router