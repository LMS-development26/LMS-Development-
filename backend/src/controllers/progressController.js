const { query } = require('../config/database');

// Get lesson progress for a student
const getLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const student_id = req.query.studentId || req.user.id;

    const result = await query(
      `SELECT lp.*,
        l.title as lesson_title,
        m.name as module_name,
        c.title as course_title
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      JOIN course_modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE lp.lesson_id = $1 AND lp.student_id = $2`,
      [lessonId, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson progress not found'
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

// Get all lesson progress for a student in a course
const getCourseLessonProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const student_id = req.query.studentId || req.user.id;

    const result = await query(
      `SELECT lp.*,
        l.title as lesson_title,
        l.module_id,
        m.name as module_name,
        m.display_order as module_order
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      JOIN course_modules m ON l.module_id = m.id
      WHERE m.course_id = $1 AND lp.student_id = $2
      ORDER BY m.display_order, l.display_order`,
      [courseId, student_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Update lesson progress
const updateLessonProgress = async (req, res, next) => {
  try {
    const { lesson_id, completed, time_spent_minutes } = req.body;
    const student_id = req.user.id;

    // Check if progress exists
    const existingProgress = await query(
      'SELECT id FROM lesson_progress WHERE lesson_id = $1 AND student_id = $2',
      [lesson_id, student_id]
    );

    let result;
    if (existingProgress.rows.length > 0) {
      // Update existing progress
      const progressId = existingProgress.rows[0].id;
      result = await query(
        `UPDATE lesson_progress
         SET completed = COALESCE($1, completed),
             completed_at = CASE WHEN $1 = true AND completed = false THEN CURRENT_TIMESTAMP ELSE completed_at END,
             time_spent_minutes = time_spent_minutes + COALESCE($2, 0),
             last_accessed_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [completed, time_spent_minutes, progressId]
      );
    } else {
      // Create new progress
      result = await query(
        `INSERT INTO lesson_progress (lesson_id, student_id, completed, completed_at, time_spent_minutes, last_accessed_at)
         VALUES ($1, $2, $3, CASE WHEN $3 = true THEN CURRENT_TIMESTAMP ELSE NULL END, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [lesson_id, student_id, completed || false, time_spent_minutes || 0]
      );
    }

    // Update course progress
    await updateCourseProgress(lesson_id, student_id);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update course progress
const updateCourseProgress = async (lesson_id, student_id) => {
  try {
    // Get course_id from lesson
    const lessonResult = await query(
      `SELECT m.course_id FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE l.id = $1`,
      [lesson_id]
    );

    if (lessonResult.rows.length === 0) return;

    const course_id = lessonResult.rows[0].course_id;

    // Get total lessons in course
    const totalLessonsResult = await query(
      `SELECT COUNT(*) as total FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE m.course_id = $1`,
      [course_id]
    );

    const total_lessons = parseInt(totalLessonsResult.rows[0].total);

    // Get completed lessons for student
    const completedLessonsResult = await query(
      `SELECT COUNT(*) as completed FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN course_modules m ON l.module_id = m.id
       WHERE m.course_id = $1 AND lp.student_id = $2 AND lp.completed = true`,
      [course_id, student_id]
    );

    const completed_lessons = parseInt(completedLessonsResult.rows[0].completed);

    // Get total learning time
    const totalTimeResult = await query(
      `SELECT COALESCE(SUM(time_spent_minutes), 0) as total FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN course_modules m ON l.module_id = m.id
       WHERE m.course_id = $1 AND lp.student_id = $2`,
      [course_id, student_id]
    );

    const total_learning_time_minutes = parseInt(totalTimeResult.rows[0].total);

    // Calculate progress percentage
    const progress_percentage = total_lessons > 0 ? (completed_lessons / total_lessons) * 100 : 0;

    // Check if course is completed
    const is_completed = completed_lessons === total_lessons && total_lessons > 0;

    // Update or create course progress
    const existingCourseProgress = await query(
      'SELECT id FROM course_progress WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (existingCourseProgress.rows.length > 0) {
      const progressId = existingCourseProgress.rows[0].id;
      await query(
        `UPDATE course_progress
         SET completed_lessons = $1,
             total_lessons = $2,
             progress_percentage = $3,
             total_learning_time_minutes = $4,
             completed_at = CASE WHEN $5 = true AND completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END,
             last_accessed_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [completed_lessons, total_lessons, progress_percentage, total_learning_time_minutes, is_completed, progressId]
      );
    } else {
      await query(
        `INSERT INTO course_progress (course_id, student_id, completed_lessons, total_lessons, progress_percentage, total_learning_time_minutes, completed_at, last_accessed_at)
         VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $7 = true THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)`,
        [course_id, student_id, completed_lessons, total_lessons, progress_percentage, total_learning_time_minutes, is_completed]
      );
    }
  } catch (error) {
    console.error('Error updating course progress:', error);
  }
};

// Get course progress for a student
const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const student_id = req.query.studentId || req.user.id;

    const result = await query(
      `SELECT cp.*,
        c.title as course_title,
        c.thumbnail_url
      FROM course_progress cp
      JOIN courses c ON cp.course_id = c.id
      WHERE cp.course_id = $1 AND cp.student_id = $2`,
      [courseId, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course progress not found'
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

// Get all course progress for a student
const getStudentProgress = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT cp.*,
        c.title as course_title,
        c.thumbnail_url,
        c.difficulty,
        u.first_name || ' ' || u.last_name as instructor_name
      FROM course_progress cp
      JOIN courses c ON cp.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      WHERE cp.student_id = $1
      ORDER BY cp.last_accessed_at DESC`,
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

// Get progress overview for a course (instructor view)
const getCourseProgressOverview = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT cp.*,
        u.first_name || ' ' || u.last_name as student_name,
        u.email as student_email
      FROM course_progress cp
      JOIN users u ON cp.student_id = u.id
      WHERE cp.course_id = $1
      ORDER BY cp.progress_percentage DESC`,
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

// Reset lesson progress (for testing or instructor override)
const resetLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const student_id = req.body.studentId || req.user.id;

    const result = await query(
      `UPDATE lesson_progress
       SET completed = false,
           completed_at = NULL,
           time_spent_minutes = 0,
           last_accessed_at = CURRENT_TIMESTAMP
       WHERE lesson_id = $1 AND student_id = $2
       RETURNING *`,
      [lessonId, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson progress not found'
      });
    }

    // Update course progress
    await updateCourseProgress(lessonId, student_id);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLessonProgress,
  getCourseLessonProgress,
  updateLessonProgress,
  getCourseProgress,
  getStudentProgress,
  getCourseProgressOverview,
  resetLessonProgress
};