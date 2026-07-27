const { query } = require('../config/database');

// Get lessons by module
const getLessonsByModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const result = await query(
      'SELECT * FROM lessons WHERE module_id = $1 ORDER BY lesson_order',
      [moduleId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single lesson
const getLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM lessons WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
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

// Create new lesson
const createLesson = async (req, res, next) => {
  try {
    const { module_id, lesson_title, description, lesson_order, duration_minutes, is_preview } = req.body;

    // Get next lesson order if not provided
    let order = lesson_order;
    if (!order) {
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX(lesson_order), 0) as max_order FROM lessons WHERE module_id = $1',
        [module_id]
      );
      order = (maxOrderResult.rows[0].max_order || 0) + 1;
    }

    const result = await query(
      `INSERT INTO lessons (module_id, lesson_title, description, lesson_order, duration_minutes, is_preview, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [module_id, lesson_title, description, order, duration_minutes, is_preview || false]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update lesson
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lesson_title, description, lesson_order, duration_minutes, is_preview } = req.body;

    const result = await query(
      `UPDATE lessons
       SET lesson_title = COALESCE($1, lesson_title),
           description = COALESCE($2, description),
           lesson_order = COALESCE($3, lesson_order),
           duration_minutes = COALESCE($4, duration_minutes),
           is_preview = COALESCE($5, is_preview)
       WHERE id = $6
       RETURNING *`,
      [lesson_title, description, lesson_order, duration_minutes, is_preview, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
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

// Delete lesson
const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      // Delete materials in this lesson
      await client.query(
        'DELETE FROM learning_materials WHERE lesson_id = $1',
        [id]
      );

      // Delete lesson
      const result = await client.query(
        'DELETE FROM lessons WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Lesson not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Lesson deleted successfully'
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

module.exports = {
  getLessonsByModule,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
};