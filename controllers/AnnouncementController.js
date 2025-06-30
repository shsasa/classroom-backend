const { Announcement, Batch, Course } = require('../models')

// Get all announcements (with optional filters)
const GetAllAnnouncements = async (req, res) => {
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
    const announcements = await Announcement.find(filter)
      .populate('author', 'name email')
      .populate('batch', 'name')
      .populate('course', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
    res.json(announcements)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch announcements.' })
  }
}

// Get announcement by ID
const GetAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name email')
      .populate('batch', 'name')
      .populate('course', 'name')
    if (!announcement) {
      return res.status(404).json({ status: 'Error', msg: 'Announcement not found.' })
    }
    res.json(announcement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch announcement.' })
  }
}

// Create announcement
const CreateAnnouncement = async (req, res) => {
  try {
    console.log('📝 Creating announcement with data:', req.body)
    console.log('� Files uploaded:', req.files)
    console.log('�👤 User payload:', res.locals.payload)

    const { title, content, batch, course, isPinned, isActive } = req.body
    const author = res.locals.payload.id // User ID from auth middleware

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ status: 'Error', msg: 'Title and content are required.' })
    }

    // Process uploaded files
    let attachments = []
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }))
      console.log('📎 Files processed:', attachments.length)
    }

    // Parse boolean values from FormData (they come as strings)
    const parsedIsPinned = isPinned === 'true' || isPinned === true
    const parsedIsActive = isActive !== 'false' && isActive !== false

    // Parse batch and course (handle empty strings)
    const parsedBatch = batch && batch.trim() && batch.trim() !== 'null' ? batch.trim() : null
    const parsedCourse = course && course.trim() && course.trim() !== 'null' ? course.trim() : null

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      author,
      batch: parsedBatch,
      course: parsedCourse,
      attachments,
      isPinned: parsedIsPinned,
      isActive: parsedIsActive
    })

    console.log('✅ Announcement created successfully:', announcement._id)
    res.status(201).json(announcement)
  } catch (error) {
    console.error('❌ Error creating announcement:', error)
    console.error('Error details:', error.message)
    res.status(500).json({
      status: 'Error',
      msg: 'Failed to create announcement.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

// Update announcement
const UpdateAnnouncement = async (req, res) => {
  try {
    console.log('✏️ Updating announcement ID:', req.params.id)
    console.log('📝 Update data:', req.body)
    console.log('� Files uploaded:', req.files)
    console.log('�👤 User payload:', res.locals.payload)

    const { title, content, batch, course, isPinned, isActive, existingAttachments } = req.body
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      console.log('❌ Announcement not found:', req.params.id)
      return res.status(404).json({ status: 'Error', msg: 'Announcement not found.' })
    }

    console.log('📄 Current announcement:', announcement.title)

    // Process uploaded files
    let newAttachments = []
    if (req.files && req.files.length > 0) {
      newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }))
    }

    // Combine existing attachments with new ones
    let allAttachments = []
    if (existingAttachments) {
      try {
        const existing = JSON.parse(existingAttachments)
        allAttachments = Array.isArray(existing) ? existing : []
      } catch (e) {
        console.log('Warning: Could not parse existingAttachments')
        allAttachments = []
      }
    }
    allAttachments = [...allAttachments, ...newAttachments]

    // Parse boolean values from FormData (they come as strings)
    const parsedIsPinned = isPinned === 'true' || isPinned === true
    const parsedIsActive = isActive !== 'false' && isActive !== false

    // Parse batch and course (handle empty strings)
    const parsedBatch = batch && batch.trim() && batch.trim() !== 'null' ? batch.trim() : null
    const parsedCourse = course && course.trim() && course.trim() !== 'null' ? course.trim() : null

    console.log('🔧 Parsed values:', {
      isPinned: parsedIsPinned,
      isActive: parsedIsActive,
      batch: parsedBatch,
      course: parsedCourse
    })

    // Update fields
    announcement.title = title.trim()
    announcement.content = content.trim()
    announcement.batch = parsedBatch
    announcement.course = parsedCourse
    announcement.attachments = allAttachments
    announcement.isPinned = parsedIsPinned
    announcement.isActive = parsedIsActive

    await announcement.save()
    console.log('✅ Announcement updated successfully')
    res.json({ status: 'Success', msg: 'Announcement updated.', announcement })
  } catch (error) {
    console.error('❌ Error updating announcement:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      status: 'Error',
      msg: 'Failed to update announcement.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
}

// Delete announcement
const DeleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
    if (!announcement) {
      return res.status(404).json({ status: 'Error', msg: 'Announcement not found.' })
    }
    await announcement.deleteOne()
    res.json({ status: 'Success', msg: 'Announcement deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete announcement.' })
  }
}

// Get basic data for filters (batches and courses)
const GetFilterData = async (req, res) => {
  try {
    const [batches, courses] = await Promise.all([
      Batch.find({ isActive: true }).select('name').sort({ name: 1 }),
      Course.find({ isActive: true }).select('name').sort({ name: 1 })
    ])

    res.json({
      batches,
      courses
    })
  } catch (error) {
    console.error('Error fetching filter data:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch filter data.' })
  }
}

module.exports = {
  GetFilterData,
  GetAllAnnouncements,
  GetAnnouncementById,
  CreateAnnouncement,
  UpdateAnnouncement,
  DeleteAnnouncement
}