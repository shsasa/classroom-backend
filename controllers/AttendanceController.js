const { Attendance } = require('../models')

// Get all attendance records (with optional filters)
const GetAllAttendance = async (req, res) => {
  try {
    const { batch, date, period, student } = req.query
    let filter = {}
    if (batch) filter.batch = batch
    if (date) filter.date = new Date(date)
    if (period) filter.period = period
    if (student) filter['records.student'] = student

    const attendanceRecords = await Attendance.find(filter).sort({ date: -1 })
    res.json(attendanceRecords)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch attendance records.' })
  }
}

// Get attendance record by ID
const GetAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
    if (!attendance) {
      return res.status(404).json({ status: 'Error', msg: 'Attendance record not found.' })
    }
    res.json(attendance)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch attendance record.' })
  }
}

// Create attendance record
const CreateAttendance = async (req, res) => {
  try {
    const { batch, date, period, records } = req.body
    const createdBy = req.user ? req.user._id : null // adjust according to your auth logic
    const attendance = await Attendance.create({
      batch,
      date,
      period,
      records,
      createdBy
    })
    res.status(201).json(attendance)
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to create attendance record.' })
  }
}

// Update attendance record
const UpdateAttendance = async (req, res) => {
  try {
    const { batch, date, period, records } = req.body
    const attendance = await Attendance.findById(req.params.id)
    if (!attendance) {
      return res.status(404).json({ status: 'Error', msg: 'Attendance record not found.' })
    }
    if (batch) attendance.batch = batch
    if (date) attendance.date = date
    if (period) attendance.period = period
    if (records) attendance.records = records
    await attendance.save()
    res.json({ status: 'Success', msg: 'Attendance record updated.', attendance })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to update attendance record.' })
  }
}

// Delete attendance record
const DeleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
    if (!attendance) {
      return res.status(404).json({ status: 'Error', msg: 'Attendance record not found.' })
    }
    await attendance.deleteOne()
    res.json({ status: 'Success', msg: 'Attendance record deleted.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'Error', msg: 'Failed to delete attendance record.' })
  }
}
module.exports = {
  GetAllAttendance,
  GetAttendanceById,
  CreateAttendance,
  UpdateAttendance,
  DeleteAttendance
}