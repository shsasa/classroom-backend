const { Post } = require('../models')

// Get all posts (with optional filters)
const GetAllPosts = async (req, res) => {
  try {
    const { batch, course, search } = req.query
    let filter = {}
    if (batch) filter.batch = batch
    if (course) filter.course = course
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    const posts = await Post.find(filter).sort({ createdAt: -1 })
    res.json(posts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch posts.' })
  }
}

// Get post by ID
const GetPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ status: 'Error', msg: 'Post not found.' })
    }
    res.json(post)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch post.' })
  }
}

// Create post
const CreatePost = async (req, res) => {
  try {
    const { title, content, batch, course, attachments, isPinned, isActive } = req.body
    const author = req.user ? req.user._id : null // adjust according to your auth logic
    const post = await Post.create({
      title,
      content,
      author,
      batch,
      course,
      attachments,
      isPinned,
      isActive
    })
    res.status(201).json(post)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create post.' })
  }
}

// Update post
const UpdatePost = async (req, res) => {
  try {
    const { title, content, batch, course, attachments, isPinned, isActive } = req.body
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ status: 'Error', msg: 'Post not found.' })
    }
    if (title) post.title = title
    if (content) post.content = content
    if (batch) post.batch = batch
    if (course) post.course = course
    if (attachments) post.attachments = attachments
    if (typeof isPinned !== 'undefined') post.isPinned = isPinned
    if (typeof isActive !== 'undefined') post.isActive = isActive
    await post.save()
    res.json({ status: 'Success', msg: 'Post updated.', post })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update post.' })
  }
}

// Delete post
const DeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ status: 'Error', msg: 'Post not found.' })
    }
    await post.deleteOne()
    res.json({ status: 'Success', msg: 'Post deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete post.' })
  }
}

module.exports = {
  GetAllPosts,
  GetPostById,
  CreatePost,
  UpdatePost,
  DeletePost
}