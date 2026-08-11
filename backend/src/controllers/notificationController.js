const { query } = require('../config/database');

// Get notifications for a user
const getUserNotifications = async (req, res, next) => {
  try {
    const user_id = req.params.userId || req.user.id;
    const { unread_only } = req.query;

    let queryText = `
      SELECT n.*
      FROM notifications n
      WHERE n.user_id = $1
    `;

    const params = [user_id];

    if (unread_only === 'true') {
      queryText += ' AND n.is_read = false';
    }

    queryText += ' ORDER BY n.created_at DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single notification
const getNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT n.*
      FROM notifications n
      WHERE n.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create notification
const createNotification = async (req, res, next) => {
  try {
    const { user_id, notification_type, title, message } = req.body;

    const result = await query(
      `INSERT INTO notifications (user_id, notification_type, title, message, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user_id, notification_type, title, message]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res, next) => {
  try {
    const user_id = req.params.userId || req.user.id;

    const result = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false
       RETURNING *`,
      [user_id]
    );

    res.json({
      success: true,
      data: {
        count: result.rows.length,
        notifications: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count for a user
const getUnreadCount = async (req, res, next) => {
  try {
    const user_id = req.params.userId || req.user.id;

    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [user_id]
    );

    res.json({
      success: true,
      data: {
        unread_count: parseInt(result.rows[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create notification for enrollment approval
const createEnrollmentApprovalNotification = async (student_id, course_id, status) => {
  try {
    const notification_type = status === 'APPROVED' ? 'ENROLLMENT_APPROVED' : 'ENROLLMENT_REJECTED';
    const title = status === 'APPROVED' ? 'Enrollment Approved' : 'Enrollment Rejected';
    const message = status === 'APPROVED'
      ? 'Your enrollment request has been approved. You can now access the course.'
      : 'Your enrollment request has been rejected.';

    await query(
      `INSERT INTO notifications (user_id, notification_type, title, message, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [student_id, notification_type, title, message]
    );
  } catch (error) {
    console.error('Error creating enrollment notification:', error);
  }
};

// Helper function to create notification for assignment
const createAssignmentNotification = async (student_id, type) => {
  try {
    let title, message;

    switch (type) {
      case 'ASSIGNMENT_DEADLINE':
        title = 'Assignment Deadline Approaching';
        message = 'An assignment deadline is approaching. Please submit your work on time.';
        break;
      case 'ASSIGNMENT_GRADED':
        title = 'Assignment Graded';
        message = 'Your assignment has been graded. Check your feedback.';
        break;
      default:
        title = 'Assignment Update';
        message = 'There is an update regarding your assignment.';
    }

    await query(
      `INSERT INTO notifications (user_id, notification_type, title, message, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [student_id, type, title, message]
    );
  } catch (error) {
    console.error('Error creating assignment notification:', error);
  }
};

// Helper function to create notification for quiz
const createQuizNotification = async (student_id, type) => {
  try {
    let title, message;

    switch (type) {
      case 'QUIZ_RESULT':
        title = 'Quiz Result Available';
        message = 'Your quiz results are now available.';
        break;
      default:
        title = 'Quiz Update';
        message = 'There is an update regarding your quiz.';
    }

    await query(
      `INSERT INTO notifications (user_id, notification_type, title, message, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [student_id, type, title, message]
    );
  } catch (error) {
    console.error('Error creating quiz notification:', error);
  }
};

// Helper function to create notification for meeting
const createMeetingNotification = async (student_id, type) => {
  try {
    let title, message;

    switch (type) {
      case 'MEETING_UPCOMING':
        title = 'Upcoming Live Class';
        message = 'A live class is scheduled soon. Don\'t miss it!';
        break;
      default:
        title = 'Meeting Update';
        message = 'There is an update regarding your live class.';
    }

    await query(
      `INSERT INTO notifications (user_id, notification_type, title, message, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [student_id, type, title, message]
    );
  } catch (error) {
    console.error('Error creating meeting notification:', error);
  }
};

// Helper function to create notification for course announcement
const createCourseAnnouncementNotification = async (user_ids, title, message) => {
  try {
    for (const user_id of user_ids) {
      await query(
        `INSERT INTO notifications (user_id, notification_type, title, message, created_at)
         VALUES ($1, 'COURSE_ANNOUNCEMENT', $2, $3, CURRENT_TIMESTAMP)`,
        [user_id, title, message]
      );
    }
  } catch (error) {
    console.error('Error creating course announcement notification:', error);
  }
};

module.exports = {
  getUserNotifications,
  getNotification,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createEnrollmentApprovalNotification,
  createAssignmentNotification,
  createQuizNotification,
  createMeetingNotification,
  createCourseAnnouncementNotification
};