const express = require('express');
const { body } = require('express-validator');
const enrollmentController = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createRequestValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required')
];

const createEnrollmentValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required')
];

// Enrollment requests
router.post('/requests', protect, createRequestValidation, handleValidationErrors, enrollmentController.createEnrollmentRequest);
router.get('/requests/course/:courseId', protect, authorize('INSTRUCTOR', 'ADMIN'), enrollmentController.getEnrollmentRequests);
router.put('/requests/:id/approve', protect, authorize('INSTRUCTOR', 'ADMIN'), enrollmentController.approveEnrollmentRequest);
router.put('/requests/:id/reject', protect, authorize('INSTRUCTOR', 'ADMIN'), enrollmentController.rejectEnrollmentRequest);

// Enrollments
router.post('/', protect, createEnrollmentValidation, handleValidationErrors, enrollmentController.createEnrollment);
router.get('/course/:courseId', protect, authorize('INSTRUCTOR', 'ADMIN'), enrollmentController.getCourseEnrollments);
router.get('/student/:studentId', protect, enrollmentController.getStudentEnrollments);
router.get('/my-enrollments', protect, enrollmentController.getStudentEnrollments);
router.delete('/:id', protect, enrollmentController.cancelEnrollment);

module.exports = router;