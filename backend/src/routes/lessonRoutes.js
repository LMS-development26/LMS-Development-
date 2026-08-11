const express = require('express');
const { body } = require('express-validator');
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createLessonValidation = [
  body('module_id').notEmpty().withMessage('Module ID is required'),
  body('title').notEmpty().withMessage('Lesson title is required')
];

// Routes
router.get('/module/:moduleId', lessonController.getLessonsByModule);
router.get('/:id', lessonController.getLesson);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createLessonValidation, handleValidationErrors, lessonController.createLesson);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), lessonController.updateLesson);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), lessonController.deleteLesson);
router.post('/reorder', protect, authorize('INSTRUCTOR', 'ADMIN'), lessonController.reorderLessons);

module.exports = router;