const { query } = require('../config/database');

// Get all categories
const listCategories = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM course_categories ORDER BY category_name'
    );

    // Map category_name to name for frontend compatibility
    const categories = result.rows.map(cat => ({
      ...cat,
      name: cat.category_name
    }));

    res.json({
      success: true,
      data: categories
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

    // Map category_name to name for frontend compatibility
    const category = {
      ...result.rows[0],
      name: result.rows[0].category_name
    };

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    // Handle both name and category_name for frontend compatibility
    const { name, category_name, description } = req.body;
    const finalCategoryName = name || category_name;

    const result = await query(
      `INSERT INTO course_categories (category_name, description, created_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [finalCategoryName, description]
    );

    // Map category_name to name for frontend compatibility
    const category = {
      ...result.rows[0],
      name: result.rows[0].category_name
    };

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Handle both name and category_name for frontend compatibility
    const { name, category_name, description } = req.body;
    const finalCategoryName = name || category_name;

    const result = await query(
      `UPDATE course_categories
       SET category_name = COALESCE($1, category_name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [finalCategoryName, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Map category_name to name for frontend compatibility
    const category = {
      ...result.rows[0],
      name: result.rows[0].category_name
    };

    res.json({
      success: true,
      data: category
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