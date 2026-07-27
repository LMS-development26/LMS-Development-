const { query } = require('../config/database');

// Get all categories
const listCategories = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM course_categories ORDER BY category_name'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single category
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM course_categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
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

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { category_name, description } = req.body;

    const result = await query(
      `INSERT INTO course_categories (category_name, description, created_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [category_name, description]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    const result = await query(
      `UPDATE course_categories
       SET category_name = COALESCE($1, category_name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [category_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
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

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM course_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};