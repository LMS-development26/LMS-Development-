const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];

// Review routes — specific paths before /:id
router.get('/course/:courseId', reviewController.getCourseReviews);
router.get('/my-reviews', protect, reviewController.getStudentReviews);
router.get('/student/:studentId', protect, reviewController.getStudentReviews);
router.get('/course/:courseId/student/:studentId', protect, reviewController.getReviewByCourseAndStudent);
router.post('/', protect, createReviewValidation, handleValidationErrors, reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);
router.get('/:id', protect, reviewController.getReview);

module.exports = router;
