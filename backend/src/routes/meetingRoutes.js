const express = require('express');
const { body } = require('express-validator');
const meetingController = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createMeetingValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
  body('title').notEmpty().withMessage('Meeting title is required'),
  body('meeting_date').notEmpty().withMessage('Meeting date is required'),
  body('start_time').notEmpty().withMessage('Start time is required'),
  body('end_time').notEmpty().withMessage('End time is required'),
  body('google_meet_link').notEmpty().withMessage('Google Meet link is required')
];

// Meeting routes
router.get('/course/:courseId', protect, meetingController.getMeetingsByCourse);
router.get('/:id', protect, meetingController.getMeeting);
router.post('/', protect, authorize('INSTRUCTOR', 'ADMIN'), createMeetingValidation, handleValidationErrors, meetingController.createMeeting);
router.put('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), meetingController.updateMeeting);
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), meetingController.deleteMeeting);

// Attendance routes
router.get('/:meetingId/attendance', protect, authorize('INSTRUCTOR', 'ADMIN'), meetingController.getAttendance);
router.post('/:meetingId/join', protect, meetingController.joinMeeting);
router.post('/:meetingId/leave', protect, meetingController.leaveMeeting);
router.get('/attendance/student/:studentId', protect, meetingController.getStudentAttendance);
router.get('/attendance/my-attendance', protect, meetingController.getStudentAttendance);

module.exports = router;