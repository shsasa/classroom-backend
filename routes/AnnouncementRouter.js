const router = require('express').Router()
const controller = require('../controllers/AnnouncementController')
const middleware = require('../middleware')

// Get all announcements
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllAnnouncements
)

// Get announcement by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAnnouncementById
)

// Create announcement
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreateAnnouncement
)

// Update announcement
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdateAnnouncement
)

// Delete announcement
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteAnnouncement
)



module.exports = router