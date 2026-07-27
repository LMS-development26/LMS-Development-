const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string')
];

// Review routes
router.get('/course/:courseId', reviewController.getCourseReviews);
router.get('/:id', protect, reviewController.getReview);
router.post('/', protect, createReviewValidation, handleValidationErrors, reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);
router.get('/student/:studentId', protect, reviewController.getStudentReviews);
router.get('/my-reviews', protect, reviewController.getStudentReviews);

module.exports = router;