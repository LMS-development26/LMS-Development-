const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createCategoryValidation = [
  body('category_name').notEmpty().withMessage('Category name is required')
];

// Routes
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', protect, authorize('ADMIN'), createCategoryValidation, handleValidationErrors, categoryController.createCategory);
router.put('/:id', protect, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;