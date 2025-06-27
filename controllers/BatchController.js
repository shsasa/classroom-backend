const { Batch } = require('../models')

// Get all batches
const GetAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate('course').populate('students')
    res.status(200).json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    res.status(500).json({ message: 'Error fetching batches', error: error.message })
  }
}

// Get batch by ID
const GetBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course')
      .populate('students')

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' })
    }

    res.status(200).json(batch)
  } catch (error) {
    console.error('Error fetching batch:', error)
    res.status(500).json({ message: 'Error fetching batch', error: error.message })
  }
}

// Create new batch
const CreateBatch = async (req, res) => {
  try {
    const batch = new Batch(req.body)
    await batch.save()
    res.status(201).json(batch)
  } catch (error) {
    console.error('Error creating batch:', error)
    res.status(500).json({ message: 'Error creating batch', error: error.message })
  }
}

// Update batch
const UpdateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' })
    }

    res.status(200).json(batch)
  } catch (error) {
    console.error('Error updating batch:', error)
    res.status(500).json({ message: 'Error updating batch', error: error.message })
  }
}

// Delete batch
const DeleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id)

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' })
    }

    res.status(200).json({ message: 'Batch deleted successfully' })
  } catch (error) {
    console.error('Error deleting batch:', error)
    res.status(500).json({ message: 'Error deleting batch', error: error.message })
  }
}

// Add student to batch
const addStudentToBatch = async (req, res) => {
  try {
    const { studentId } = req.body
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' })
    }

    if (!batch.students.includes(studentId)) {
      batch.students.push(studentId)
      await batch.save()
    }

    res.status(200).json(batch)
  } catch (error) {
    console.error('Error adding student to batch:', error)
    res.status(500).json({ message: 'Error adding student to batch', error: error.message })
  }
}

// Remove student from batch
const removeStudentFromBatch = async (req, res) => {
  try {
    const { studentId } = req.params
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' })
    }

    batch.students = batch.students.filter(id => id.toString() !== studentId)
    await batch.save()

    res.status(200).json(batch)
  } catch (error) {
    console.error('Error removing student from batch:', error)
    res.status(500).json({ message: 'Error removing student from batch', error: error.message })
  }
}

module.exports = {
  GetAllBatches,
  GetBatchById,
  CreateBatch,
  UpdateBatch,
  DeleteBatch,
  addStudentToBatch,
  removeStudentFromBatch
}
