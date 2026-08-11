const { query, getClient } = require('../config/database');

// Get assignments by course
const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT a.*,
        c.title as course_title
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.course_id = $1
      ORDER BY a.due_date ASC`,
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

// Get single assignment
const getAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT a.*,
        c.title as course_title
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
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

// Create new assignment
const createAssignment = async (req, res, next) => {
  try {
    const { course_id, title, description, instructions, due_date, max_marks } = req.body;

    const result = await query(
      `INSERT INTO assignments (course_id, title, description, instructions, due_date, max_marks, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, title, description, instructions, due_date, max_marks]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update assignment
const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, instructions, due_date, max_marks } = req.body;

    const result = await query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           instructions = COALESCE($3, instructions),
           due_date = COALESCE($4, due_date),
           max_marks = COALESCE($5, max_marks)
       WHERE id = $6
       RETURNING *`,
      [title, description, instructions, due_date, max_marks, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
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

// Delete assignment
const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Delete submissions for this assignment
      await client.query(
        'DELETE FROM assignments_submissions WHERE assignment_id = $1',
        [id]
      );

      // Delete assignment
      const result = await client.query(
        'DELETE FROM assignments WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Assignment deleted successfully'
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

// Get submissions for an assignment
const getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const result = await query(
      `SELECT s.*,
        sp.full_name as student_name,
        u.email as student_email,
        a.title as assignment_title
      FROM assignments_submissions s
      JOIN users u ON s.student_id = u.id
      JOIN student_profiles sp ON s.student_id = sp.user_id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at DESC`,
      [assignmentId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get student submissions
const getStudentSubmissions = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT s.*,
        a.title as assignment_title,
        a.due_date,
        a.max_marks,
        c.title as course_title
      FROM assignments_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.student_id = $1
      ORDER BY s.submitted_at DESC`,
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

// Create submission
const createSubmission = async (req, res, next) => {
  try {
    const { assignment_id, submitted_file_url } = req.body;
    const student_id = req.user.id;

    // Check if already submitted
    const existingSubmission = await query(
      'SELECT id FROM assignments_submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignment_id, student_id]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Assignment already submitted'
      });
    }

    const result = await query(
      `INSERT INTO assignments_submissions (assignment_id, student_id, submission_url, submitted_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [assignment_id, student_id, submitted_file_url]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Grade submission
const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    const result = await query(
      `UPDATE assignments_submissions
       SET marks_obtained = $1,
           feedback = $2,
           graded_at = CURRENT_TIMESTAMP,
           graded_by = $3
       WHERE id = $4
       RETURNING *`,
      [marks, feedback, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
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

// Delete submission
const deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM assignments_submissions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignmentsByCourse,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  getStudentSubmissions,
  createSubmission,
  gradeSubmission,
  deleteSubmission
};