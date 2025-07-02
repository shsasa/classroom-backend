const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()

// Import models
const User = require('./models/User')
const Course = require('./models/Course')
const Batch = require('./models/Batch')
const Announcement = require('./models/Announcement')
const Assignment = require('./models/Assignment')
const Submission = require('./models/Submission')
const Attendance = require('./models/Attendance')
const Post = require('./models/Post')

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🟢 Connected to MongoDB')
  } catch (error) {
    console.error('❌ Database connection error:', error)
    process.exit(1)
  }
}

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Helper function to get random array element
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)]

// Helper function to get random date in the past/future
const getRandomDate = (daysFromNow = 0, range = 30) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * range) - range / 2)
  return date
}

// Clear existing data
async function clearDatabase() {
  console.log('🧹 Clearing existing data...')
  await User.deleteMany({})
  await Course.deleteMany({})
  await Batch.deleteMany({})
  await Announcement.deleteMany({})
  await Assignment.deleteMany({})
  await Submission.deleteMany({})
  await Attendance.deleteMany({})
  await Post.deleteMany({})
  console.log('✅ Database cleared')
}

// Seed Users
async function seedUsers() {
  console.log('👥 Creating users...')

  const users = [
    // Admins
    {
      name: 'Ahmed Mohamed (Admin)',
      email: 'admin@school.com',
      passwordDigest: await hashPassword('admin123'),
      role: 'admin',
      accountStatus: 'active'
    },
    {
      name: 'Fatima Ali (Admin)',
      email: 'fatima.admin@school.com',
      passwordDigest: await hashPassword('admin123'),
      role: 'admin',
      accountStatus: 'active'
    },

    // Supervisors
    {
      name: 'Mohamed Salem (Supervisor)',
      email: 'supervisor@school.com',
      passwordDigest: await hashPassword('super123'),
      role: 'supervisor',
      accountStatus: 'active'
    },
    {
      name: 'Nora Hassan (Supervisor)',
      email: 'nora.supervisor@school.com',
      passwordDigest: await hashPassword('super123'),
      role: 'supervisor',
      accountStatus: 'active'
    },

    // Teachers
    {
      name: 'Dr. Khaled Ahmed (Math Teacher)',
      email: 'khaled.math@school.com',
      passwordDigest: await hashPassword('teacher123'),
      role: 'teacher',
      accountStatus: 'active'
    },
    {
      name: 'Sarah Mohamed (Science Teacher)',
      email: 'sara.science@school.com',
      passwordDigest: await hashPassword('teacher123'),
      role: 'teacher',
      accountStatus: 'active'
    },
    {
      name: 'Youssef Ali (Physics Teacher)',
      email: 'youssef.physics@school.com',
      passwordDigest: await hashPassword('teacher123'),
      role: 'teacher',
      accountStatus: 'active'
    },
    {
      name: 'Dr. Mariam Khaled (Chemistry Teacher)',
      email: 'mariam.chemistry@school.com',
      passwordDigest: await hashPassword('teacher123'),
      role: 'teacher',
      accountStatus: 'active'
    },
    {
      name: 'Abdullah Hassan (English Teacher)',
      email: 'abdullah.english@school.com',
      passwordDigest: await hashPassword('teacher123'),
      role: 'teacher',
      accountStatus: 'active'
    },

    // Students
    {
      name: 'Ali Mohamed (Student)',
      email: 'ali.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Zainab Ahmed (Student)',
      email: 'zainab.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Hussam Khaled (Student)',
      email: 'hussam.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Noor Salem (Student)',
      email: 'noor.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Kareem Abdullah (Student)',
      email: 'kareem.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Layla Hassan (Student)',
      email: 'layla.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Omar Youssef (Student)',
      email: 'omar.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Hind Ali (Student)',
      email: 'hind.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Saad Mohamed (Student)',
      email: 'saad.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },
    {
      name: 'Amna Khaled (Student)',
      email: 'amna.student@school.com',
      passwordDigest: await hashPassword('student123'),
      role: 'student',
      accountStatus: 'active'
    },

    // Pending users
    {
      name: 'New Student (Pending Activation)',
      email: 'pending.student@school.com',
      role: 'student',
      accountStatus: 'pending'
    },
    {
      name: 'New Teacher (Pending Activation)',
      email: 'pending.teacher@school.com',
      role: 'teacher',
      accountStatus: 'pending'
    }
  ]

  const createdUsers = await User.insertMany(users)
  console.log(`✅ Created ${createdUsers.length} users`)
  return createdUsers
}

// Seed Courses
async function seedCourses(users) {
  console.log('📚 Creating courses...')

  const teachers = users.filter(u => u.role === 'teacher')

  const courses = [
    {
      name: 'Advanced Mathematics',
      description: 'High school mathematics course covering algebra, geometry, calculus, and statistics',
      teachers: [teachers[0]._id], // Dr. Khaled Ahmed
      isActive: true,
      attachments: ['math_syllabus.pdf', 'calculator_guide.pdf', 'formula_sheet.pdf']
    },
    {
      name: 'General Science',
      description: 'Natural sciences course including biology, chemistry, and physics fundamentals',
      teachers: [teachers[1]._id], // Sarah Mohamed
      isActive: true,
      attachments: ['science_lab_rules.pdf', 'periodic_table.pdf']
    },
    {
      name: 'Applied Physics',
      description: 'Physics study with practical applications and laboratory experiments',
      teachers: [teachers[2]._id], // Youssef Ali
      isActive: true,
      attachments: ['physics_experiments.pdf', 'lab_safety.pdf', 'physics_formulas.pdf']
    },
    {
      name: 'Organic Chemistry',
      description: 'Study of organic compounds, chemical reactions, and laboratory techniques',
      teachers: [teachers[3]._id], // Dr. Mariam Khaled
      isActive: true,
      attachments: ['chemistry_formulas.pdf', 'lab_procedures.pdf']
    },
    {
      name: 'English Language',
      description: 'English language learning - reading, writing, grammar, and conversation',
      teachers: [teachers[4]._id], // Abdullah Hassan
      isActive: true,
      attachments: ['english_grammar.pdf', 'vocabulary_list.pdf', 'writing_guide.pdf']
    },
    {
      name: 'Computer Programming',
      description: 'Introduction to programming using Python, JavaScript, and web development',
      teachers: [teachers[0]._id, teachers[1]._id], // Dr. Khaled + Sarah (multiple teachers)
      isActive: true,
      attachments: ['python_basics.pdf', 'javascript_guide.pdf', 'coding_exercises.zip', 'project_templates.zip']
    },
    {
      name: 'Database Systems',
      description: 'Database design, SQL, and data management principles',
      teachers: [teachers[0]._id], // Dr. Khaled Ahmed (additional course for him)
      isActive: true,
      attachments: ['sql_reference.pdf', 'database_design.pdf']
    }
  ]

  const createdCourses = await Course.insertMany(courses)
  console.log(`✅ Created ${createdCourses.length} courses`)

  // Log teacher-course relationships
  console.log('🔗 Teacher-Course Relationships:')
  createdCourses.forEach((course, index) => {
    const teacherNames = course.teachers.map(teacherId => {
      const teacher = teachers.find(t => t._id.toString() === teacherId.toString())
      return teacher ? teacher.name : 'Unknown'
    })
    console.log(`   ${course.name}: ${teacherNames.join(', ')}`)
  })

  return createdCourses
}

// Seed Batches
async function seedBatches(users, courses) {
  console.log('🎓 Creating batches...')

  const students = users.filter(u => u.role === 'student')
  const teachers = users.filter(u => u.role === 'teacher')
  const supervisors = users.filter(u => u.role === 'supervisor')

  // Important: We'll specifically assign Dr. Khaled Ahmed (teachers[0]) to ensure test access
  const batches = [
    {
      name: 'Math & Science Batch 2025',
      description: 'Advanced Mathematics and Science courses for high school students',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      students: students.slice(0, 6).map(s => s._id), // First 6 students
      supervisors: [supervisors[0]._id], // Mohamed Salem
      teachers: [teachers[0]._id, teachers[1]._id], // Dr. Khaled (Math) + Sarah (Science)
      courses: [courses[0]._id, courses[1]._id], // Math + Science courses
      isActive: true,
      schedule: [
        {
          day: 'Sunday',
          startTime: '09:00',
          endTime: '11:00',
          room: 'Room A1'
        },
        {
          day: 'Tuesday',
          startTime: '10:00',
          endTime: '12:00',
          room: 'Room A1'
        },
        {
          day: 'Thursday',
          startTime: '09:00',
          endTime: '11:00',
          room: 'Room A2'
        }
      ]
    },
    {
      name: 'Physics & Chemistry Batch 2025',
      description: 'Physics and Chemistry intensive course',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-07-31'),
      students: students.slice(4, 10).map(s => s._id), // Students 4-9
      supervisors: [supervisors[1]._id], // Nora Hassan
      teachers: [teachers[2]._id, teachers[3]._id], // Youssef (Physics) + Mariam (Chemistry)
      courses: [courses[2]._id, courses[3]._id], // Physics + Chemistry courses
      isActive: true,
      schedule: [
        {
          day: 'Monday',
          startTime: '14:00',
          endTime: '16:00',
          room: 'Room B1'
        },
        {
          day: 'Wednesday',
          startTime: '14:00',
          endTime: '16:00',
          room: 'Room B1'
        },
        {
          day: 'Friday',
          startTime: '09:00',
          endTime: '11:00',
          room: 'Room B2'
        }
      ]
    },
    {
      name: 'Advanced Programming Batch 2025',
      description: 'Intensive programming and development course with multiple teachers',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-08-31'),
      students: students.slice(0, 8).map(s => s._id), // First 8 students
      supervisors: supervisors.map(s => s._id), // Both supervisors
      teachers: [teachers[0]._id, teachers[1]._id, teachers[4]._id], // Dr. Khaled + Sarah + Abdullah
      courses: [courses[5]._id, courses[4]._id], // Programming + English courses
      isActive: true,
      schedule: [
        {
          day: 'Saturday',
          startTime: '09:00',
          endTime: '12:00',
          room: 'Computer Lab'
        },
        {
          day: 'Sunday',
          startTime: '14:00',
          endTime: '17:00',
          room: 'Computer Lab'
        }
      ]
    },
    {
      name: 'English Language Intensive 2025',
      description: 'Focused English language improvement course',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-15'),
      students: students.slice(2, 8).map(s => s._id), // Students 2-7
      supervisors: [supervisors[0]._id],
      teachers: [teachers[4]._id], // Abdullah (English Teacher)
      courses: [courses[4]._id], // English course
      isActive: true,
      schedule: [
        {
          day: 'Tuesday',
          startTime: '14:00',
          endTime: '16:00',
          room: 'Room C1'
        },
        {
          day: 'Thursday',
          startTime: '14:00',
          endTime: '16:00',
          room: 'Room C1'
        }
      ]
    }
  ]

  const createdBatches = await Batch.insertMany(batches)
  console.log(`✅ Created ${createdBatches.length} batches`)

  // Log the relationships for debugging
  console.log('🔗 Batch-Teacher Relationships:')
  createdBatches.forEach((batch, index) => {
    console.log(`   ${batch.name}:`)
    console.log(`     Teachers: ${batch.teachers.length} assigned`)
    console.log(`     Students: ${batch.students.length} enrolled`)
    console.log(`     Courses: ${batch.courses.length} attached`)
  })

  return createdBatches
}

// Seed Announcements
async function seedAnnouncements(users, batches, courses) {
  console.log('📢 Creating announcements...')

  const admins = users.filter(u => u.role === 'admin')
  const supervisors = users.filter(u => u.role === 'supervisor')
  const teachers = users.filter(u => u.role === 'teacher')

  const announcements = [
    {
      title: 'Important Announcement: New Academic Year',
      content: 'We announce to all students the beginning of the new academic year. Please arrive on time and follow the academic schedule.',
      author: admins[0]._id,
      isPinned: true,
      isActive: true,
      attachments: ['academic_calendar.pdf', 'student_handbook.pdf']
    },
    {
      title: 'Upcoming Math Test',
      content: 'The Advanced Mathematics test will be held next Tuesday at 9 AM. Please prepare and review chapters 1-5.',
      author: teachers[0]._id,
      batch: batches[0]._id,
      course: courses[0]._id,
      isPinned: false,
      isActive: true,
      attachments: ['math_test_outline.pdf']
    },
    {
      title: 'Science Lab Workshop',
      content: 'A practical workshop will be held in the science lab on Thursday. Attendance is mandatory for all General Science course students.',
      author: teachers[1]._id,
      batch: batches[0]._id,
      course: courses[1]._id,
      isPinned: false,
      isActive: true,
      attachments: ['lab_requirements.pdf']
    },
    {
      title: 'Schedule Change',
      content: 'The Physics lecture has been moved from Sunday to Monday at the same time. Please update your personal schedules.',
      author: supervisors[0]._id,
      batch: batches[1]._id,
      course: courses[2]._id,
      isPinned: false,
      isActive: true
    },
    {
      title: 'Final Programming Project',
      content: 'All Advanced Programming batch students must start preparing their final projects. Deadline is at the end of the month.',
      author: teachers[0]._id,
      batch: batches[2]._id,
      course: courses[5]._id,
      isPinned: true,
      isActive: true,
      attachments: ['project_guidelines.pdf', 'project_examples.zip']
    },
    {
      title: 'Eid Holiday',
      content: 'There will be an official holiday for Eid Al-Fitr from date... to date... Eid Mubarak to everyone.',
      author: admins[1]._id,
      isPinned: true,
      isActive: true
    }
  ]

  const createdAnnouncements = await Announcement.insertMany(announcements)
  console.log(`✅ Created ${createdAnnouncements.length} announcements`)
  return createdAnnouncements
}

// Seed Assignments
async function seedAssignments(users, batches, courses) {
  console.log('📝 Creating assignments...')

  const teachers = users.filter(u => u.role === 'teacher')

  const assignments = [
    {
      title: 'Math Assignment - Differential Equations',
      description: 'Solve problems from Chapter 4: First and second-order differential equations',
      batch: batches[0]._id,
      course: courses[0]._id,
      teacher: teachers[0]._id,
      dueDate: getRandomDate(7, 5), // Within a week approximately
      isActive: true,
      attachments: ['assignment1_questions.pdf', 'formula_sheet.pdf']
    },
    {
      title: 'Lab Report - Density Experiment',
      description: 'Write a detailed report on the density measurement experiment we conducted in the lab',
      batch: batches[0]._id,
      course: courses[1]._id,
      teacher: teachers[1]._id,
      dueDate: getRandomDate(10, 3),
      isActive: true,
      attachments: ['lab_report_template.docx', 'experiment_data.xlsx']
    },
    {
      title: 'Physics Project - Harmonic Motion',
      description: 'Prepare a presentation on simple harmonic motion with practical examples',
      batch: batches[1]._id,
      course: courses[2]._id,
      teacher: teachers[2]._id,
      dueDate: getRandomDate(14, 5),
      isActive: true,
      attachments: ['presentation_guidelines.pdf']
    },
    {
      title: 'Organic Chemistry Experiments',
      description: 'Conduct 3 lab experiments and write a comprehensive report on results and observations',
      batch: batches[1]._id,
      course: courses[3]._id,
      teacher: teachers[3]._id,
      dueDate: getRandomDate(12, 4),
      isActive: true,
      attachments: ['chemistry_experiments.pdf', 'safety_guidelines.pdf']
    },
    {
      title: 'English Essay',
      description: 'Write a 500-word essay on the importance of education in society',
      batch: batches[0]._id,
      course: courses[4]._id,
      teacher: teachers[4]._id,
      dueDate: getRandomDate(8, 3),
      isActive: true,
      attachments: ['essay_rubric.pdf', 'writing_tips.pdf']
    },
    {
      title: 'Programming Project - Web Application',
      description: 'Create a simple web application using HTML, CSS, and JavaScript',
      batch: batches[2]._id,
      course: courses[5]._id,
      teacher: teachers[0]._id,
      dueDate: getRandomDate(21, 7),
      isActive: true,
      attachments: ['project_requirements.pdf', 'code_examples.zip', 'design_templates.zip']
    }
  ]

  const createdAssignments = await Assignment.insertMany(assignments)
  console.log(`✅ Created ${createdAssignments.length} assignments`)
  return createdAssignments
}

// Seed Submissions
async function seedSubmissions(users, assignments) {
  console.log('📄 Creating submissions...')

  const students = users.filter(u => u.role === 'student')
  const submissions = []

  // Create submissions for some assignments
  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i]
    const numSubmissions = Math.floor(Math.random() * 5) + 3 // 3-7 submissions per assignment

    for (let j = 0; j < numSubmissions && j < students.length; j++) {
      const student = students[j]
      const isLate = Math.random() < 0.2 // 20% chance of being late
      const hasGrade = Math.random() < 0.7 // 70% chance of being graded

      submissions.push({
        assignment: assignment._id,
        student: student._id,
        submittedAt: getRandomDate(-3, 6), // Submitted within last 3 days or next 3 days
        content: `This is ${student.name}'s submission for assignment: ${assignment.title}. The work has been completed according to the required specifications.`,
        attachments: [
          `${student.name.replace(/\s+/g, '_')}_assignment_${i + 1}.pdf`,
          `supporting_files_${i + 1}.zip`
        ],
        grade: hasGrade ? Math.floor(Math.random() * 30) + 70 : undefined, // 70-100 if graded
        feedback: hasGrade ? `Good work by ${student.name}. Needs improvement in some areas.` : undefined,
        isLate: isLate
      })
    }
  }

  const createdSubmissions = await Submission.insertMany(submissions)
  console.log(`✅ Created ${createdSubmissions.length} submissions`)
  return createdSubmissions
}

// Seed Attendance
async function seedAttendance(users, batches) {
  console.log('📊 Creating attendance records...')

  const teachers = users.filter(u => u.role === 'teacher')
  const supervisors = users.filter(u => u.role === 'supervisor')
  const attendanceRecords = []

  // Create attendance for past 10 days for each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex]

    for (let day = 0; day < 10; day++) {
      const attendanceDate = new Date()
      attendanceDate.setDate(attendanceDate.getDate() - day)

      // Skip weekends (Friday and Saturday in some regions)
      if (attendanceDate.getDay() === 5 || attendanceDate.getDay() === 6) continue

      const records = []

      // Create attendance record for each student in the batch
      for (let studentId of batch.students) {
        const attendance = Math.random()
        let status, checkInTime, checkOutTime, notes

        if (attendance > 0.1) { // 90% present
          status = 'present'
          checkInTime = '09:00'
          checkOutTime = '11:00'
          notes = ''
        } else if (attendance > 0.05) { // 5% late
          status = 'late'
          checkInTime = '09:15'
          checkOutTime = '11:00'
          notes = 'Late by 15 minutes'
        } else { // 5% absent
          status = 'absent'
          notes = 'Absent without excuse'
        }

        records.push({
          student: studentId,
          status,
          checkInTime,
          checkOutTime,
          notes
        })
      }

      attendanceRecords.push({
        batch: batch._id,
        date: attendanceDate,
        period: 'First Period',
        records: records,
        createdBy: getRandomElement([...teachers, ...supervisors])._id
      })
    }
  }

  const createdAttendance = await Attendance.insertMany(attendanceRecords)
  console.log(`✅ Created ${createdAttendance.length} attendance records`)
  return createdAttendance
}

// Seed Posts
async function seedPosts(users, batches, courses) {
  console.log('💬 Creating posts...')

  const teachers = users.filter(u => u.role === 'teacher')
  const students = users.filter(u => u.role === 'student')
  const supervisors = users.filter(u => u.role === 'supervisor')

  const posts = [
    {
      title: 'Exam Preparation Tips',
      content: 'Important tips for students to prepare optimally for exams: 1- Time management 2- Continuous review 3- Taking breaks 4- Adequate sleep',
      author: teachers[0]._id,
      batch: batches[0]._id,
      course: courses[0]._id,
      isPinned: false,
      isActive: true,
      attachments: ['study_tips.pdf']
    },
    {
      title: 'Thanks and Appreciation to Outstanding Students',
      content: 'We extend our thanks and appreciation to all students who showed excellence and dedication in the current semester. Keep up the hard work!',
      author: supervisors[0]._id,
      batch: batches[1]._id,
      isPinned: true,
      isActive: true
    },
    {
      title: 'Question about the Lab',
      content: 'Professor Sarah, can you re-explain the chemical reactions experiment? I didn\'t understand some points.',
      author: students[0]._id,
      course: courses[1]._id,
      isPinned: false,
      isActive: true
    },
    {
      title: 'Additional Programming Resources',
      content: 'A collection of useful websites and books for learning programming: \n- Codecademy \n- freeCodeCamp \n- MDN Web Docs \n- Python.org',
      author: teachers[1]._id,
      batch: batches[2]._id,
      course: courses[5]._id,
      isPinned: false,
      isActive: true,
      attachments: ['programming_resources.pdf', 'useful_links.txt']
    },
    {
      title: 'Suggestion for Curriculum Improvement',
      content: 'I suggest adding more practical exercises to the Physics course to enhance understanding of theoretical concepts.',
      author: students[2]._id,
      course: courses[2]._id,
      isPinned: false,
      isActive: true
    },
    {
      title: 'Congratulations on Success',
      content: 'Congratulations to all students who passed the recent test! Excellent results reflecting your continuous effort.',
      author: teachers[3]._id,
      batch: batches[0]._id,
      course: courses[3]._id,
      isPinned: false,
      isActive: true
    }
  ]

  const createdPosts = await Post.insertMany(posts)
  console.log(`✅ Created ${createdPosts.length} posts`)
  return createdPosts
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    await connectDB()
    await clearDatabase()

    const users = await seedUsers()
    const courses = await seedCourses(users)
    const batches = await seedBatches(users, courses)

    // Update courses with batch references
    for (let i = 0; i < courses.length; i++) {
      const batchesToAdd = batches.filter(b => b.courses.includes(courses[i]._id))
      await Course.findByIdAndUpdate(
        courses[i]._id,
        { batches: batchesToAdd.map(b => b._id) }
      )
    }

    const announcements = await seedAnnouncements(users, batches, courses)
    const assignments = await seedAssignments(users, batches, courses)
    const submissions = await seedSubmissions(users, assignments)
    const attendance = await seedAttendance(users, batches)
    const posts = await seedPosts(users, batches, courses)

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   👥 Users: ${users.length}`)
    console.log(`   📚 Courses: ${courses.length}`)
    console.log(`   🎓 Batches: ${batches.length}`)
    console.log(`   📢 Announcements: ${announcements.length}`)
    console.log(`   📝 Assignments: ${assignments.length}`)
    console.log(`   📄 Submissions: ${submissions.length}`)
    console.log(`   📊 Attendance Records: ${attendance.length}`)
    console.log(`   💬 Posts: ${posts.length}`)

    console.log('\n🔑 Login Credentials:')
    console.log('   Admin: admin@school.com / admin123')
    console.log('   Supervisor: supervisor@school.com / super123')
    console.log('   Teacher: khaled.math@school.com / teacher123')
    console.log('   Student: ali.student@school.com / student123')

    // Print testing information
    console.log('\n🧪 Testing Information:')
    const khaledTeacher = users.find(u => u.email === 'khaled.math@school.com')
    const mathBatches = batches.filter(b => b.teachers.includes(khaledTeacher._id))

    console.log(`   Dr. Khaled Ahmed (Teacher ID: ${khaledTeacher._id})`)
    console.log(`   Has access to ${mathBatches.length} batches:`)
    mathBatches.forEach(batch => {
      console.log(`     - ${batch.name} (ID: ${batch._id})`)
    })

    // Also check course-based access
    const khaledCourses = courses.filter(c => c.teachers.includes(khaledTeacher._id))
    const courseBasedBatches = batches.filter(b =>
      b.courses.some(courseId =>
        khaledCourses.some(course => course._id.toString() === courseId.toString())
      )
    )

    console.log(`   Dr. Khaled teaches ${khaledCourses.length} courses:`)
    khaledCourses.forEach(course => {
      console.log(`     - ${course.name} (ID: ${course._id})`)
    })

    console.log(`   Course-based batch access: ${courseBasedBatches.length} batches`)
    courseBasedBatches.forEach(batch => {
      console.log(`     - ${batch.name} (ID: ${batch._id})`)
    })

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
