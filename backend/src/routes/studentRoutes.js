const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

const router = express.Router();

// Public routes (keep for backward compatibility)
router.get('/profile/:userId', studentController.getProfile);

// Protected routes (require JWT authentication)
router.get('/profile', protect, studentController.getMyProfile);
router.put('/profile', protect, studentController.updateMyProfile);
router.get('/courses', protect, studentController.getMyCourses);
router.get('/courses/:id', protect, studentController.getCourseDetails);
router.get('/dashboard', protect, studentController.getDashboardData);
router.get('/activity', protect, studentController.getActivityHistory);

module.exports = router;