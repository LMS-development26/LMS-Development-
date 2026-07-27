const { query } = require('../config/database');

// Get enrollment requests for a course (instructor/admin)
const getEnrollmentRequests = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT er.*,
        u.first_name || ' ' || u.last_name as student_name,
        u.email as student_email,
        c.title as course_title
      FROM enrollment_requests er
      JOIN users u ON er.student_id = u.id
      JOIN courses c ON er.course_id = c.id
      WHERE er.course_id = $1
      ORDER BY er.requested_at DESC`,
      [courseId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Create enrollment request
const createEnrollmentRequest = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const student_id = req.user.id;

    // Check if already enrolled
    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course'
      });
    }

    // Check if request already exists
    const existingRequest = await query(
      'SELECT id FROM enrollment_requests WHERE course_id = $1 AND student_id = $2 AND status = $3',
      [course_id, student_id, 'PENDING']
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Enrollment request already pending'
      });
    }

    const result = await query(
      `INSERT INTO enrollment_requests (course_id, student_id, status, requested_at)
       VALUES ($1, $2, 'PENDING', CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, student_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Approve enrollment request
const approveEnrollmentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      // Get request details
      const requestResult = await client.query(
        'SELECT * FROM enrollment_requests WHERE id = $1',
        [id]
      );

      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Enrollment request not found'
        });
      }

      const request = requestResult.rows[0];

      // Update request status
      await client.query(
        `UPDATE enrollment_requests
         SET status = 'APPROVED', reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );

      // Create enrollment
      await client.query(
        `INSERT INTO enrollments (course_id, student_id, enrolled_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [request.course_id, request.student_id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Enrollment request approved and student enrolled'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Reject enrollment request
const rejectEnrollmentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const result = await query(
      `UPDATE enrollment_requests
       SET status = 'REJECTED', 
           rejection_reason = $1,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [rejection_reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment request not found'
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

// Get enrollments for a course
const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT e.*,
        u.first_name || ' ' || u.last_name as student_name,
        u.email as student_email,
        c.title as course_title,
        cp.progress_percentage,
        cp.completed_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN course_progress cp ON e.course_id = cp.course_id AND e.student_id = cp.student_id
      WHERE e.course_id = $1
      ORDER BY e.enrolled_at DESC`,
      [courseId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get student enrollments
const getStudentEnrollments = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT e.*,
        c.title as course_title,
        c.thumbnail_url,
        c.difficulty,
        u.first_name || ' ' || u.last_name as instructor_name,
        cp.progress_percentage,
        cp.completed_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_progress cp ON e.course_id = cp.course_id AND e.student_id = cp.student_id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Direct enrollment (for free courses or admin)
const createEnrollment = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const student_id = req.user.id;

    // Check if already enrolled
    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course'
      });
    }

    const result = await query(
      `INSERT INTO enrollments (course_id, student_id, enrolled_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, student_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Cancel enrollment
const cancelEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM enrollments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnrollmentRequests,
  createEnrollmentRequest,
  approveEnrollmentRequest,
  rejectEnrollmentRequest,
  getCourseEnrollments,
  getStudentEnrollments,
  createEnrollment,
  cancelEnrollment
};