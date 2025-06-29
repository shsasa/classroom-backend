const router = require('express').Router()
const controller = require('../controllers/AuthController')
const middleware = require('../middleware')

// User login
router.post('/login', controller.Login)

// Activate account for first time
router.post('/activate-account', controller.ActivateAccount)

// Set new password using reset token
router.post('/set-password', controller.SetPassword)

// Reset password (request reset token)
router.post('/reset-password', controller.ResetPassword)

// Check session
router.get(
  '/session',
  middleware.stripToken,
  middleware.verifyToken,
  controller.CheckSession
)

// Update password for logged-in user
router.put(
  '/update-password',
  middleware.stripToken,
  middleware.verifyToken,
  controller.UpdatePassword
)

// Generate reset token (admin/supervisor only)
router.post(
  '/generate-reset-token/:userId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GenerateResetToken
)

module.exports = router