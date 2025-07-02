const router = require('express').Router()
const controller = require('../controllers/BatchController')
const middleware = require('../middleware')

// Get batches for current teacher (must come before general routes)
router.get(
  '/teacher/my-batches',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetTeacherBatches
)

// Get batches for current student (must come before general routes)
router.get(
  '/student/my-batches',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentBatches
)

// Get specific batch details for student (must come before /:id)
router.get(
  '/student/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentBatchDetails
)

// Get specific batch details for teacher (must come before /:id)
router.get(
  '/teacher/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetTeacherBatchDetails
)

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

// Add multiple students to batch
router.post(
  '/:id/students',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.AddStudentsToBatch
)

// Remove student from batch
router.delete(
  '/:id/students/:studentId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.RemoveStudentFromBatch
)

// Add teacher to batch
router.post(
  '/:id/teachers/:teacherId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.AddTeacherToBatch
)

// Add multiple teachers to batch
router.post(
  '/:id/teachers',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.AddTeachersToBatch
)

// Remove teacher from batch
router.delete(
  '/:id/teachers/:teacherId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.RemoveTeacherFromBatch
)

// Add multiple courses to batch
router.post(
  '/:id/courses',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.AddCoursesToBatch
)

// Remove course from batch
router.delete(
  '/:id/courses/:courseId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.RemoveCourseFromBatch
)

// Get assignments for batch
router.get(
  '/:id/assignments',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetBatchAssignments
)

// Create assignment for batch
router.post(
  '/:id/assignments',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.CreateBatchAssignment
)

module.exports = router