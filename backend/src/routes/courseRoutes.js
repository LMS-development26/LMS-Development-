const express = require('express');
const { body } = require('express-validator');
const courseController = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createCourseValidation = [
  body('title').notEmpty().withMessage('Course title is required'),
  body('category_id').notEmpty().withMessage('Category is required'),
  body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Invalid difficulty level')
];

// Routes
router.get('/', courseController.listCourses);
router.get('/:id', courseController.getCourse);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createCourseValidation, handleValidationErrors, courseController.createCourse);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), courseController.updateCourse);
router.patch('/:id/status', protect, authorize('INSTRUCTOR', 'ADMIN'), courseController.updateCourseStatus);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), courseController.deleteCourse);
router.post('/:id/duplicate', protect, authorize('INSTRUCTOR', 'ADMIN'), courseController.duplicateCourse);

module.exports = router;