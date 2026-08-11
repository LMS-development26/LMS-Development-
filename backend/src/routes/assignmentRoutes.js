const express = require('express');
const { body } = require('express-validator');
const assignmentController = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createAssignmentValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('title').notEmpty().withMessage('Assignment title is required'),
  body('due_date').notEmpty().withMessage('Due date is required'),
  body('max_marks').isNumeric().withMessage('Max marks must be a number')
];

const createSubmissionValidation = [
  body('assignment_id').notEmpty().withMessage('Assignment ID is required'),
  body('submitted_file_url').notEmpty().withMessage('Submission file URL is required')
];

const gradeSubmissionValidation = [
  body('marks').isNumeric().withMessage('Marks must be a number')
];

// Assignment routes
router.get('/course/:courseId', protect, assignmentController.getAssignmentsByCourse);
router.get('/:id', protect, assignmentController.getAssignment);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createAssignmentValidation, handleValidationErrors, assignmentController.createAssignment);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), assignmentController.updateAssignment);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), assignmentController.deleteAssignment);

// Submission routes
router.get('/:assignmentId/submissions', protect, authorize('INSTRUCTOR', 'ADMIN'), assignmentController.getSubmissions);
router.get('/submissions/student/:studentId', protect, assignmentController.getStudentSubmissions);
router.get('/submissions/my-submissions', protect, assignmentController.getStudentSubmissions);
router.post('/submissions', protect, createSubmissionValidation, handleValidationErrors, assignmentController.createSubmission);
router.put('/submissions/:id/grade', protect, authorize('INSTRUCTOR', 'ADMIN'), gradeSubmissionValidation, handleValidationErrors, assignmentController.gradeSubmission);
router.delete('/submissions/:id', protect, assignmentController.deleteSubmission);

module.exports = router;