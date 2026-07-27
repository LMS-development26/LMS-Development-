const express = require('express');
const { body } = require('express-validator');
const moduleController = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createModuleValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('module_name').notEmpty().withMessage('Module name is required')
];

// Routes
router.get('/course/:courseId', moduleController.getModulesByCourse);
router.get('/:id', moduleController.getModule);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createModuleValidation, handleValidationErrors, moduleController.createModule);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), moduleController.updateModule);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), moduleController.deleteModule);

module.exports = router;