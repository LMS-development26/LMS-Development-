const { query, getClient } = require('../config/database');

// Get modules by course
const getModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY display_order',
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

// Get single module
const getModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM course_modules WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
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

// Create new module
const createModule = async (req, res, next) => {
  try {
    const { course_id, name, description, display_order } = req.body;

    // Get next display order if not provided
    let order = display_order;
    if (!order) {
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX(display_order), 0) as max_order FROM course_modules WHERE course_id = $1',
        [course_id]
      );
      order = (maxOrderResult.rows[0].max_order || 0) + 1;
    }

    const result = await query(
      `INSERT INTO course_modules (course_id, module_name, description, display_order, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, name, description, order]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update module
const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, display_order } = req.body;

    const result = await query(
      `UPDATE course_modules
       SET module_name = COALESCE($1, module_name),
           description = COALESCE($2, description),
           display_order = COALESCE($3, display_order)
       WHERE id = $4
       RETURNING *`,
      [name, description, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
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

// Delete module
const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Delete lessons in this module
      const lessonResult = await client.query(
        'SELECT id FROM lessons WHERE module_id = $1',
        [id]
      );

      for (const lesson of lessonResult.rows) {
        // Delete materials in each lesson
        await client.query(
          'DELETE FROM learning_materials WHERE lesson_id = $1',
          [lesson.id]
        );
      }

      // Delete lessons
      await client.query(
        'DELETE FROM lessons WHERE module_id = $1',
        [id]
      );

      // Delete module
      const result = await client.query(
        'DELETE FROM course_modules WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Module deleted successfully'
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

// Reorder modules
const reorderModules = async (req, res, next) => {
  try {
    const { moduleIds } = req.body;

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      for (let i = 0; i < moduleIds.length; i++) {
        await client.query(
          'UPDATE course_modules SET display_order = $1 WHERE id = $2',
          [i + 1, moduleIds[i]]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Modules reordered successfully'
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
  getModulesByCourse,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules
};