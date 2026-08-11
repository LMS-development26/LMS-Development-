const { query } = require('../config/database');

// Get reviews for a course
const getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT cr.*,
        sp.full_name as student_name,
        u.email as student_email
      FROM course_reviews cr
      JOIN users u ON cr.student_id = u.id
      JOIN student_profiles sp ON cr.student_id = sp.user_id
      WHERE cr.course_id = $1
      ORDER BY cr.created_at DESC`,
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

// Get single review
const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT cr.*,
        sp.full_name as student_name,
        c.title as course_title
      FROM course_reviews cr
      JOIN users u ON cr.student_id = u.id
      JOIN student_profiles sp ON cr.student_id = sp.user_id
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
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

// Create review
const createReview = async (req, res, next) => {
  try {
    const { course_id, rating, comment } = req.body;
    const student_id = req.user.id;

    // Check if student is enrolled
    const enrollment = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Student must be enrolled to review a course'
      });
    }

    // Check if review already exists
    const existingReview = await query(
      'SELECT id FROM course_reviews WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Review already exists for this course'
      });
    }

    const result = await query(
      `INSERT INTO course_reviews (course_id, student_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, student_id, rating, comment]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update review
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if review belongs to user
    const review = await query(
      'SELECT * FROM course_reviews WHERE id = $1',
      [id]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (review.rows[0].student_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    const result = await query(
      `UPDATE course_reviews
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment)
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if review belongs to user
    const review = await query(
      'SELECT * FROM course_reviews WHERE id = $1',
      [id]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (review.rows[0].student_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    const result = await query(
      'DELETE FROM course_reviews WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get student reviews
const getStudentReviews = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT cr.*,
        c.title as course_title,
        c.thumbnail_url
      FROM course_reviews cr
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.student_id = $1
      ORDER BY cr.created_at DESC`,
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

// Get a student's review for a specific course
const getReviewByCourseAndStudent = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.params;

    const result = await query(
      `SELECT cr.*,
        sp.full_name as student_name
      FROM course_reviews cr
      JOIN student_profiles sp ON cr.student_id = sp.user_id
      WHERE cr.course_id = $1 AND cr.student_id = $2`,
      [courseId, studentId]
    );

    return res.json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error('getReviewByCourseAndStudent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch review',
    });
  }
};

module.exports = {
  getCourseReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getStudentReviews,
  getReviewByCourseAndStudent,
};