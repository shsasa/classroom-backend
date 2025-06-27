const router = require('express').Router()
const controller = require('../controllers/UserController')
const middleware = require('../middleware')

// Get all users (with optional filters)
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetAllUsers
)

// Get user by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetUserById
)

// Get user's reset token
router.get(
  '/:id/reset-token',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GetUserResetToken
)

// Update user
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateUser
)

// Delete user (soft delete)
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteUser
)

// Change user role
router.patch(
  '/:id/role',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.ChangeUserRole
)

// Change user status
router.patch(
  '/:id/status',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.ChangeUserStatus
)

module.exports = router