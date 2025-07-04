const router = require('express').Router()
const controller = require('../controllers/PostController')
const middleware = require('../middleware')

// Get all posts
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllPosts
)

// Get post by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetPostById
)

// Create post
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.CreatePost
)

// Update post
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.UpdatePost
)

// Delete post
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeletePost
)

module.exports = router