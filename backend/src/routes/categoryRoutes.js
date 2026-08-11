const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createCategoryValidation = [
  body()
    .custom((value, { req }) => {
      if (!req.body.name && !req.body.category_name) {
        throw new Error('Category name is required');
      }
      return true;
    })
];

// Routes
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', protect, authorize('ADMIN'), createCategoryValidation, handleValidationErrors, categoryController.createCategory);
router.put('/:id', protect, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;