const { query } = require('../config/database');

// Get materials by lesson
const getMaterialsByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const result = await query(
      'SELECT * FROM learning_materials WHERE lesson_id = $1 ORDER BY display_order',
      [lessonId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single material
const getMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM learning_materials WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
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

// Create new material
const createMaterial = async (req, res, next) => {
  try {
    const { lesson_id, type, title, description, s3_url, external_url, file_size_bytes, file_type, display_order } = req.body;

    // Get next display order if not provided
    let order = display_order;
    if (!order) {
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX(display_order), 0) as max_order FROM learning_materials WHERE lesson_id = $1',
        [lesson_id]
      );
      order = (maxOrderResult.rows[0].max_order || 0) + 1;
    }

    const result = await query(
      `INSERT INTO learning_materials (lesson_id, type, title, description, s3_url, external_url, file_size_bytes, file_type, display_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       RETURNING *`,
      [lesson_id, type, title, description, s3_url, external_url, file_size_bytes, file_type, order]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update material
const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, title, description, s3_url, external_url, file_size_bytes, file_type, display_order } = req.body;

    const result = await query(
      `UPDATE learning_materials
       SET type = COALESCE($1, type),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           s3_url = COALESCE($4, s3_url),
           external_url = COALESCE($5, external_url),
           file_size_bytes = COALESCE($6, file_size_bytes),
           file_type = COALESCE($7, file_type),
           display_order = COALESCE($8, display_order)
       WHERE id = $9
       RETURNING *`,
      [type, title, description, s3_url, external_url, file_size_bytes, file_type, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
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

// Delete material
const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM learning_materials WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterialsByLesson,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
};