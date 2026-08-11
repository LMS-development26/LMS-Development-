const { query } = require('../config/database');

// Get all tags
const listTags = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, tag_name as name, description, created_at FROM course_tags ORDER BY tag_name ASC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single tag
const getTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, tag_name as name, description, created_at FROM course_tags WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
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

// Create tag
const createTag = async (req, res, next) => {
  try {
    const { tag_name, description } = req.body;

    const result = await query(
      `INSERT INTO course_tags (tag_name, description, created_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING id, tag_name as name, description, created_at`,
      [tag_name, description]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update tag
const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tag_name, description } = req.body;

    const result = await query(
      `UPDATE course_tags
       SET tag_name = COALESCE($1, tag_name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING id, tag_name as name, description, created_at`,
      [tag_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
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

// Delete tag
const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM course_tags WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
};
