const express = require('express');
const { body } = require('express-validator');
const quizController = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createQuizValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('title').notEmpty().withMessage('Quiz title is required'),
  body('passing_percentage').isNumeric().withMessage('Passing percentage must be a number')
];

const createQuestionValidation = [
  body('quiz_id').notEmpty().withMessage('Quiz ID is required'),
  body('question_text').notEmpty().withMessage('Question text is required'),
  body('question_type').notEmpty().withMessage('Question type is required')
];

const createOptionValidation = [
  body('question_id').notEmpty().withMessage('Question ID is required'),
  body('option_text').notEmpty().withMessage('Option text is required')
];

const startAttemptValidation = [
  body('quiz_id').notEmpty().withMessage('Quiz ID is required')
];

const submitAttemptValidation = [
  body('attempt_id').notEmpty().withMessage('Attempt ID is required'),
  body('answers').isArray().withMessage('Answers must be an array')
];

// Quiz routes
router.get('/course/:courseId', protect, quizController.getQuizzesByCourse);
router.get('/:id', protect, quizController.getQuiz);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createQuizValidation, handleValidationErrors, quizController.createQuiz);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.updateQuiz);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.deleteQuiz);

// Question routes
router.post('/questions', protect, authorize('INSTRUCTOR', 'ADMIN'), createQuestionValidation, handleValidationErrors, quizController.createQuestion);
router.put('/questions/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.updateQuestion);
router.delete('/questions/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.deleteQuestion);

// Option routes
router.post('/options', protect, authorize('INSTRUCTOR', 'ADMIN'), createOptionValidation, handleValidationErrors, quizController.createOption);
router.put('/options/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.updateOption);
router.delete('/options/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.deleteOption);

// Attempt routes
router.post('/attempts/start', protect, startAttemptValidation, handleValidationErrors, quizController.startAttempt);
router.post('/attempts/submit', protect, submitAttemptValidation, handleValidationErrors, quizController.submitAttempt);
router.get('/attempts/results/:studentId', protect, quizController.getQuizResults);
router.get('/attempts/my-results', protect, quizController.getQuizResults);
router.get('/attempts/quiz/:quizId', protect, authorize('INSTRUCTOR', 'ADMIN'), quizController.getQuizAttempts);

module.exports = router;