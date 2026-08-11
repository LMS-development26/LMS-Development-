const { query } = require('../config/database');

// Get instructor profile
const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT ip.*, u.email, u.role, u.status, u.created_at
       FROM instructor_profiles ip
       JOIN users u ON ip.user_id = u.id
       WHERE ip.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Instructor profile not found'
      });
    }

    const profile = result.rows[0];

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Create instructor profile
const createProfile = async (req, res, next) => {
  try {
    const { user_id, full_name, profile_image_url, profile_image, phone_number, bio, qualification, experience_years, linkedin_url } = req.body;

    const result = await query(
      `INSERT INTO instructor_profiles (user_id, full_name, profile_image_url, profile_image, phone_number, bio, qualification, experience_years, linkedin_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user_id, full_name, profile_image_url, profile_image, phone_number, bio, qualification, experience_years, linkedin_url]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update instructor profile
const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { full_name, profile_image_url, profile_image, phone_number, bio, qualification, experience_years, linkedin_url } = req.body;

    const result = await query(
      `UPDATE instructor_profiles
       SET full_name = COALESCE($1, full_name),
           profile_image_url = COALESCE($2, profile_image_url),
           profile_image = COALESCE($3, profile_image),
           phone_number = COALESCE($4, phone_number),
           bio = COALESCE($5, bio),
           qualification = COALESCE($6, qualification),
           experience_years = COALESCE($7, experience_years),
           linkedin_url = COALESCE($8, linkedin_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $9
       RETURNING *`,
      [full_name, profile_image_url, profile_image, phone_number, bio, qualification, experience_years, linkedin_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Instructor profile not found'
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

module.exports = {
  getProfile,
  createProfile,
  updateProfile
};