const { Attendance, Batch, User } = require('../models')

// Get all attendance records (with optional filters)
const GetAllAttendance = async (req, res) => {
  try {
    const { batch, date, period, student } = req.query
    let filter = {}
    if (batch) filter.batch = batch
    if (date) filter.date = new Date(date)
    if (period) filter.period = period
    if (student) filter['records.student'] = student

    const attendanceRecords = await Attendance.find(filter)
      .populate('batch', 'name')
      .populate('records.student', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
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
      .populate('batch', 'name')
      .populate('records.student', 'name email')
      .populate('createdBy', 'name email')
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
    const createdBy = res.locals.payload.id

    const attendance = await Attendance.create({
      batch,
      date,
      period,
      records,
      createdBy
    })

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('batch', 'name')
      .populate('records.student', 'name email')
      .populate('createdBy', 'name email')

    res.status(201).json({
      status: 'Success',
      msg: 'Attendance record created successfully.',
      attendance: populatedAttendance
    })
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

    const updatedAttendance = await Attendance.findById(attendance._id)
      .populate('batch', 'name')
      .populate('records.student', 'name email')
      .populate('createdBy', 'name email')

    res.json({
      status: 'Success',
      msg: 'Attendance record updated.',
      attendance: updatedAttendance
    })
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

// Get attendance for specific batch and date
const GetBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params
    const { date } = req.query

    const filter = { batch: batchId }
    if (date) {
      const selectedDate = new Date(date)
      filter.date = {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
      }
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('batch', 'name')
      .populate('records.student', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1, period: 1 })

    res.json(attendanceRecords)
  } catch (error) {
    console.error('Error fetching batch attendance:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch batch attendance.' })
  }
}

// Get student's attendance history
const GetStudentAttendance = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const { batchId, startDate, endDate } = req.query

    let filter = { 'records.student': studentId }
    if (batchId) filter.batch = batchId

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('batch', 'name')
      .populate('records.student', 'name email')
      .sort({ date: -1 })

    // Filter records to only show current student's attendance
    const studentRecords = attendanceRecords.map(record => ({
      ...record.toObject(),
      records: record.records.filter(r => r.student._id.toString() === studentId)
    })).filter(record => record.records.length > 0)

    res.json(studentRecords)
  } catch (error) {
    console.error('Error fetching student attendance:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch attendance history.' })
  }
}

// Get attendance statistics for batch
const GetAttendanceStats = async (req, res) => {
  try {
    const { batchId } = req.params
    const { startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate)
    }

    const filter = { batch: batchId }
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('records.student', 'name')

    // Calculate statistics
    const stats = {
      totalSessions: attendanceRecords.length,
      totalStudents: 0,
      attendanceByStudent: {},
      attendanceByDate: {},
      overallStats: {
        present: 0,
        absent: 0,
        late: 0,
        leftEarly: 0
      }
    }

    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0]
      if (!stats.attendanceByDate[dateKey]) {
        stats.attendanceByDate[dateKey] = {
          present: 0,
          absent: 0,
          late: 0,
          leftEarly: 0
        }
      }

      record.records.forEach(studentRecord => {
        const studentId = studentRecord.student._id.toString()
        const studentName = studentRecord.student.name

        if (!stats.attendanceByStudent[studentId]) {
          stats.attendanceByStudent[studentId] = {
            name: studentName,
            present: 0,
            absent: 0,
            late: 0,
            leftEarly: 0,
            total: 0
          }
        }

        stats.attendanceByStudent[studentId][studentRecord.status.replace('_', '')]++
        stats.attendanceByStudent[studentId].total++
        stats.attendanceByDate[dateKey][studentRecord.status.replace('_', '')]++
        stats.overallStats[studentRecord.status.replace('_', '')]++
      })
    })

    stats.totalStudents = Object.keys(stats.attendanceByStudent).length
    res.json(stats)
  } catch (error) {
    console.error('Error fetching attendance stats:', error)
    res.status(500).json({ status: 'Error', msg: 'Failed to fetch attendance statistics.' })
  }
}

module.exports = {
  GetAllAttendance,
  GetAttendanceById,
  CreateAttendance,
  UpdateAttendance,
  DeleteAttendance,
  GetBatchAttendance,
  GetStudentAttendance,
  GetAttendanceStats
}