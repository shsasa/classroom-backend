const { Batch } = require('../models')

// Get all batches (with optional filters)
const GetAllBatches = async (req, res) => {
  try {
    const { isActive, search } = req.query
    let filter = {}
    if (typeof isActive !== 'undefined') filter.isActive = isActive
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }
    const batches = await Batch.find(filter).sort({ startDate: -1 })
    res.json(batches)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batches.' })
  }
}

// Get batch by ID
const GetBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }
    res.json(batch)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batch.' })
  }
}

// Create batch
const CreateBatch = async (req, res) => {
  try {
    const { name, description, startDate, endDate, students, supervisors, teachers, courses, isActive, schedule } = req.body
    const batch = await Batch.create({
      name,
      description,
      startDate,
      endDate,
      students,
      supervisors,
      teachers,
      courses,
      isActive,
      schedule
    })
    res.status(201).json(batch)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create batch.' })
  }
}

// Update batch
const UpdateBatch = async (req, res) => {
  try {
    const { name, description, startDate, endDate, students, supervisors, teachers, courses, isActive, schedule } = req.body
    const batch = await Batch.findById(req.params.id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }
    if (name) batch.name = name
    if (description) batch.description = description
    if (startDate) batch.startDate = startDate
    if (endDate) batch.endDate = endDate
    if (students) batch.students = students
    if (supervisors) batch.supervisors = supervisors
    if (teachers) batch.teachers = teachers
    if (courses) batch.courses = courses
    if (typeof isActive !== 'undefined') batch.isActive = isActive
    if (schedule) batch.schedule = schedule
    await batch.save()
    res.json({ status: 'Success', msg: 'Batch updated.', batch })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update batch.' })
  }
}

// Delete batch
const DeleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
    if (!batch) {
      return res.status(404).json({ status: 'Error', msg: 'Batch not found.' })
    }
    await batch.deleteOne()
    res.json({ status: 'Success', msg: 'Batch deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete batch.' })
  }
}

module.exports = {
  GetAllBatches,
  GetBatchById,
  CreateBatch,
  UpdateBatch,
  DeleteBatch
}