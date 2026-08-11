const express = require('express');
const { body } = require('express-validator');
const tagController = require('../controllers/tagController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createTagValidation = [
  body('tag_name').notEmpty().withMessage('Tag name is required')
];

// Tag routes
router.get('/', tagController.listTags);
router.get('/:id', tagController.getTag);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createTagValidation, handleValidationErrors, tagController.createTag);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), tagController.updateTag);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), tagController.deleteTag);

module.exports = router;
