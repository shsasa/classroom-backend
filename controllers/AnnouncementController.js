const { Announcement } = require('../models')

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
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 })
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
    const { title, content, batch, course, attachments, isPinned, isActive } = req.body
    const author = req.user ? req.user._id : null // adjust according to your auth logic
    const announcement = await Announcement.create({
      title,
      content,
      author,
      batch,
      course,
      attachments,
      isPinned,
      isActive
    })
    res.status(201).json(announcement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create announcement.' })
  }
}

// Update announcement
const UpdateAnnouncement = async (req, res) => {
  try {
    const { title, content, batch, course, attachments, isPinned, isActive } = req.body
    const announcement = await Announcement.findById(req.params.id)
    if (!announcement) {
      return res.status(404).json({ status: 'Error', msg: 'Announcement not found.' })
    }
    if (title) announcement.title = title
    if (content) announcement.content = content
    if (batch) announcement.batch = batch
    if (course) announcement.course = course
    if (attachments) announcement.attachments = attachments
    if (typeof isPinned !== 'undefined') announcement.isPinned = isPinned
    if (typeof isActive !== 'undefined') announcement.isActive = isActive
    await announcement.save()
    res.json({ status: 'Success', msg: 'Announcement updated.', announcement })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update announcement.' })
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

module.exports = {
  GetAllAnnouncements,
  GetAnnouncementById,
  CreateAnnouncement,
  UpdateAnnouncement,
  DeleteAnnouncement
}