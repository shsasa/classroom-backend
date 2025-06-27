const router = require('express').Router()
const controller = require('../controllers/AuthController')
const middleware = require('../middleware')

router.post('/login', controller.Login)
router.post(
  '/add-user',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.AddUser
)
router.post('/set-password', controller.SetPassword)
router.post('/reset-password', controller.ResetPassword)
router.post('/activate-account', controller.ActivateAccount)
router.post(
  '/generate-reset-token/:userId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.GenerateResetToken
)
router.get(
  '/session',
  middleware.stripToken,
  middleware.verifyToken,
  controller.CheckSession
)
router.put(
  '/update-password',
  middleware.stripToken,
  middleware.verifyToken,
  controller.UpdatePassword
)

module.exports = router