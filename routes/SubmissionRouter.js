const router = require('express').Router()
const controller = require('../controllers/SubmissionController')
const middleware = require('../middleware')

// Student routes (must come first - more specific)

// Submit assignment (for students)
router.post(
  '/student/submit/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  controller.SubmitAssignment
)

// Update student's own submission
router.put(
  '/student/update/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  controller.UpdateStudentSubmission
)

// Get student's submission for specific assignment
router.get(
  '/student/assignment/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentSubmission
)

// Get all submissions for current student
router.get(
  '/student/my-submissions',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetStudentSubmissions
)

// Get submissions by assignment ID (for teachers and admins)
router.get(
  '/assignment/:assignmentId',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.GetSubmissionsByAssignment
)

// General routes

// Get all submissions
router.get(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetAllSubmissions
)

// Get submission by ID
router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.GetSubmissionById
)

// Create submission
router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.CreateSubmission
)

// Update submission (for grading/feedback)
router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  controller.UpdateSubmission
)

// Update submission grade (for teachers) - optimized for the grading view
router.put(
  '/:id/grade',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isTeacherOrAbove,
  async (req, res) => {
    try {
      const { grade, feedback } = req.body;
      const submission = await require('../models').Submission.findById(req.params.id);

      if (!submission) {
        return res.status(404).json({ status: 'Error', msg: 'Submission not found.' });
      }

      submission.grade = grade;
      submission.feedback = feedback;
      await submission.save();

      res.json({
        status: 'Success',
        msg: 'Submission graded successfully.',
        submission
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      res.status(500).json({ status: 'Error', msg: 'Failed to grade submission.' });
    }
  }
)

// Delete submission
router.delete(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  middleware.isAdminOrSupervisor,
  controller.DeleteSubmission
)

module.exports = router