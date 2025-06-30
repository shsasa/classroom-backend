const router = require('express').Router()
const controller = require('../controllers/AnnouncementController')
const middleware = require('../middleware')
const upload = require('../middleware/multer')

// Get filter data (batches and courses) - no auth required for basic data
router.get(
  '/filter-data',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetFilterData
)

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
  upload.array('attachments', 5), // Allow up to 5 files
  controller.CreateAnnouncement
)

// Update announcement
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  upload.array('attachments', 5), // Allow up to 5 files
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