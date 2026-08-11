const express = require('express');
const { body } = require('express-validator');
const instructorController = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createProfileValidation = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('full_name').notEmpty().withMessage('Full name is required')
];

// Routes
router.get('/profile/:userId', instructorController.getProfile);
router.post('/profile', protect, authorize('INSTRUCTOR', 'ADMIN'), createProfileValidation, handleValidationErrors, instructorController.createProfile);
router.put('/profile/:userId', protect, authorize('INSTRUCTOR', 'ADMIN'), instructorController.updateProfile);

module.exports = router;