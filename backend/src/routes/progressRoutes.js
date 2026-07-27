const express = require('express');
const { body } = require('express-validator');
const progressController = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const updateProgressValidation = [
  body('lesson_id').notEmpty().withMessage('Lesson ID is required'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('time_spent_minutes').optional().isNumeric().withMessage('Time spent must be a number')
];

// Lesson progress routes
router.get('/lesson/:lessonId', protect, progressController.getLessonProgress);
router.get('/course/:courseId/lessons', protect, progressController.getCourseLessonProgress);
router.post('/lesson', protect, updateProgressValidation, handleValidationErrors, progressController.updateLessonProgress);
router.post('/lesson/:lessonId/reset', protect, authorize('INSTRUCTOR', 'ADMIN'), progressController.resetLessonProgress);

// Course progress routes
router.get('/course/:courseId', protect, progressController.getCourseProgress);
router.get('/student/:studentId', protect, progressController.getStudentProgress);
router.get('/my-progress', protect, progressController.getStudentProgress);
router.get('/course/:courseId/overview', protect, authorize('INSTRUCTOR', 'ADMIN'), progressController.getCourseProgressOverview);

module.exports = router;