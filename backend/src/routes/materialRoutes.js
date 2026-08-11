const express = require('express');
const { body } = require('express-validator');
const materialController = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createMaterialValidation = [
  body('lesson_id').notEmpty().withMessage('Lesson ID is required'),
  body('type').notEmpty().withMessage('Material type is required'),
  body('title').notEmpty().withMessage('Material title is required')
];

// Routes
router.get('/lesson/:lessonId', materialController.getMaterialsByLesson);
router.get('/:id', materialController.getMaterial);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createMaterialValidation, handleValidationErrors, materialController.createMaterial);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), materialController.updateMaterial);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), materialController.deleteMaterial);

module.exports = router;