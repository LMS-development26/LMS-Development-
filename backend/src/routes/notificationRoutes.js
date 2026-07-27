const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createNotificationValidation = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('type').notEmpty().withMessage('Notification type is required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required')
];

// Notification routes
router.get('/user/:userId', protect, notificationController.getUserNotifications);
router.get('/my-notifications', protect, notificationController.getUserNotifications);
router.get('/unread-count/:userId', protect, notificationController.getUnreadCount);
router.get('/my-unread-count', protect, notificationController.getUnreadCount);
router.get('/:id', protect, notificationController.getNotification);
router.post('/', protect, authorize('ADMIN'), createNotificationValidation, handleValidationErrors, notificationController.createNotification);
router.put('/:id/read', protect, notificationController.markAsRead);
router.put('/user/:userId/read-all', protect, notificationController.markAllAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;